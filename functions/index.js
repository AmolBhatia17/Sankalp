const crypto = require("node:crypto");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const Razorpay = require("razorpay");

initializeApp();

const db = getFirestore();
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");

const REGION = "asia-south1";

function getRazorpay() {
  return new Razorpay({
    key_id: razorpayKeyId.value(),
    key_secret: razorpayKeySecret.value(),
  });
}

function requireUser(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in first.");
  }
  return request.auth.uid;
}

function safeSignatureCompare(expected, received) {
  if (
    typeof received !== "string" ||
    !/^[a-f0-9]{64}$/i.test(received)
  ) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

exports.migrateCourseResources = onCall(
  { region: REGION, enforceAppCheck: false },
  async (request) => {
    const uid = requireUser(request);

    if (request.auth.token.admin !== true) {
      throw new HttpsError("permission-denied", "Administrator access required.");
    }

    const courses = request.data?.courses;

    if (!Array.isArray(courses) || courses.length < 1 || courses.length > 10) {
      throw new HttpsError("invalid-argument", "Invalid course list.");
    }

    if (Buffer.byteLength(JSON.stringify(courses), "utf8") > 800000) {
      throw new HttpsError("invalid-argument", "Migration payload is too large.");
    }

    const seen = new Set();
    const batch = db.batch();
    let totalModules = 0;

    function validateResources(items, seenResourceIds) {
      if (!Array.isArray(items) || items.length > 100) {
        throw new HttpsError("invalid-argument", "Invalid or oversized resource list.");
      }

      for (const item of items) {
        if (
          !item ||
          typeof item.id !== "string" || !item.id.trim() || item.id.length > 120 ||
          typeof item.title !== "string" || !item.title.trim() || item.title.length > 250 ||
          typeof item.file !== "string" || !item.file.trim() || item.file.length > 500 ||
          typeof item.type !== "string" || !item.type.trim() || item.type.length > 50 ||
          typeof item.url !== "string" || item.url.length > 2048
        ) {
          throw new HttpsError("invalid-argument", "Invalid resource entry.");
        }

        if (seenResourceIds.has(item.id)) {
          throw new HttpsError("invalid-argument", "Duplicate resource ID in module.");
        }
        seenResourceIds.add(item.id);

        let parsed;
        try {
          parsed = new URL(item.url);
        } catch {
          throw new HttpsError("invalid-argument", "Invalid resource URL.");
        }

        if (
          parsed.protocol !== "https:" ||
          !["drive.google.com", "docs.google.com"].includes(parsed.hostname) ||
          parsed.username ||
          parsed.password ||
          parsed.port
        ) {
          throw new HttpsError("invalid-argument", "Only approved Google Drive URLs are allowed.");
        }

        if (
          item.driveFileId !== undefined &&
          (typeof item.driveFileId !== "string" || item.driveFileId.length > 200)
        ) {
          throw new HttpsError("invalid-argument", "Invalid Drive file ID.");
        }
      }
    }

    for (const item of courses) {
      const courseId = item?.courseId;
      const modules = item?.modules;

      if (
        typeof courseId !== "string" ||
        !/^[a-zA-Z0-9_-]{1,120}$/.test(courseId) ||
        seen.has(courseId) ||
        !Array.isArray(modules) ||
        modules.length > 100
      ) {
        throw new HttpsError("invalid-argument", "Invalid course resource data.");
      }

      seen.add(courseId);

      const seenModuleIds = new Set();

      for (const module of modules) {
        if (
          !module ||
          typeof module.id !== "string" || !module.id.trim() || module.id.length > 120 ||
          typeof module.title !== "string" || !module.title.trim() || module.title.length > 250 ||
          seenModuleIds.has(module.id)
        ) {
          throw new HttpsError("invalid-argument", "Invalid or duplicate module data.");
        }

        seenModuleIds.add(module.id);

        const seenResourceIds = new Set();
        validateResources(module.parts || [], seenResourceIds);
        validateResources(module.videos || [], seenResourceIds);
      }

      totalModules += modules.length;

      const courseSnapshot = await db.collection("courses").doc(courseId).get();

      if (!courseSnapshot.exists) {
        throw new HttpsError("failed-precondition", `Course ${courseId} must be seeded first.`);
      }

      batch.set(db.collection("courseResources").doc(courseId), {
        courseId,
        modules,
        updatedAt: FieldValue.serverTimestamp(),
        migratedBy: uid,
      });
    }

    await batch.commit();

    logger.info("Course resources migrated", {
      adminUid: uid,
      courses: courses.length,
      modules: totalModules,
    });

    return {
      success: true,
      coursesMigrated: courses.length,
      modulesMigrated: totalModules,
    };
  }
);

exports.createRazorpayOrder = onCall(
  {
    region: REGION,
    secrets: [razorpayKeyId, razorpayKeySecret],
    enforceAppCheck: false,
  },
  async (request) => {
    const uid = requireUser(request);
    const courseId = request.data?.courseId;

    if (typeof courseId !== "string" || !/^[a-zA-Z0-9_-]{1,120}$/.test(courseId)) {
      throw new HttpsError("invalid-argument", "Invalid course.");
    }

    const courseRef = db.collection("courses").doc(courseId);
    const enrollmentId = `${uid}_${courseId}`;
    const enrollmentRef = db.collection("enrollments").doc(enrollmentId);

    const [courseSnapshot, enrollmentSnapshot] = await Promise.all([
      courseRef.get(),
      enrollmentRef.get(),
    ]);

    if (!courseSnapshot.exists) {
      throw new HttpsError("not-found", "Course not found.");
    }

    const course = courseSnapshot.data();

    if (course.status !== "published") {
      throw new HttpsError("failed-precondition", "This course is not available.");
    }

    if (
      enrollmentSnapshot.exists &&
      enrollmentSnapshot.data().status === "active"
    ) {
      throw new HttpsError("already-exists", "You are already enrolled.");
    }

    const priceInRupees = Number(course.price);

    if (
      !Number.isSafeInteger(priceInRupees) ||
      priceInRupees <= 0 ||
      priceInRupees > 100000
    ) {
      logger.error("Invalid course price", { courseId, price: course.price });
      throw new HttpsError("failed-precondition", "Course price is invalid.");
    }

    const amount = priceInRupees * 100;
    const razorpay = getRazorpay();

    let order;

    try {
      order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `course_${courseId}_${Date.now()}`.slice(0, 40),
        notes: { uid, courseId },
      });
    } catch (error) {
      logger.error("Razorpay order creation failed", error);
      throw new HttpsError("internal", "Could not create payment order.");
    }

    await db.collection("paymentOrders").doc(order.id).set({
      uid,
      courseId,
      amount,
      currency: "INR",
      status: "created",
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId.value(),
      courseName: course.title || "Course",
    };
  }
);

exports.verifyRazorpayPayment = onCall(
  {
    region: REGION,
    secrets: [razorpayKeyId, razorpayKeySecret],
    enforceAppCheck: false,
  },
  async (request) => {
    const uid = requireUser(request);
    const {
      courseId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = request.data || {};

    if (
      typeof courseId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,120}$/.test(courseId) ||
      typeof orderId !== "string" ||
      !/^order_[a-zA-Z0-9]+$/.test(orderId) ||
      typeof paymentId !== "string" ||
      !/^pay_[a-zA-Z0-9]+$/.test(paymentId) ||
      typeof signature !== "string"
    ) {
      throw new HttpsError("invalid-argument", "Payment details are incomplete.");
    }

    const orderRef = db.collection("paymentOrders").doc(orderId);
    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists) {
      throw new HttpsError("not-found", "Payment order not found.");
    }

    const savedOrder = orderSnapshot.data();

    if (savedOrder.uid !== uid || savedOrder.courseId !== courseId) {
      throw new HttpsError("permission-denied", "This payment order does not belong to you.");
    }

    if (
      savedOrder.status !== "created" &&
      !(savedOrder.status === "verified" && savedOrder.paymentId === paymentId)
    ) {
      throw new HttpsError("failed-precondition", "This payment order cannot be verified again.");
    }

    if (
      !Number.isSafeInteger(savedOrder.amount) ||
      savedOrder.amount <= 0 ||
      savedOrder.currency !== "INR"
    ) {
      throw new HttpsError("failed-precondition", "Stored payment order details are invalid.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret.value())
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (!safeSignatureCompare(expectedSignature, signature)) {
      throw new HttpsError("permission-denied", "Payment signature verification failed.");
    }

    const razorpay = getRazorpay();
    let payment;

    try {
      payment = await razorpay.payments.fetch(paymentId);
    } catch (error) {
      logger.error("Razorpay payment lookup failed", error);
      throw new HttpsError("unavailable", "Could not verify payment with Razorpay.");
    }

    if (
      payment.order_id !== orderId ||
      payment.amount !== savedOrder.amount ||
      payment.currency !== savedOrder.currency ||
      payment.status !== "captured"
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Payment is not successfully captured. Please contact support if money was deducted."
      );
    }

    const courseRef = db.collection("courses").doc(courseId);
    const enrollmentRef = db.collection("enrollments").doc(`${uid}_${courseId}`);

    await db.runTransaction(async (transaction) => {
      const [latestOrder, latestEnrollment, courseSnapshot] = await Promise.all([
        transaction.get(orderRef),
        transaction.get(enrollmentRef),
        transaction.get(courseRef),
      ]);

      if (!latestOrder.exists) {
        throw new HttpsError("not-found", "Payment order not found.");
      }

      const latestOrderData = latestOrder.data();

      if (
        latestOrderData.uid !== uid ||
        latestOrderData.courseId !== courseId ||
        latestOrderData.amount !== savedOrder.amount ||
        latestOrderData.currency !== "INR"
      ) {
        throw new HttpsError("permission-denied", "Payment order details do not match.");
      }

      // Permit a retry only for the exact payment already verified.
      if (latestOrderData.status === "verified") {
        if (latestOrderData.paymentId === paymentId) {
          return;
        }
        throw new HttpsError("already-exists", "This order has already been verified.");
      }

      if (latestOrderData.status !== "created") {
        throw new HttpsError("failed-precondition", "Payment order is not pending.");
      }

      if (!courseSnapshot.exists) {
        throw new HttpsError("not-found", "Course no longer exists.");
      }

      if (
        latestEnrollment.exists &&
        latestEnrollment.data().status === "active"
      ) {
        throw new HttpsError(
          "already-exists",
          "An active enrollment already exists. Please contact support if you were charged."
        );
      }

      transaction.set(enrollmentRef, {
        uid,
        courseId,
        status: "active",
        paymentId,
        orderId,
        amount: savedOrder.amount,
        currency: savedOrder.currency,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.update(orderRef, {
        status: "verified",
        paymentId,
        verifiedAt: FieldValue.serverTimestamp(),
      });
    });

    return { success: true, enrolled: true, courseId };
  }
);

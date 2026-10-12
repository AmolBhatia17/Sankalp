import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';

const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

/**
 * Uploads a file to Storage with real progress reporting.
 * @returns {Promise<{ url: string, path: string }>}
 */
export function uploadFile(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

    task.on(
      'state_changed',
      (snapshot) => {
        const percent = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress?.(percent, snapshot);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path });
      }
    );
  });
}

export function uploadAvatar(uid, file, onProgress) {
  const path = `avatars/${uid}/${Date.now()}_${safeName(file.name)}`;
  return uploadFile(path, file, onProgress);
}

export function uploadCourseThumbnail(courseId, file, onProgress) {
  const path = `courses/${courseId}/thumbnail_${Date.now()}_${safeName(file.name)}`;
  return uploadFile(path, file, onProgress);
}

export function uploadLectureVideo(courseId, lectureId, file, onProgress) {
  const path = `courses/${courseId}/lectures/${lectureId}/video_${Date.now()}_${safeName(file.name)}`;
  return uploadFile(path, file, onProgress);
}

export function uploadLectureResource(courseId, lectureId, file, onProgress) {
  const path = `courses/${courseId}/lectures/${lectureId}/resources/${Date.now()}_${safeName(file.name)}`;
  return uploadFile(path, file, onProgress);
}

export async function deleteFile(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch {
    /* ignore missing objects */
  }
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

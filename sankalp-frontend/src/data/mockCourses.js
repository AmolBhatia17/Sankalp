export const mockCourses = [
  {
    id: "embedded-systems",
    title: "Embedded Systems",
    year: 2,
    price: 599,
    rating: 4.9,
    modulesCount: 2,
    description: "Learn microcontroller architecture, peripheral interfacing, interrupt vectors, and embedded programming protocols.",
    badge: "2nd Year",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Unit 1: Introduction to Embedded Systems.pdf", type: "pdf" },
          { name: "Unit 2: Microcontroller Architecture & Registers.pdf", type: "pdf" },
          { name: "Unit 3: Memory Organization & Addressing Modes.pdf", type: "pdf" },
          { name: "Unit 4: Timers, Counters & Interrupt Handling.pdf", type: "pdf" },
          { name: "Unit 5: Serial Communication Protocols (I2C, SPI, UART).pdf", type: "pdf" },
          { name: "Unit 6: Real-Time Operating Systems (RTOS) Basics.pdf", type: "pdf" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Lecture 1: Embedded System Architecture Overview", duration: "32 mins" },
          { name: "Lecture 2: Register Operations & Memory Mapping", duration: "45 mins" },
          { name: "Lecture 3: Configuring Timers & Interrupt Service Routines", duration: "50 mins" },
          { name: "Lecture 4: Interfacing Sensors with I2C & SPI Protocols", duration: "40 mins" }
        ]
      }
    ]
  },
  {
    id: "cad-designing",
    title: "CAD Designing",
    year: 1,
    price: 499,
    rating: 4.8,
    modulesCount: 2,
    description: "Master 2D drafting, geometric dimensioning, 3D parametric feature modeling, and mechanical assembly design.",
    badge: "1st Year",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Unit 1: Fundamentals of CAD & User Interface.pdf", type: "pdf" },
          { name: "Unit 2: 2D Geometric Sketching & Constraint Systems.pdf", type: "pdf" },
          { name: "Unit 3: 3D Parametric Feature Modeling (Extrude, Revolve, Sweep).pdf", type: "pdf" },
          { name: "Unit 4: Surface Modeling & Complex Geometry.pdf", type: "pdf" },
          { name: "Unit 5: Mechanical Assembly & Mating Constraints.pdf", type: "pdf" },
          { name: "Unit 6: Engineering Drawings & GD&T Standards.pdf", type: "pdf" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Lecture 1: Getting Started with 2D Sketching & Constraints", duration: "28 mins" },
          { name: "Lecture 2: Building 3D Solid Models with Extrude & Revolve", duration: "42 mins" },
          { name: "Lecture 3: Assembly Modeling & Joint Mating", duration: "38 mins" },
          { name: "Lecture 4: Generating Production Drawings & GD&T", duration: "35 mins" }
        ]
      }
    ]
  },
  {
    id: "robot-vision",
    title: "Robot Vision",
    year: 3,
    price: 649,
    rating: 4.9,
    modulesCount: 2,
    description: "In-depth computer vision techniques, image filtering, spatial kinematics, camera calibration, and object recognition.",
    badge: "3rd Year",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Unit 1: Introduction to Robot Vision & Image Formation.pdf", type: "pdf" },
          { name: "Unit 2: Spatial Transformations & Kinematic Chains.pdf", type: "pdf" },
          { name: "Unit 3: Digital Image Processing & Edge Detection Algorithms.pdf", type: "pdf" },
          { name: "Unit 4: Camera Calibration & Pinhole Models.pdf", type: "pdf" },
          { name: "Unit 5: Feature Extraction (SIFT, SURF, ORB).pdf", type: "pdf" },
          { name: "Unit 6: 3D Vision, Stereo Matching & Point Clouds.pdf", type: "pdf" },
          { name: "Unit 7: Object Recognition & Machine Learning in Vision.pdf", type: "pdf" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Lecture 1: Image Representation & Matrix Operations", duration: "30 mins" },
          { name: "Lecture 2: Spatial Kinematics & Transformation Matrices", duration: "48 mins" },
          { name: "Lecture 3: Implementing Sobel & Canny Edge Detectors", duration: "44 mins" },
          { name: "Lecture 4: Stereo Vision & Depth Map Reconstruction", duration: "52 mins" }
        ]
      }
    ]
  }
];
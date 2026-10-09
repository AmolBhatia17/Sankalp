export const mockCourses = [
  {
    id: "embedded-systems",
    title: "Embedded Systems",
    year: 2,
    price: 599,
    rating: 4.9,
    modulesCount: 1,
    badge: "2nd Year",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    description: "Learn microcontroller architecture, peripheral interfacing, interrupt vectors, high-speed PCB differential routing, and embedded programming protocols.",
    modules: [
      {
        id: "es-m1",
        number: 1,
        title: "Module 1: Differential Routing & High-Speed PCB Design",
        parts: [
          {
            id: "M10P1",
            file: "M10P1.pptx",
            title: "DIFFERENTIAL ROUTING : DIFFERENTIAL PAIR SIGNAL AND ROUTING PS1",
            type: "pcb"
          }
        ]
      }
    ],
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Module 1: Differential Pair PCB Routing (M10P1).pptx", type: "pptx" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Lecture 1: High-Speed Differential Routing & PCB Layout", duration: "45 mins" }
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
    modulesCount: 5,
    badge: "1st Year",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    description: "Master 2D drafting, geometric dimensioning, 3D parametric feature modeling, tolerance analysis, and mechanical assembly design.",
    modules: [
      {
        id: "cad-m1",
        number: 1,
        title: "Module 1: 2D Drafting & Orientation Lab",
        parts: [
          { 
            id: "CAD-M0", 
            file: "Orientation.pptx", 
            title: "SOLIDWORKS PROJECT LAB: BUILD YOUR FIRST REAL-WORLD DESIGN", 
            type: "pptx" 
          },
          { 
            id: "CAD-M1B", 
            file: "M1-B.pdf", 
            title: "2D DRAFTING SPECIFICATION SHEET & ORTHOGRAPHIC PROJECTIONS", 
            type: "pdf" 
          }
        ]
      },
      {
        id: "cad-m3",
        number: 3,
        title: "Module 3: Part Modelling & Advanced Features",
        parts: [
          { 
            id: "CAD-M3A", 
            file: "Module 3 A.pptx", 
            title: "Part Modelling Essentials", 
            type: "pptx" 
          },
          { 
            id: "CAD-M3B", 
            file: "Module 3 B.pptx", 
            title: "Advanced Features & Surface Operations", 
            type: "pptx" 
          }
        ]
      },
      {
        id: "cad-m4",
        number: 4,
        title: "Module 4: Mechanical Assembly Design",
        parts: [
          { 
            id: "CAD-M4A", 
            file: "Module 4 A.pptx", 
            title: "Assembly Modeling & Joint Constraints", 
            type: "pptx" 
          }
        ]
      },
      {
        id: "cad-m5",
        number: 5,
        title: "Module 5: Engineering Tolerances & GD&T",
        parts: [
          { 
            id: "CAD-M5", 
            file: "tolerance.pptx", 
            title: "TOLERANCE & GEOMETRIC DIMENSIONING (GD&T)", 
            type: "pptx" 
          }
        ]
      },
      {
        id: "cad-m6",
        number: 6,
        title: "Module 6: Part Drawings & Production Sheets",
        parts: [
          { 
            id: "CAD-M6", 
            file: "M6 - Part.pdf", 
            title: "PRODUCTION PART DRAWINGS & ASSEMBLY BILL OF MATERIALS (BOM)", 
            type: "pdf" 
          }
        ]
      }
    ],
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Module 1: Orientation Lab & 2D Drafting.pptx", type: "pptx" },
          { name: "Module 3: Part Modelling & Advanced Features.pptx", type: "pptx" },
          { name: "Module 4: Mechanical Assembly Design.pptx", type: "pptx" },
          { name: "Module 5: Tolerance Analysis.pptx", type: "pptx" },
          { name: "Module 6: Part Drawings & Blueprints.pdf", type: "pdf" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Lecture 1: SolidWorks Interface & 2D Sketching", duration: "28 mins" },
          { name: "Lecture 2: Part Modelling Essentials & Extrusions", duration: "42 mins" },
          { name: "Lecture 3: Assembly Modeling & Tolerance Limits", duration: "45 mins" }
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
    modulesCount: 10,
    badge: "3rd Year",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
    description: "In-depth computer vision techniques, perception for intelligent robots, vision architecture, camera models, and deep learning pipelines.",
    modules: [
      {
        id: "m1",
        number: 1,
        title: "Module 1: Introduction to Robot Vision & Perception",
        parts: [
          { id: "M0", file: "M0 Intro.pptx", title: "SANKALP TRAINING PROGRAM By SpectoV", type: "pptx" },
          { id: "M1P1", file: "M1P1.pptx", title: "Robot Vision : Perception for Intelligent Robots", type: "pptx" },
          { id: "M1P2", file: "M1P2.pptx", title: "Robot Vision System Architecture", type: "pptx" },
          { id: "M1P3", file: "M1P3.pptx", title: "Image Formation and Robot Cameras", type: "pptx" }
        ]
      },
      {
        id: "m2",
        number: 2,
        title: "Module 2: Image Processing & Geometric Warping",
        parts: [
          { id: "M2P1", file: "M2P1.pptx", title: "Image Processing Fundamentals", type: "pptx" },
          { id: "M2P2", file: "M2P2.pptx", title: "Color Spaces for Object Detection", type: "pptx" },
          { id: "M2P3", file: "M2P3.pptx", title: "Geometric Transformations & Image Warping", type: "pptx" }
        ]
      },
      {
        id: "m3",
        number: 3,
        title: "Module 3: Filtering, Edge Detection & Morphology",
        parts: [
          { id: "M3P1", file: "M3P1.pptx", title: "Spatial Filtering & Noise Detection", type: "pptx" },
          { id: "M3P2", file: "M3P2.pptx", title: "Edge Detection Algorithms", type: "pptx" },
          { id: "M3P3", file: "M3P3.pptx", title: "Morphological Operations", type: "pptx" }
        ]
      },
      {
        id: "m4",
        number: 4,
        title: "Module 4: Feature Detection & Matching",
        parts: [
          { id: "M4P1", file: "M4P1.pptx", title: "Feature Detection & Description", type: "pptx" },
          { id: "M4P2", file: "M4P2.pptx", title: "Invariant Feature Transforms", type: "pptx" },
          { id: "M4P3", file: "M4P3.pptx", title: "Feature Matching & RANSAC", type: "pptx" }
        ]
      },
      {
        id: "m5",
        number: 5,
        title: "Module 5: Segmentation & Shape Analysis",
        parts: [
          { id: "M5P1", file: "M5P1.pptx", title: "Image Segmentation for Robots", type: "pptx" },
          { id: "M5P2", file: "M5P2.pptx", title: "Contours, Shape Analysis & Object Classification", type: "pptx" }
        ]
      },
      {
        id: "m6",
        number: 6,
        title: "Module 6: Classical Object Detection",
        parts: [
          { id: "M6P1", file: "M6P1.pptx", title: "Classical Object Detection", type: "pptx" },
          { id: "M6P2", file: "M6P2.pptx", title: "HOG Features, SVM Classification & Detection Pipelines", type: "pptx" }
        ]
      },
      {
        id: "m7",
        number: 7,
        title: "Module 7: Deep Learning & Neural Architectures",
        parts: [
          { id: "M7P1", file: "M7P1.pptx", title: "Neural Networks, Activation Functions, & Convolutional Architectures", type: "pptx" },
          { id: "M7P2", file: "M7P2.pptx", title: "Transfer Learning, Training Strategies, and Real-World Deployment", type: "pptx" }
        ]
      },
      {
        id: "m8",
        number: 8,
        title: "Module 8: Object Detection & Semantic Segmentation",
        parts: [
          { id: "M8P1", file: "M8P1.pptx", title: "Object Detection Architecture and Fundamentals", type: "pptx" },
          { id: "M8P2", file: "M8P2.pptx", title: "Semantic Segmentation & Robot Deployment", type: "pptx" }
        ]
      },
      {
        id: "m9",
        number: 9,
        title: "Module 9: 3D Vision & Depth Estimation",
        parts: [
          { id: "M9P1", file: "M9P1.pptx", title: "3D Vision & Depth Estimation", type: "pptx" }
        ]
      },
      {
        id: "m10",
        number: 10,
        title: "Module 10: Visual Localization & SLAM",
        parts: [
          { id: "M10P1", file: "M10P1.pptx", title: "Visual Localization & SLAM", type: "pptx" }
        ]
      }
    ],
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Module 1: Perception & Camera Systems.pptx", type: "pptx" },
          { name: "Module 2: Image Processing & Warping.pptx", type: "pptx" },
          { name: "Module 3: Edge Detection & Morphology.pptx", type: "pptx" },
          { name: "Module 4: Feature Detection & Matching.pptx", type: "pptx" },
          { name: "Module 5: Segmentation & Shape Analysis.pptx", type: "pptx" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Lecture 1: Robot Perception & System Architecture", duration: "35 mins" },
          { name: "Lecture 2: Camera Calibration & Image Formation", duration: "42 mins" },
          { name: "Lecture 3: Edge Detection & Spatial Filtering", duration: "40 mins" },
          { name: "Lecture 4: Feature Matching & Real-Time Tracking", duration: "50 mins" }
        ]
      }
    ]
  }
];
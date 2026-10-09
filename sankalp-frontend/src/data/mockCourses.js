export const mockCourses = [
  {
    id: "embedded-systems",
    title: "Embedded Systems",
    year: 2,
    price: 599,
    rating: 4.9,
    modulesCount: 5,
    badge: "2nd Year",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    description: "Learn microcontroller architecture, peripheral interfacing, interrupt vectors, high-speed PCB differential routing, and embedded programming protocols.",
    modules: [
      {
        id: "es-m1",
        number: 1,
        title: "Module 1: Setting Up IDE & First Embedded Project",
        parts: [
          {
            id: "ES-M1",
            file: "M1 - IDE Setup & Toolchain.pptx",
            title: "TOOLCHAIN INSTALLATION, EMBEDDED C & FIRST BLINK PROJECT",
            type: "pptx"
          }
        ],
        videos: [
          {
            id: "ES-V-M1",
            file: "M1 - Setting Up IDE and First Project.mp4",
            title: "Module 1: Setting Up IDE, Cross-Compilers & Your First Project",
            duration: "28 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "es-m2",
        number: 2,
        title: "Module 2: Microcontrollers vs Microprocessors",
        parts: [
          {
            id: "ES-M2",
            file: "M2 - MCU Architecture.pptx",
            title: "HARVARD VS VON NEUMANN, MEMORY MAPS & CORE ARCHITECTURES",
            type: "pptx"
          }
        ],
        videos: [
          {
            id: "ES-V-M2",
            file: "M2 - Microcontrollers vs Microprocessors.mp4",
            title: "Module 2: Microcontrollers vs Microprocessors Core Architecture",
            duration: "35 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "es-m3",
        number: 3,
        title: "Module 3: Arduino UNO & Register-Level Programming",
        parts: [
          {
            id: "ES-M3",
            file: "M3 - Arduino UNO GPIO.pptx",
            title: "ATMEGA328P PINOUT, DDR REGISTERS, TIMERS & INTERRUPTS",
            type: "pptx"
          }
        ],
        videos: [
          {
            id: "ES-V-M3",
            file: "M3 - Arduino UNO.mp4",
            title: "Module 3: Arduino UNO Hardware Interfacing & Register Controls",
            duration: "32 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "es-m4",
        number: 4,
        title: "Module 4: ESP32 & Communication Protocols",
        parts: [
          {
            id: "ES-M4",
            file: "M4 - Serial Protocols.pptx",
            title: "UART, I2C, SPI PROTOCOLS & DUAL-CORE ESP32 ARCHITECTURE",
            type: "pptx"
          }
        ],
        videos: [
          {
            id: "ES-V-M4",
            file: "M4 - ESP32 and Communication Protocols.mp4",
            title: "Module 4: ESP32 Pinout, WiFi/BLE & Communication Protocols (UART, I2C, SPI)",
            duration: "40 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "es-m5",
        number: 5,
        title: "Module 5: PCB Design & Differential Routing",
        parts: [
          {
            id: "M10P1",
            file: "M10P1.pptx",
            title: "DIFFERENTIAL ROUTING : DIFFERENTIAL PAIR SIGNAL AND ROUTING PS1",
            type: "pcb"
          }
        ],
        videos: [
          {
            id: "ES-V-M5",
            file: "M5- PCB Design.mp4",
            title: "Module 5: High-Speed PCB Layout, Schematic Capture & Differential Routing",
            duration: "38 mins",
            type: "mp4"
          }
        ]
      }
    ],
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Module 1: IDE Setup & Toolchain.pptx", type: "pptx" },
          { name: "Module 2: MCU Architecture Fundamentals.pptx", type: "pptx" },
          { name: "Module 3: Arduino UNO Hardware & GPIO.pptx", type: "pptx" },
          { name: "Module 4: Serial Communication Protocols.pptx", type: "pptx" },
          { name: "Module 5: Differential Pair PCB Routing (M10P1).pptx", type: "pcb" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Module 1: Setting Up IDE and First Project (M1 - Setting Up IDE and First Project.mp4)", duration: "28 mins", type: "mp4" },
          { name: "Module 2: Microcontrollers vs Microprocessors (M2 - Microcontrollers vs Microprocessors.mp4)", duration: "35 mins", type: "mp4" },
          { name: "Module 3: Arduino UNO (M3 - Arduino UNO.mp4)", duration: "32 mins", type: "mp4" },
          { name: "Module 4: ESP32 and Communication Protocols (M4 - ESP32 and Communication Protocols.mp4)", duration: "40 mins", type: "mp4" },
          { name: "Module 5: PCB Design (M5- PCB Design.mp4)", duration: "38 mins", type: "mp4" }
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
    modulesCount: 7,
    badge: "1st Year",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    description: "Master 2D drafting, geometric dimensioning, 3D parametric feature modeling, tolerance analysis, and mechanical assembly design.",
    modules: [
      {
        id: "cad-m0",
        number: 0,
        title: "Module 0: SolidWorks Project Lab & Orientation",
        parts: [
          {
            id: "CAD-M0",
            file: "Orientation.pptx",
            title: "SOLIDWORKS PROJECT LAB: BUILD YOUR FIRST REAL-WORLD DESIGN",
            type: "pptx"
          }
        ],
        videos: [
          {
            id: "CAD-V-M0",
            file: "M0 (solidworks project...).mp4",
            title: "SolidWorks Project Lab: Introduction & Software Workspace Tour",
            duration: "24 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "cad-m1",
        number: 1,
        title: "Module 1: 2D Drafting & Sketch Geometry",
        parts: [
          { 
            id: "CAD-M1B", 
            file: "M1-B.pdf", 
            title: "2D DRAFTING SPECIFICATION SHEET & ORTHOGRAPHIC PROJECTIONS", 
            type: "pdf" 
          }
        ],
        videos: [
          {
            id: "CAD-V-M1A",
            file: "M1 A.mp4",
            title: "Module 1 - Part A: 2D Sketching Tools, Lines, Relations & Constraints",
            duration: "32 mins",
            type: "mp4"
          },
          {
            id: "CAD-V-M1B",
            file: "M1 B.mp4",
            title: "Module 1 - Part B: Orthographic Projections & Drafting Standards",
            duration: "28 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "cad-m2",
        number: 2,
        title: "Module 2: 3D Parametric Features & Base Modeling",
        parts: [
          {
            id: "CAD-M2",
            file: "Module 2.pptx",
            title: "3D Parametric Feature Fundamentals & Base Extrusions",
            type: "pptx"
          }
        ],
        videos: [
          {
            id: "CAD-V-M2",
            file: "M2.mp4",
            title: "Module 2: Extruded Boss/Base, Revolved Solids & Cut Features",
            duration: "36 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "cad-m3",
        number: 3,
        title: "Module 3: Part Modelling & Advanced Operations",
        parts: [
          { 
            id: "CAD-M3A", 
            file: "Module 3 A.pptx", 
            title: "Part Modelling Essentials & Reference Geometry", 
            type: "pptx" 
          },
          { 
            id: "CAD-M3B", 
            file: "Module 3 B.pptx", 
            title: "Advanced Sweeps, Lofts, Ribs & Fillet Operations", 
            type: "pptx" 
          }
        ],
        videos: [
          {
            id: "CAD-V-M3A",
            file: "M3 A .mp4",
            title: "Module 3 - Part A: Part Modelling Essentials & Feature Trees",
            duration: "38 mins",
            type: "mp4"
          },
          {
            id: "CAD-V-M3B",
            file: "M3 B .mp4",
            title: "Module 3 - Part B: Complex Part Design, Sweeps & Shells",
            duration: "42 mins",
            type: "mp4"
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
        ],
        videos: [
          {
            id: "CAD-V-M4A",
            file: "M4 A.mp4",
            title: "Module 4 - Part A: Standard Assembly Mates & Concentric Constraints",
            duration: "35 mins",
            type: "mp4"
          },
          {
            id: "CAD-V-M4B",
            file: "M4 B.mp4",
            title: "Module 4 - Part B: Sub-Assemblies, Exploded Views & Interference Check",
            duration: "31 mins",
            type: "mp4"
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
        ],
        videos: [
          {
            id: "CAD-V-M5",
            file: "M5.mp4",
            title: "Module 5: Engineering Tolerances, Fits, Allowances & GD&T Symbols",
            duration: "30 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "cad-m6",
        number: 6,
        title: "Module 6: Production Drawings & Blueprints",
        parts: [
          { 
            id: "CAD-M6", 
            file: "M6 - Part.pdf", 
            title: "PRODUCTION PART DRAWINGS & ASSEMBLY BILL OF MATERIALS (BOM)", 
            type: "pdf" 
          }
        ],
        videos: [
          {
            id: "CAD-V-M6INTRO",
            file: "M6 introduction.mp4",
            title: "Module 6: Introduction to Production Drawings & Sheet Formats",
            duration: "21 mins",
            type: "mp4"
          },
          {
            id: "CAD-V-M6A",
            file: "M6 A.mp4",
            title: "Module 6 - Part A: Generating Multi-View Projections & Sectional Views",
            duration: "37 mins",
            type: "mp4"
          },
          {
            id: "CAD-V-M6B",
            file: "M6 B.mp4",
            title: "Module 6 - Part B: Bill of Materials (BOM), Balloons & Title Blocks",
            duration: "34 mins",
            type: "mp4"
          }
        ]
      }
    ],
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Module 0: Orientation Lab (Orientation.pptx)", type: "pptx" },
          { name: "Module 1: 2D Drafting Spec Sheet (M1-B.pdf)", type: "pdf" },
          { name: "Module 2: Parametric Modeling Fundamentals.pptx", type: "pptx" },
          { name: "Module 3: Part Modelling Essentials (Module 3 A.pptx)", type: "pptx" },
          { name: "Module 3: Advanced Surfaces & Operations (Module 3 B.pptx)", type: "pptx" },
          { name: "Module 4: Mechanical Assembly Design (Module 4 A.pptx)", type: "pptx" },
          { name: "Module 5: Tolerance Analysis & GD&T (tolerance.pptx)", type: "pptx" },
          { name: "Module 6: Production Part Drawings & BOM (M6 - Part.pdf)", type: "pdf" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Module 0: Workspace Tour & First Design (M0 (solidworks project...).mp4)", duration: "24 mins", type: "mp4" },
          { name: "Module 1 - Part A: 2D Sketching & Relations (M1 A.mp4)", duration: "32 mins", type: "mp4" },
          { name: "Module 1 - Part B: Orthographic Projections (M1 B.mp4)", duration: "28 mins", type: "mp4" },
          { name: "Module 2: 3D Base Features & Extrusions (M2.mp4)", duration: "36 mins", type: "mp4" },
          { name: "Module 3 - Part A: Part Modelling Essentials (M3 A .mp4)", duration: "38 mins", type: "mp4" },
          { name: "Module 3 - Part B: Swept Solids & Shell Operations (M3 B .mp4)", duration: "42 mins", type: "mp4" },
          { name: "Module 4 - Part A: Assembly Mates & Constraints (M4 A.mp4)", duration: "35 mins", type: "mp4" },
          { name: "Module 4 - Part B: Sub-Assemblies & Exploded Views (M4 B.mp4)", duration: "31 mins", type: "mp4" },
          { name: "Module 5: GD&T Standards & Engineering Fits (M5.mp4)", duration: "30 mins", type: "mp4" },
          { name: "Module 6: Production Drawing Setup (M6 introduction.mp4)", duration: "21 mins", type: "mp4" },
          { name: "Module 6 - Part A: Multi-View Projections & Sections (M6 A.mp4)", duration: "37 mins", type: "mp4" },
          { name: "Module 6 - Part B: Bill of Materials & Balloons (M6 B.mp4)", duration: "34 mins", type: "mp4" }
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
        ],
        videos: [
          {
            id: "RV-V-M0",
            file: "M0.mp4",
            title: "Course Orientation: Sankalp Robot Vision Training Program Overview",
            duration: "20 mins",
            type: "mp4"
          },
          {
            id: "RV-V-M1A",
            file: "M1 A.mp4",
            title: "Module 1 - Part A: Robot Vision & Perception for Intelligent Robots",
            duration: "34 mins",
            type: "mp4"
          },
          {
            id: "RV-V-M1B",
            file: "M1 B.mp4",
            title: "Module 1 - Part B: Robot Vision System Architecture & Pipeline",
            duration: "29 mins",
            type: "mp4"
          },
          {
            id: "RV-V-M1C",
            file: "M1 C.mp4",
            title: "Module 1 - Part C: Image Formation, Sensors & Robot Cameras",
            duration: "31 mins",
            type: "mp4"
          }
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
        ],
        videos: []
      },
      {
        id: "m3",
        number: 3,
        title: "Module 3: Filtering, Edge Detection & Morphology",
        parts: [
          { id: "M3P1", file: "M3P1.pptx", title: "Spatial Filtering & Noise Detection", type: "pptx" },
          { id: "M3P2", file: "M3P2.pptx", title: "Edge Detection Algorithms", type: "pptx" },
          { id: "M3P3", file: "M3P3.pptx", title: "Morphological Operations", type: "pptx" }
        ],
        videos: [
          {
            id: "RV-V-M3A",
            file: "M3 A.mp4",
            title: "Module 3 - Part A: Spatial Filtering, Noise Detection & Edge Detection",
            duration: "36 mins",
            type: "mp4"
          }
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
        ],
        videos: []
      },
      {
        id: "m5",
        number: 5,
        title: "Module 5: Segmentation & Shape Analysis",
        parts: [
          { id: "M5P1", file: "M5P1.pptx", title: "Image Segmentation for Robots", type: "pptx" },
          { id: "M5P2", file: "M5P2.pptx", title: "Contours, Shape Analysis & Object Classification", type: "pptx" }
        ],
        videos: [
          {
            id: "RV-V-M5B",
            file: "M5 B.mp4",
            title: "Module 5 - Part B: Contours, Shape Analysis & Object Classification",
            duration: "33 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "m6",
        number: 6,
        title: "Module 6: Classical Object Detection",
        parts: [
          { id: "M6P1", file: "M6P1.pptx", title: "Classical Object Detection", type: "pptx" },
          { id: "M6P2", file: "M6P2.pptx", title: "HOG Features, SVM Classification & Detection Pipelines", type: "pptx" }
        ],
        videos: []
      },
      {
        id: "m7",
        number: 7,
        title: "Module 7: Deep Learning & Neural Architectures",
        parts: [
          { id: "M7P1", file: "M7P1.pptx", title: "Neural Networks, Activation Functions, & Convolutional Architectures", type: "pptx" },
          { id: "M7P2", file: "M7P2.pptx", title: "Transfer Learning, Training Strategies, and Real-World Deployment", type: "pptx" }
        ],
        videos: [
          {
            id: "RV-V-M7B",
            file: "M7 B.mp4",
            title: "Module 7 - Part B: Transfer Learning, Training Strategies & Real-World Deployment",
            duration: "42 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "m8",
        number: 8,
        title: "Module 8: Object Detection & Semantic Segmentation",
        parts: [
          { id: "M8P1", file: "M8P1.pptx", title: "Object Detection Architecture and Fundamentals", type: "pptx" },
          { id: "M8P2", file: "M8P2.pptx", title: "Semantic Segmentation & Robot Deployment", type: "pptx" }
        ],
        videos: [
          {
            id: "RV-V-M8A",
            file: "M8 A.mp4",
            title: "Module 8 - Part A: Object Detection Architecture & Fundamentals",
            duration: "38 mins",
            type: "mp4"
          },
          {
            id: "RV-V-M8B",
            file: "M8 B.mp4",
            title: "Module 8 - Part B: Semantic Segmentation & Robot Deployment Pipelines",
            duration: "35 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "m9",
        number: 9,
        title: "Module 9: 3D Vision & Depth Estimation",
        parts: [
          { id: "M9P1", file: "M9P1.pptx", title: "3D Vision & Depth Estimation", type: "pptx" }
        ],
        videos: [
          {
            id: "RV-V-M9B",
            file: "M9 B.mp4",
            title: "Module 9 - Part B: 3D Vision & Stereo Depth Estimation Pipelines",
            duration: "39 mins",
            type: "mp4"
          }
        ]
      },
      {
        id: "m10",
        number: 10,
        title: "Module 10: Visual Localization & SLAM",
        parts: [
          { id: "M10P1", file: "M10P1.pptx", title: "Visual Localization & SLAM", type: "pptx" }
        ],
        videos: []
      }
    ],
    sections: [
      {
        id: "course-material",
        title: "Course Material",
        items: [
          { name: "Module 1: Perception & Camera Systems (M1P1-P3).pptx", type: "pptx" },
          { name: "Module 2: Image Processing & Warping (M2P1-P3).pptx", type: "pptx" },
          { name: "Module 3: Edge Detection & Morphology (M3P1-P3).pptx", type: "pptx" },
          { name: "Module 4: Feature Detection & Matching (M4P1-P3).pptx", type: "pptx" },
          { name: "Module 5: Segmentation & Shape Analysis (M5P1-P2).pptx", type: "pptx" },
          { name: "Module 6: Classical Object Detection (M6P1-P2).pptx", type: "pptx" },
          { name: "Module 7: Deep Learning & Neural Architectures (M7P1-P2).pptx", type: "pptx" },
          { name: "Module 8: Object Detection & Semantic Segmentation (M8P1-P2).pptx", type: "pptx" },
          { name: "Module 9: 3D Vision & Depth Estimation (M9P1).pptx", type: "pptx" },
          { name: "Module 10: Visual Localization & SLAM (M10P1).pptx", type: "pptx" }
        ]
      },
      {
        id: "video-lectures",
        title: "Video Lectures",
        items: [
          { name: "Course Orientation: Sankalp Program Overview (M0.mp4)", duration: "20 mins", type: "mp4" },
          { name: "Module 1 - Part A: Robot Vision Perception (M1 A.mp4)", duration: "34 mins", type: "mp4" },
          { name: "Module 1 - Part B: Robot Vision Architecture (M1 B.mp4)", duration: "29 mins", type: "mp4" },
          { name: "Module 1 - Part C: Image Formation & Cameras (M1 C.mp4)", duration: "31 mins", type: "mp4" },
          { name: "Module 3 - Part A: Spatial Filtering & Edge Detection (M3 A.mp4)", duration: "36 mins", type: "mp4" },
          { name: "Module 5 - Part B: Contours & Shape Analysis (M5 B.mp4)", duration: "33 mins", type: "mp4" },
          { name: "Module 7 - Part B: Transfer Learning & Deployment (M7 B.mp4)", duration: "42 mins", type: "mp4" },
          { name: "Module 8 - Part A: Object Detection Architecture (M8 A.mp4)", duration: "38 mins", type: "mp4" },
          { name: "Module 8 - Part B: Semantic Segmentation (M8 B.mp4)", duration: "35 mins", type: "mp4" },
          { name: "Module 9 - Part B: 3D Vision & Depth Estimation (M9 B.mp4)", duration: "39 mins", type: "mp4" }
        ]
      }
    ]
  }
];
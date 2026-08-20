// Verified data for Shivam Pandey - Full-Stack Web Developer
import img1 from '../img1.png';
import img2 from '../img2.png';
import img3 from '../img3.png';
import img4 from '../img4.png';
import img5 from '../img5.png';
import img6 from '../img6.png';

export const personalInfo = {
  name: "Shivam Pandey",
  title: "Full-Stack Web Developer",
  tagline: "Building scalable, production-grade web & desktop applications with modern MERN, clean architecture, and real-time systems.",
  specialties: ["MERN Stack", "React 19 & State Architecture", "Node.js / Express 5 APIs", "Electron Desktop Apps", "MySQL Automation"],
  location: "Delhi, India",
  email: "shivam.pandey.dev@gmail.com",
  phone: "+91 98114 42710",
  github: "https://github.com/debugwithShivam",
  linkedin: "https://linkedin.com/in/shivam-pandey-31574033a",
  portfolio: "https://portfolio-debugwithshivam.netlify.app",
  status: "Open to Full-Stack / Frontend / Backend / SDE-1 Roles (Immediate Joiner)",
  summary: "Self-taught full-stack developer (BCA, Maharshi Dayanand University) with hands-on experience shipping 6+ production-style applications across web and desktop platforms. Comfortable owning a feature end-to-end — schema design, REST APIs, authentication, and UI — using React, Node.js/Express, MongoDB, and MySQL. Most recently built a full-stack, cross-platform note-taking and media workspace with Electron, real-time updates (Socket.io), offline-first storage (IndexedDB), and automated backend tests."
};

export const keyMetrics = [
  { label: "Shipped Applications", value: "6+", sub: "Web & Desktop platforms" },
  { label: "Tested REST Endpoints", value: "13+", sub: "Node.js test runner verified" },
  { label: "API Call Reduction", value: "~60%", sub: "Via debouncing & throttling" },
  { label: "Scroll Performance Boost", value: "~70%", sub: "React Virtualized on 1,000+ items" },
  { label: "Authentication Risk", value: "Stateless", sub: "JWT Access + Refresh rotation & OTP" },
];

export const skillCategories = [
  {
    category: "Frontend Engineering",
    icon: "Layout",
    color: "#00e5ff",
    skills: [
      { name: "React.js (incl. React 19)", level: "Advanced", note: "Hooks, Context, Concurrent features" },
      { name: "JavaScript (ES6+)", level: "Advanced", note: "Async/Await, Closures, Prototypes, DOM" },
      { name: "Redux Toolkit & Zustand", level: "Advanced", note: "Dual-layer domain vs UI state separation" },
      { name: "TanStack React Query", level: "Proficient", note: "Caching, background refetch, mutations" },
      { name: "Tailwind CSS & CSS3", level: "Advanced", note: "Responsive design, glassmorphism, animations" },
      { name: "React Virtualized", level: "Proficient", note: "High-performance windowed list rendering" },
      { name: "Monaco Editor", level: "Proficient", note: "In-browser syntax highlighted code editing" },
      { name: "HTML5 & Semantic Web", level: "Advanced", note: "WAI-ARIA accessibility, SEO best practices" },
      { name: "Vite", level: "Advanced", note: "Fast HMR, optimized production builds" },
    ]
  },
  {
    category: "Backend & API Architecture",
    icon: "Server",
    color: "#8a2be2",
    skills: [
      { name: "Node.js & Express.js (v5)", level: "Advanced", note: "RESTful architecture, custom middleware pipelines" },
      { name: "JWT Auth & Token Rotation", level: "Advanced", note: "Access & Refresh token cookies, stateless verification" },
      { name: "OTP Verification (Nodemailer)", level: "Proficient", note: "Automated email OTP signup and password flows" },
      { name: "Socket.io", level: "Proficient", note: "Bidirectional real-time client-server communication" },
      { name: "Multer Multipart Uploads", level: "Proficient", note: "Secure audio & image file upload handling" },
      { name: "bcrypt & Security", level: "Advanced", note: "Salted password hashing, input sanitization" },
      { name: "Middleware Architecture", level: "Advanced", note: "Global error handlers, auth guards, request validators" },
    ]
  },
  {
    category: "Databases & Storage",
    icon: "Database",
    color: "#10b981",
    skills: [
      { name: "MongoDB & Mongoose", level: "Advanced", note: "Document schemas, relationships, indexing, aggregation" },
      { name: "MySQL & MySQL2", level: "Proficient", note: "Relational schemas, foreign keys, joins, transactions" },
      { name: "IndexedDB (Dexie.js)", level: "Proficient", note: "Offline-first local client data persistence" },
    ]
  },
  {
    category: "Testing, DevOps & Desktop",
    icon: "Cpu",
    color: "#f59e0b",
    skills: [
      { name: "Electron", level: "Proficient", note: "Cross-platform desktop apps, IPC multi-window pop-outs" },
      { name: "Node.js Test Runner", level: "Proficient", note: "Automated API integration & error tests (node --test)" },
      { name: "node-cron", level: "Proficient", note: "Automated scheduled background tasks & order progression" },
      { name: "Git & GitHub", level: "Advanced", note: "Version control, branching, PRs, CI/CD with Netlify" },
      { name: "Three.js & WebGL", level: "Intermediate", note: "3D scene creation, particle physics, shaders" },
      { name: "Java", level: "Foundational", note: "OOP concepts, Data Structures coursework" },
    ]
  }
];

export const projects = [
  {
    id: "notebook",
    title: "Notebook — Real-Time Note & Media Workspace",
    badge: "Flagship Full-Stack & Desktop App",
    isFlagship: true,
    category: "Full-Stack / Desktop",
    shortDesc: "Full-stack, cross-platform note-taking and media workspace shipped as both a modern web app and native Electron desktop app with real-time sync, Monaco code editor, and offline-first IndexedDB storage.",
    techStack: [
      "React 19",
      "Express 5",
      "MongoDB / Mongoose",
      "Electron",
      "Socket.io",
      "Redux Toolkit",
      "TanStack Query",
      "Monaco Editor",
      "Dexie.js (IndexedDB)",
      "Nodemailer (OTP)",
      "Multer",
      "Node.js Test Runner"
    ],
    githubLink: "https://github.com/debugwithShivam/React-Project/tree/main/Notebook",
    liveDemo: "https://github.com/debugwithShivam/React-Project/tree/main/Notebook",
    metrics: [
      "13 fully tested REST endpoints with custom auth middleware",
      "Dual deployment: Web App + Native Electron Desktop App",
      "Monaco Code Editor integration with live syntax formatting",
      "Offline-first client persistence via Dexie.js (IndexedDB)",
      "Multer multipart handling for audio & image cover uploads"
    ],
    highlights: [
      {
        title: "Dual-Platform Architecture (Web + Electron Desktop)",
        description: "Packaged the React 19 frontend into a desktop application using Electron with IPC handlers to trigger independent pop-out windows for quick note updates and a floating custom music player."
      },
      {
        title: "Robust Authentication & Token Lifecycle",
        description: "Engineered secure JWT access and refresh-token rotation stored in HTTP cookies, backed by an automated 6-digit email OTP verification pipeline using Nodemailer."
      },
      {
        title: "In-Browser Code Editing with Monaco Editor",
        description: "Integrated Microsoft's Monaco Editor allowing developers to author syntax-highlighted code notes with theme switching and live preview support."
      },
      {
        title: "Offline-First Storage Layer",
        description: "Integrated IndexedDB via Dexie.js to persist local timer, focus states, and cached notes even when the user is disconnected from the network."
      },
      {
        title: "Multipart Multimedia & Real-Time Sync",
        description: "Implemented Multer file upload pipelines for custom music tracks and cover art, utilizing Socket.io to push real-time client updates."
      },
      {
        title: "Automated Integration Testing & Documentation",
        description: "Authored end-to-end API integration tests using Node.js's built-in test runner (`node --test`) covering health-checks, auth gates, and error cascades across 13 endpoints."
      }
    ],
    endpoints: [
      { method: "GET", path: "/authRouter/check-auth", desc: "Verifies JWT cookies and returns user authentication state" },
      { method: "POST", path: "/authRouter/createAccount", desc: "Creates pending user account and sends email OTP via Nodemailer" },
      { method: "POST", path: "/authRouter/VerifOtp", desc: "Validates OTP code, activates user record, and issues JWT tokens" },
      { method: "POST", path: "/authRouter/singIn", desc: "Authenticates email/password via bcrypt and issues auth cookies" },
      { method: "GET", path: "/authRouter/getNotes", desc: "Fetches user's sticky notes with pagination and search filter" },
      { method: "POST", path: "/authRouter/insertNotes", desc: "Creates text/code note with Monaco schema support" },
      { method: "PATCH", path: "/authRouter/updateNotes", desc: "Updates note content, title, and code payload" },
      { method: "DELETE", path: "/authRouter/deleteNotes/:id", desc: "Safely removes note owned by authenticated user" },
      { method: "POST", path: "/authRouter/uploadMusic", desc: "Multipart upload (Multer) for audio tracks and cover imagery" },
      { method: "GET", path: "/authRouter/getMusic", desc: "Retrieves music playlist and streaming URLs" },
      { method: "GET", path: "/authRouter/searchUsers", desc: "Searches other users excluding current session user" }
    ]
  },
  {
    id: "react-prod",
    title: "React Production-Ready Architecture & Component Suite",
    badge: "Frontend Architecture & Performance",
    isFlagship: false,
    category: "Frontend",
    shortDesc: "Scalable frontend architecture built with a reusable component library, dual Redux Toolkit + Zustand state strategy, debounced networking, and virtualized windowing.",
    techStack: [
      "React",
      "Redux Toolkit",
      "Zustand",
      "TanStack Query",
      "React Virtualized",
      "Tailwind CSS",
      "Vite"
    ],
    githubLink: "https://github.com/debugwithShivam/React-Project",
    liveDemo: "https://github.com/debugwithShivam/React-Project",
    metrics: [
      "~35% faster feature development via reusable component system",
      "~60% reduction in unnecessary API calls via debounce/throttle utilities",
      "~70% scroll FPS improvement rendering 1,000+ items with React Virtualized",
      "0 prop-drilling with clean domain vs local state boundaries"
    ],
    highlights: [
      {
        title: "Dual State Management Strategy",
        description: "Implemented Redux Toolkit for complex global domain data and Zustand for lightweight local UI state, eliminating prop drilling while avoiding unnecessary store bloat."
      },
      {
        title: "High-Volume Windowing with React Virtualized",
        description: "Rendered datasets with 1,000+ items smoothly by rendering only the visible viewport elements, boosting scroll performance and memory efficiency by ~70%."
      },
      {
        title: "Network Optimization Pipeline",
        description: "Engineered custom hooks for debouncing and throttling search inputs and scroll listeners, slashing redundant backend API queries by ~60%."
      }
    ]
  },
  {
    id: "backend-suite",
    title: "Full-Stack REST API Suite & MySQL Cron Automation",
    badge: "Backend & Relational Systems",
    isFlagship: false,
    category: "Backend",
    shortDesc: "Production-style REST APIs with stateless JWT authentication, 100% middleware validation coverage, and MySQL e-commerce tracking automated via node-cron background schedulers.",
    techStack: [
      "Node.js",
      "Express.js (v5)",
      "MySQL / MySQL2",
      "MongoDB / Mongoose",
      "JWT (Stateless)",
      "node-cron",
      "bcrypt"
    ],
    githubLink: "https://github.com/debugwithShivam/Backend",
    liveDemo: "https://github.com/debugwithShivam/Backend",
    metrics: [
      "100% middleware validation coverage across all API routes",
      "Relational schema design with foreign keys, indexes, and joins",
      "Automated order lifecycle progression using node-cron scheduler",
      "Stateless JWT verification with bcrypt password salting"
    ],
    highlights: [
      {
        title: "Consistent Middleware Pipeline",
        description: "Architected custom Express middleware for request schema validation, token inspection, and unified error handling covering 100% of API endpoints."
      },
      {
        title: "Relational MySQL Schema & Background Scheduling",
        description: "Designed normalized MySQL tables with foreign keys and indexes. Integrated `node-cron` background worker to automatically transition order statuses across simulated delivery lifecycles."
      },
      {
        title: "Dual Database Competence",
        description: "Demonstrated production patterns in both document-based NoSQL (MongoDB) and relational SQL (MySQL2) database paradigms."
      }
    ]
  },
  {
    id: "todo-system",
    title: "Multi-Page Workspace & Productivity System",
    badge: "Interactive UI & Productivity System",
    isFlagship: false,
    category: "Frontend",
    shortDesc: "Comprehensive multi-page task management system with independent timer engines, browser speech synthesis, notification reminders, and custom themes.",
    techStack: [
      "React",
      "Speech Synthesis API",
      "Web Notifications API",
      "Custom Timer Engine",
      "CSS Glassmorphism"
    ],
    githubLink: "https://github.com/debugwithShivam/React-Project",
    liveDemo: "https://portfolio-debugwithshivam.netlify.app/todo",
    screenshots: [
      { img: img2, title: "Task Management Features", desc: "Core task management with sorting, search, text color customization, and speech synthesis." },
      { img: img4, title: "Todo Timer System", desc: "Linked timer presets (10m, 20m, 30m, 1h) enabling Pomodoro-style focused task execution." },
      { img: img6, title: "Unlimited Page System", desc: "Multi-page workspace creation with independent tags, titles, and descriptions." },
      { img: img5, title: "Page Creation Interface", desc: "Fast UI for creating distinct workspace categories." },
      { img: img1, title: "Independent Page State", desc: "Each page isolates its own tasks, timers, pause states, and favorite pins." }
    ],
    metrics: [
      "Independent multi-page task isolation",
      "Browser Speech Synthesis task read-aloud support",
      "Web Notifications API countdown integration"
    ],
    highlights: [
      {
        title: "Isolated Multi-Page Architecture",
        description: "Engineered state isolation so each workspace page maintains its own independent task queues, timers, and priority lists without cross-contamination."
      },
      {
        title: "Speech Synthesis & Notifications",
        description: "Integrated the browser Web Speech API to read tasks aloud on command and Web Notifications to alert users upon timer expiry."
      }
    ]
  },
  {
    id: "microfrontend-a11y",
    title: "Microfrontend Architecture & Accessibility-First Application",
    badge: "Scalable Architecture & Inclusive UX",
    isFlagship: false,
    category: "Frontend",
    shortDesc: "Exploration of modular microfrontend architecture combined with a keyboard and voice-controlled web application adhering to WCAG and WAI-ARIA standards.",
    techStack: [
      "JavaScript (ES6+)",
      "Web Speech Recognition",
      "WAI-ARIA",
      "Module Federation Concepts",
      "Keyboard Focus Trap"
    ],
    githubLink: "https://github.com/debugwithShivam/React-Project",
    liveDemo: "https://github.com/debugwithShivam/React-Project",
    metrics: [
      "100% keyboard-navigable interface (Tab, Shift+Tab, Enter, Space)",
      "Voice command navigation via Web Speech Recognition API",
      "WAI-ARIA compliant semantic layout and screen reader readiness"
    ],
    highlights: [
      {
        title: "Voice-Controlled Navigation",
        description: "Integrated browser speech recognition allowing hands-free navigation, section jumping, and interactive UI triggering."
      },
      {
        title: "Accessibility-First Focus Trap & ARIA",
        description: "Implemented full focus management, visible focus indicators, and semantic HTML structure to guarantee usability for screen readers and keyboard users."
      }
    ]
  }
];

export const educationAndJourney = [
  {
    type: "education",
    title: "Bachelor of Computer Applications (BCA)",
    institution: "Maharshi Dayanand University (MDU)",
    period: "Undergraduate Degree",
    badge: "Formal Degree",
    description: "Rigorous computer applications curriculum covering fundamental principles of software engineering.",
    coursework: ["Data Structures & Algorithms", "Object-Oriented Programming (Java)", "Database Management Systems (DBMS)", "Computer Networks", "Software Engineering Principles"]
  },
  {
    type: "journey",
    title: "Self-Taught Full-Stack Engineering Mastery",
    institution: "Independent Intensive Study & Project Building",
    period: "2022 – Present",
    badge: "Hands-On Engineering",
    description: "Built 6+ full-stack and cross-platform applications from scratch, taking designs from database schema modeling to production deployment, automated testing, and desktop packaging.",
    coursework: ["Modern JavaScript Deep Dive (ES6+, Event Loop, Prototypes)", "React — Complete Architecture & State Systems", "Node.js & Express REST API Architecture", "Three.js Journey (3D Web Graphics & Shaders)", "Electron Desktop Native Integration"]
  }
];

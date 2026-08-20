import React, { useEffect } from 'react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { 
  X, 
  Printer, 
  Download, 
  FileText
} from 'lucide-react';

const ResumeModal = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `# SHIVAM PANDEY
Full-Stack Web Developer (MERN | React.js / Node.js)
Delhi, India | +91 98114 42710 | shivam.pandey.dev@gmail.com
GitHub: https://github.com/debugwithShivam | LinkedIn: https://linkedin.com/in/shivam-pandey-31574033a | Portfolio: https://portfolio-debugwithshivam.netlify.app

## SUMMARY
Self-taught full-stack developer (BCA, Maharshi Dayanand University) with hands-on experience shipping 6+ production-style applications across web and desktop platforms. Comfortable owning a feature end-to-end — schema design, REST APIs, authentication, and UI — using React, Node.js/Express, MongoDB, and MySQL. Most recently built a full-stack, cross-platform note-taking and media workspace with Electron, real-time updates (Socket.io), offline-first storage (IndexedDB), and automated backend tests. Seeking a Full-Stack Developer role to apply and grow these skills on a product engineering team.

## TECHNICAL SKILLS
- Frontend: React.js (incl. React 19), JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Redux Toolkit, Zustand, TanStack React Query, React Virtualized, Monaco Editor, Vite
- Backend: Node.js, Express.js (v5), REST API Design, JWT (access/refresh tokens), OTP Email Verification (Nodemailer), Multer File Uploads, bcrypt, Socket.io, Middleware Architecture
- Databases & Storage: MongoDB / Mongoose, MySQL / MySQL2, IndexedDB (Dexie.js)
- Testing & Tooling: Node.js Test Runner (API integration tests), Git, GitHub, ESLint/oxlint, node-cron, Netlify CI/CD
- Other: Electron (desktop apps), Three.js, WebGL, Java

## PROJECT EXPERIENCE

### Notebook — Real-Time Note & Media Workspace (Web + Desktop)
Tech: React 19, Redux Toolkit, Express 5, MongoDB, Electron, Socket.io, Dexie.js, Monaco Editor, Nodemailer
- Built a full-stack, cross-platform note-taking and media workspace shipped as both a web app and a native Electron desktop app, using React 19, Redux Toolkit, TanStack Query, Express 5, and MongoDB/Mongoose.
- Implemented secure authentication with JWT access/refresh-token cookies and email OTP verification (Nodemailer), protecting all API routes through custom Express middleware.
- Integrated the Monaco Editor for in-app code-note editing and added an offline-first layer using IndexedDB (Dexie.js) for local timer/focus data persistence.
- Built a music upload and playback module with Multer for multipart file handling, and wired Socket.io for real-time client updates.
- Wrote backend integration tests with Node.js's built-in test runner covering health-check and error-handling behavior, and authored full API/architecture documentation across 13 endpoints.
- Packaged the frontend as a desktop app with Electron, including custom IPC-driven pop-out windows for notes and the music player.
Link: https://github.com/debugwithShivam/React-Project/tree/main/Notebook

### React Production-Ready App
Tech: React, Redux, Zustand, React Query, Tailwind CSS, React Virtualized
- Architected a scalable React app with a reusable component library, cutting development time for new features by ~35%.
- Implemented Redux + Zustand state management, eliminating prop-drilling and significantly reducing state-related bugs.
- Applied debouncing/throttling on search and scroll events, reducing unnecessary API calls by ~60%.
- Integrated React Virtualized for large list rendering, improving scroll performance by ~70% on lists with 1,000+ items.
Link: https://github.com/debugwithShivam/React-Project

### Full-Stack API Suite (REST + MySQL Automation)
Tech: Node.js, Express.js, JWT, MongoDB, MySQL2, node-cron
- Developed production-style REST APIs with JWT authentication, reducing unauthorized-access risk via stateless token verification.
- Built a middleware pipeline for request validation and error handling, covering 100% of API routes consistently.
- Extended the stack into a MySQL-backed e-commerce API (MySQL2) with a node-cron scheduled job that automatically progresses order-tracking status, demonstrating relational schema design and background-job scheduling.
Link: https://github.com/debugwithShivam/Backend

### Portfolio Website
Tech: React.js, Tailwind CSS, Netlify
- Designed and deployed a responsive personal portfolio with Netlify CI/CD, achieving zero-downtime deployments on every GitHub push.
Link: https://portfolio-debugwithshivam.netlify.app

## EDUCATION
- Bachelor of Computer Applications (BCA) — Maharshi Dayanand University (MDU)
  Coursework: Data Structures, Object-Oriented Programming (Java), Database Management Systems, Computer Networks.
- Self-Taught Full-Stack Web Development (2022 – Present)
  Independent study: JavaScript (ES6+), React — Complete Guide, Node.js — Complete Guide, Three.js Journey. Applied learning through 6+ end-to-end projects.
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Shivam_Pandey_FullStack_Resume.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="resume-modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Toolbar */}
        <div className="resume-modal-toolbar">
          <div className="toolbar-title">
            <FileText size={18} />
            <span>Interactive Resume Viewer</span>
          </div>

          <div className="toolbar-actions">
            <button onClick={handlePrint} className="btn primary print-btn">
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            <button onClick={handleDownloadMarkdown} className="btn outline download-btn">
              <Download size={15} />
              <span>Download Text (.md)</span>
            </button>

            <button onClick={onClose} className="modal-close-btn" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable ATS-Friendly Resume Sheet */}
        <div className="printable-resume-paper" id="resume-sheet">
          
          {/* Header */}
          <header className="resume-sheet-header">
            <h1 className="resume-sheet-name">SHIVAM PANDEY</h1>
            <div className="resume-sheet-title">Full-Stack Web Developer (MERN | React.js / Node.js)</div>
            
            <div className="resume-sheet-contact">
              <span>Delhi, India</span>
              <span className="sep">&bull;</span>
              <span>+91 98114 42710</span>
              <span className="sep">&bull;</span>
              <a href="mailto:shivam.pandey.dev@gmail.com">shivam.pandey.dev@gmail.com</a>
            </div>

            <div className="resume-sheet-links">
              <a href="https://github.com/debugwithShivam" target="_blank" rel="noreferrer">
                GitHub: debugwithShivam
              </a>
              <span className="sep">&bull;</span>
              <a href="https://linkedin.com/in/shivam-pandey-31574033a" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <span className="sep">&bull;</span>
              <a href="https://portfolio-debugwithshivam.netlify.app" target="_blank" rel="noreferrer">
                Portfolio
              </a>
            </div>
          </header>

          {/* Section: SUMMARY */}
          <section className="resume-section">
            <h2 className="resume-section-title">SUMMARY</h2>
            <div className="resume-section-line"></div>
            <p className="resume-text">
              Self-taught full-stack developer (BCA, Maharshi Dayanand University) with hands-on experience shipping 6+ production-style applications across web and desktop platforms. Comfortable owning a feature end-to-end — schema design, REST APIs, authentication, and UI — using React, Node.js/Express, MongoDB, and MySQL. Most recently built a full-stack, cross-platform note-taking and media workspace with Electron, real-time updates (Socket.io), offline-first storage (IndexedDB), and automated backend tests. Seeking a Full-Stack Developer role to apply and grow these skills on a product engineering team.
            </p>
          </section>

          {/* Section: TECHNICAL SKILLS */}
          <section className="resume-section">
            <h2 className="resume-section-title">TECHNICAL SKILLS</h2>
            <div className="resume-section-line"></div>
            <div className="skills-category-row">
              <strong>Frontend:</strong> React.js (incl. React 19), JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Redux Toolkit, Zustand, TanStack React Query, React Virtualized, Monaco Editor, Vite
            </div>
            <div className="skills-category-row">
              <strong>Backend:</strong> Node.js, Express.js (v5), REST API Design, JWT (access/refresh tokens), OTP Email Verification (Nodemailer), Multer File Uploads, bcrypt, Socket.io, Middleware Architecture
            </div>
            <div className="skills-category-row">
              <strong>Databases & Storage:</strong> MongoDB / Mongoose, MySQL / MySQL2, IndexedDB (Dexie.js)
            </div>
            <div className="skills-category-row">
              <strong>Testing & Tooling:</strong> Node.js Test Runner (API integration tests), Git, GitHub, ESLint/oxlint, node-cron, Netlify CI/CD
            </div>
            <div className="skills-category-row">
              <strong>Other:</strong> Electron (desktop apps), Three.js, WebGL, Java
            </div>
          </section>

          {/* Section: PROJECT EXPERIENCE */}
          <section className="resume-section">
            <h2 className="resume-section-title">PROJECT EXPERIENCE</h2>
            <div className="resume-section-line"></div>

            {/* Project 1 */}
            <div className="resume-project-item">
              <div className="project-item-header">
                <span className="project-item-name">Notebook — Real-Time Note & Media Workspace (Web + Desktop)</span>
                <span className="project-item-tech">React 19, Redux Toolkit, Express 5, MongoDB, Electron, Socket.io</span>
              </div>
              <ul className="project-bullets">
                <li>Built a full-stack, cross-platform note-taking and media workspace shipped as both a web app and a native Electron desktop app, using React 19, Redux Toolkit, TanStack Query, Express 5, and MongoDB/Mongoose.</li>
                <li>Implemented secure authentication with JWT access/refresh-token cookies and email OTP verification (Nodemailer), protecting all API routes through custom Express middleware.</li>
                <li>Integrated the Monaco Editor for in-app code-note editing and added an offline-first layer using IndexedDB (Dexie.js) for local timer/focus data persistence.</li>
                <li>Built a music upload and playback module with Multer for multipart file handling, and wired Socket.io for real-time client updates.</li>
                <li>Wrote backend integration tests with Node.js's built-in test runner covering health-check and error-handling behavior, and authored full API/architecture documentation across 13 endpoints.</li>
                <li>Packaged the frontend as a desktop app with Electron, including custom IPC-driven pop-out windows for notes and the music player.</li>
              </ul>
              <div className="project-link-row">
                <span className="link-label">Link:</span> <a href="https://github.com/debugwithShivam/React-Project/tree/main/Notebook" target="_blank" rel="noreferrer">https://github.com/debugwithShivam/React-Project/tree/main/Notebook</a>
              </div>
            </div>

            {/* Project 2 */}
            <div className="resume-project-item">
              <div className="project-item-header">
                <span className="project-item-name">React Production-Ready App</span>
                <span className="project-item-tech">React, Redux, Zustand, React Query, Tailwind CSS</span>
              </div>
              <ul className="project-bullets">
                <li>Architected a scalable React app with a reusable component library, cutting development time for new features by ~35%.</li>
                <li>Implemented Redux + Zustand state management, eliminating prop-drilling and significantly reducing state-related bugs.</li>
                <li>Applied debouncing/throttling on search and scroll events, reducing unnecessary API calls by ~60%.</li>
                <li>Integrated React Virtualized for large list rendering, improving scroll performance by ~70% on lists with 1,000+ items.</li>
              </ul>
              <div className="project-link-row">
                <span className="link-label">Link:</span> <a href="https://github.com/debugwithShivam/React-Project" target="_blank" rel="noreferrer">https://github.com/debugwithShivam/React-Project</a>
              </div>
            </div>

            {/* Project 3 */}
            <div className="resume-project-item">
              <div className="project-item-header">
                <span className="project-item-name">Full-Stack API Suite (REST + MySQL Automation)</span>
                <span className="project-item-tech">Node.js, Express.js, JWT, MongoDB, MySQL2, node-cron</span>
              </div>
              <ul className="project-bullets">
                <li>Developed production-style REST APIs with JWT authentication, reducing unauthorized-access risk via stateless token verification.</li>
                <li>Built a middleware pipeline for request validation and error handling, covering 100% of API routes consistently.</li>
                <li>Extended the stack into a MySQL-backed e-commerce API (MySQL2) with a node-cron scheduled job that automatically progresses order-tracking status, demonstrating relational schema design and background-job scheduling.</li>
              </ul>
              <div className="project-link-row">
                <span className="link-label">Link:</span> <a href="https://github.com/debugwithShivam/Backend" target="_blank" rel="noreferrer">https://github.com/debugwithShivam/Backend</a>
              </div>
            </div>

            {/* Project 4 */}
            <div className="resume-project-item">
              <div className="project-item-header">
                <span className="project-item-name">Portfolio Website</span>
                <span className="project-item-tech">React.js, Tailwind CSS, Netlify</span>
              </div>
              <ul className="project-bullets">
                <li>Designed and deployed a responsive personal portfolio with Netlify CI/CD, achieving zero-downtime deployments on every GitHub push.</li>
              </ul>
              <div className="project-link-row">
                <span className="link-label">Link:</span> <a href="https://portfolio-debugwithshivam.netlify.app" target="_blank" rel="noreferrer">https://portfolio-debugwithshivam.netlify.app</a>
              </div>
            </div>
          </section>

          {/* Section: EDUCATION */}
          <section className="resume-section">
            <h2 className="resume-section-title">EDUCATION</h2>
            <div className="resume-section-line"></div>
            
            <div className="resume-edu-item">
              <div className="edu-item-header">
                <strong>Bachelor of Computer Applications (BCA)</strong> — Maharshi Dayanand University (MDU)
              </div>
              <p className="edu-coursework">
                <strong>Coursework:</strong> Data Structures, Object-Oriented Programming (Java), Database Management Systems, Computer Networks.
              </p>
            </div>

            <div className="resume-edu-item">
              <div className="edu-item-header">
                <strong>Self-Taught Full-Stack Web Development</strong> (2022 – Present)
              </div>
              <p className="edu-coursework">
                Independent study: JavaScript (ES6+), React — Complete Guide, Node.js — Complete Guide, Three.js Journey. Applied learning through 6+ end-to-end projects covering frontend, backend, databases, real-time features, offline storage, and desktop packaging.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default ResumeModal;

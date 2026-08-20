import React from 'react';
import { 
  Layers, 
  Server, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ArrowRight, 
  Zap, 
  Clock, 
  FileCode,
  HardDrive,
  Radio
} from 'lucide-react';

const Architecture = () => {
  return (
    <section id="architecture" className="architecture-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header gs-reveal">
          <div className="section-subtitle">
            <Layers size={16} className="subtitle-icon" />
            <span>System Design & Data Flow</span>
          </div>
          <h2>Full-Stack System Architecture</h2>
          <div className="underline"></div>
          <p className="section-desc">
            A high-level architectural diagram of how my production applications handle authentication, state synchronization, background automation, and cross-platform desktop integration.
          </p>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="architecture-flow-wrapper glass-card gs-reveal">
          
          {/* Layer 1: Client & Presentation Layer */}
          <div className="arch-layer">
            <div className="layer-header">
              <span className="layer-badge">Layer 1</span>
              <h4>Client & Presentation (Web + Desktop)</h4>
            </div>
            <div className="layer-cards-row">
              <div className="arch-card">
                <div className="arch-card-title">
                  <Cpu size={16} className="arch-card-icon" />
                  <span>React 19 & State</span>
                </div>
                <p>Redux Toolkit (Domain Data) + Zustand (Agile UI) + TanStack Query (Server Cache)</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <FileCode size={16} className="arch-card-icon" />
                  <span>Monaco Code Editor</span>
                </div>
                <p>In-browser syntax highlighting, code note parsing & formatted live preview</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <Radio size={16} className="arch-card-icon" />
                  <span>Electron Desktop & IPC</span>
                </div>
                <p>Context-isolated preload, multi-window popouts for floating notes & media player</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <HardDrive size={16} className="arch-card-icon" />
                  <span>Offline Storage</span>
                </div>
                <p>IndexedDB via Dexie.js for resilient local offline caching & timer state</p>
              </div>
            </div>
          </div>

          <div className="arch-flow-arrow">
            <ArrowRight size={22} className="arrow-down" />
            <span>HTTP / WebSocket Requests</span>
          </div>

          {/* Layer 2: API Gateway & Security Pipeline */}
          <div className="arch-layer">
            <div className="layer-header">
              <span className="layer-badge">Layer 2</span>
              <h4>API Gateway & Express 5 Middleware Pipeline</h4>
            </div>
            <div className="layer-cards-row">
              <div className="arch-card security-card">
                <div className="arch-card-title">
                  <ShieldCheck size={16} className="arch-card-icon text-emerald" />
                  <span>JWT Auth & OTP Verification</span>
                </div>
                <p>Access/Refresh token rotation, Nodemailer 6-digit OTP email activation</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <Server size={16} className="arch-card-icon" />
                  <span>Request Validation & CORS</span>
                </div>
                <p>Centralized sanitization, typed schema checking, and structured error propagation</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <Zap size={16} className="arch-card-icon" />
                  <span>Multer & Real-Time Sync</span>
                </div>
                <p>Multipart audio/image upload pipelines + Socket.io event broadcasting</p>
              </div>
            </div>
          </div>

          <div className="arch-flow-arrow">
            <ArrowRight size={22} className="arrow-down" />
            <span>CRUD Operations & Transactional Queries</span>
          </div>

          {/* Layer 3: Persistence & Automation Layer */}
          <div className="arch-layer">
            <div className="layer-header">
              <span className="layer-badge">Layer 3</span>
              <h4>Persistence & Background Workers</h4>
            </div>
            <div className="layer-cards-row">
              <div className="arch-card">
                <div className="arch-card-title">
                  <Database size={16} className="arch-card-icon" />
                  <span>MongoDB & Mongoose</span>
                </div>
                <p>User accounts, sticky code notes, music metadata, schema validation</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <Database size={16} className="arch-card-icon" />
                  <span>MySQL2 Relational DB</span>
                </div>
                <p>Foreign keys, indexed queries, transactional updates for e-commerce tables</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <Clock size={16} className="arch-card-icon" />
                  <span>node-cron Schedulers</span>
                </div>
                <p>Automated background jobs advancing order tracking states on set intervals</p>
              </div>

              <div className="arch-card">
                <div className="arch-card-title">
                  <Terminal size={16} className="arch-card-icon" />
                  <span>Node.js Test Runner</span>
                </div>
                <p>Automated integration tests across 13 endpoints ensuring zero regressions</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Architecture;

import React from 'react';
import { personalInfo } from '../data/portfolioData';
import { GithubIcon, LinkedinIcon } from './Icons';
import { 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

const Hero = ({ onOpenResume, onSelectProject }) => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        
        {/* Availability Badge */}
        <div className="hero-badge-wrapper animate-up">
          <div className="status-pill">
            <span className="pulse-dot"></span>
            <span className="status-text">{personalInfo.status}</span>
          </div>
        </div>

        {/* Name & Title */}
        <div className="hero-header animate-up">
          <h1 className="hero-name">
            Hi, I'm <span className="gradient-text">{personalInfo.name}</span>
          </h1>
          <h2 className="hero-title">
            Full-Stack Web Developer <span className="tech-accent">(MERN &bull; React.js / Node.js)</span>
          </h2>
        </div>

        {/* Strategic Value Proposition */}
        <p className="hero-summary animate-up">
          Self-taught full-stack engineer (<span className="text-highlight">BCA Graduate</span>) with hands-on experience shipping <strong className="text-highlight">6+ production-style applications</strong> across web and desktop platforms. Comfortable owning full features end-to-end: schema modeling, REST API design, JWT/OTP authentication, and high-performance UI state architecture.
        </p>

        {/* Specialties Tags */}
        <div className="hero-specialties animate-up">
          {personalInfo.specialties.map((spec, index) => (
            <span key={index} className="specialty-tag">
              <Sparkles size={13} className="tag-icon" />
              {spec}
            </span>
          ))}
        </div>

        {/* Call to Actions */}
        <div className="hero-cta-group animate-up">
          <a href="#projects" className="btn primary glow-btn">
            <span>Explore Projects</span>
            <ArrowRight size={16} />
          </a>

          <button onClick={onOpenResume} className="btn secondary">
            <FileText size={16} />
            <span>View Resume</span>
          </button>

          <a href="#contact" className="btn outline">
            <Mail size={16} />
            <span>Contact Me</span>
          </a>
        </div>

        {/* Direct Contact Bar */}
        <div className="hero-meta-bar animate-up">
          <div className="meta-item">
            <MapPin size={15} className="meta-icon" />
            <span>{personalInfo.location}</span>
          </div>
          
          <a href={`mailto:${personalInfo.email}`} className="meta-item meta-link">
            <Mail size={15} className="meta-icon" />
            <span>{personalInfo.email}</span>
          </a>

          <a href={`tel:${personalInfo.phone.replace(/\s+/g, '')}`} className="meta-item meta-link">
            <Phone size={15} className="meta-icon" />
            <span>{personalInfo.phone}</span>
          </a>

          <div className="meta-divider"></div>

          <a 
            href={personalInfo.github} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="meta-social-link"
            title="GitHub: debugwithShivam"
          >
            <GithubIcon size={16} />
            <span>debugwithShivam</span>
          </a>

          <a 
            href={personalInfo.linkedin} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="meta-social-link"
            title="LinkedIn Profile"
          >
            <LinkedinIcon size={16} />
            <span>LinkedIn</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Hero;

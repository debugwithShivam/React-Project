import React from 'react';
import { personalInfo } from '../data/portfolioData';
import { GithubIcon, LinkedinIcon } from './Icons';
import { ArrowUp, Mail, Code2 } from 'lucide-react';

const Footer = ({ onOpenResume }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-root">
      <div className="container footer-container">
        
        <div className="footer-top-row">
          <div className="footer-brand">
            <span className="footer-name">{personalInfo.name}</span>
            <span className="footer-title">{personalInfo.title} &bull; {personalInfo.location}</span>
          </div>

          <div className="footer-social-links">
            <a 
              href={personalInfo.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn"
              title="GitHub"
            >
              <GithubIcon size={18} />
            </a>

            <a 
              href={personalInfo.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-icon-btn"
              title="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>

            <a 
              href={`mailto:${personalInfo.email}`} 
              className="footer-icon-btn"
              title="Email"
            >
              <Mail size={18} />
            </a>

            <button 
              onClick={scrollToTop} 
              className="footer-icon-btn scroll-top-btn"
              title="Scroll to Top"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom-row">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Shivam Pandey. 100% Truthful & Verified Full-Stack Engineering Portfolio.
          </p>
          <div className="footer-tech-stack">
            <Code2 size={14} />
            <span>Built with React 19, Three.js, GSAP, & Vite</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

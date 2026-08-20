import React, { useState, useEffect } from 'react';
import { personalInfo } from '../data/portfolioData';
import { GithubIcon, LinkedinIcon } from './Icons';
import { 
  FileText, 
  Mail, 
  Menu, 
  X, 
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Cpu
} from 'lucide-react';

const Navbar = ({ onOpenResume }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Projects', href: '#projects' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'How I Code', href: '#code-showcase' },
    { name: 'Skills', href: '#skills' },
    { name: 'Journey', href: '#journey' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`navbar-root ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand / Logo */}
        <a href="#home" className="nav-brand">
          <div className="brand-badge">SP</div>
          <div className="brand-text">
            <span className="brand-name">Shivam Pandey</span>
            <span className="brand-role">Full-Stack Dev</span>
          </div>
        </a>

        {/* Status Pill (Desktop) */}
        <div className="nav-status-badge">
          <span className="pulse-dot"></span>
          <span className="status-text">Available for Full-Stack Roles</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav-links">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link">
              {link.name}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button 
            onClick={onOpenResume} 
            className="resume-btn"
            title="View & Download Resume"
          >
            <FileText size={16} />
            <span>Resume</span>
          </button>

          <a 
            href={personalInfo.github} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-icon-link"
            title="GitHub Profile"
          >
            <GithubIcon size={18} />
          </a>

          <a 
            href={personalInfo.linkedin} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-icon-link"
            title="LinkedIn Profile"
          >
            <LinkedinIcon size={18} />
          </a>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <div className="mobile-status-badge">
            <span className="pulse-dot"></span>
            <span>Open to Full-Stack / SDE-1 Roles</span>
          </div>
          <div className="mobile-links-list">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="mobile-actions">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenResume();
              }} 
              className="btn primary full-width"
            >
              <FileText size={16} style={{ marginRight: '8px' }} />
              View & Print Resume
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

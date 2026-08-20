import React, { useState } from 'react';
import { personalInfo } from '../data/portfolioData';
import { GithubIcon, LinkedinIcon } from './Icons';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  ArrowUpRight 
} from 'lucide-react';

const Contact = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    const mailtoUrl = `mailto:${personalInfo.email}?subject=${encodeURIComponent(formData.subject || 'Portfolio Inquiry from ' + formData.name)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`)}`;
    window.open(mailtoUrl, '_blank');
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header gs-reveal">
          <div className="section-subtitle">
            <MessageSquare size={16} className="subtitle-icon" />
            <span>Get in Touch</span>
          </div>
          <h2>Let's Connect & Discuss Opportunities</h2>
          <div className="underline"></div>
          <p className="section-desc">
            I am actively interviewing for <strong>Full-Stack Developer, Frontend Developer, Backend Developer, and SDE-1</strong> roles. Open to On-site (Delhi NCR), Hybrid, or Remote.
          </p>
        </div>

        <div className="contact-layout-grid">
          
          {/* Left Column: Direct Info & Quick Copy */}
          <div className="contact-info-col gs-reveal">
            
            {/* Quick Email Card */}
            <div className="glass-card contact-card">
              <div className="contact-card-icon-wrapper">
                <Mail size={22} className="contact-card-icon" />
              </div>
              <div className="contact-card-body">
                <span className="contact-card-label">Primary Email</span>
                <span className="contact-card-value">{personalInfo.email}</span>
              </div>
              <div className="contact-card-actions">
                <button 
                  onClick={handleCopyEmail}
                  className="copy-pill-btn"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check size={14} className="text-emerald" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a 
                  href={`mailto:${personalInfo.email}`} 
                  className="btn primary btn-sm"
                >
                  <span>Compose</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            {/* Quick Phone / WhatsApp Card */}
            <div className="glass-card contact-card">
              <div className="contact-card-icon-wrapper">
                <Phone size={22} className="contact-card-icon" />
              </div>
              <div className="contact-card-body">
                <span className="contact-card-label">Direct Phone & WhatsApp</span>
                <span className="contact-card-value">{personalInfo.phone}</span>
              </div>
              <div className="contact-card-actions">
                <a 
                  href={`https://wa.me/${personalInfo.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn primary btn-sm"
                >
                  <span>WhatsApp</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            {/* Location & Status Card */}
            <div className="glass-card contact-card">
              <div className="contact-card-icon-wrapper">
                <MapPin size={22} className="contact-card-icon" />
              </div>
              <div className="contact-card-body">
                <span className="contact-card-label">Location & Availability</span>
                <span className="contact-card-value">{personalInfo.location} &bull; Immediate Joiner</span>
              </div>
            </div>

            {/* Social Network Cards */}
            <div className="social-profiles-grid">
              <a 
                href={personalInfo.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-card social-profile-card"
              >
                <GithubIcon size={20} className="social-icon" />
                <div className="social-profile-info">
                  <span className="social-name">GitHub</span>
                  <span className="social-handle">@debugwithShivam</span>
                </div>
                <ArrowUpRight size={16} className="social-arrow" />
              </a>

              <a 
                href={personalInfo.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-card social-profile-card"
              >
                <LinkedinIcon size={20} className="social-icon" />
                <div className="social-profile-info">
                  <span className="social-name">LinkedIn</span>
                  <span className="social-handle">shivam-pandey</span>
                </div>
                <ArrowUpRight size={16} className="social-arrow" />
              </a>
            </div>

          </div>

          {/* Right Column: Interactive Message Box */}
          <div className="contact-form-col gs-reveal">
            <div className="glass-card contact-form-card">
              <div className="form-card-header">
                <h3 className="form-title">Send a Direct Message</h3>
                <p className="form-subtitle">Looking for an interview or discussing a role? Send me a quick note.</p>
              </div>

              {formSubmitted ? (
                <div className="form-success-box">
                  <Check size={32} className="success-icon" />
                  <h4>Message Initiated!</h4>
                  <p>Your default email client was opened. You can also reach me directly at <strong>{personalInfo.email}</strong>.</p>
                  <button 
                    onClick={() => setFormSubmitted(false)} 
                    className="btn outline btn-sm"
                    style={{ marginTop: '1rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Your Name / Recruiter</label>
                      <input 
                        type="text" 
                        id="name" 
                        required
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Your Work Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        required
                        placeholder="e.g. john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject / Position</label>
                    <input 
                      type="text" 
                      id="subject" 
                      placeholder="e.g. Full-Stack Developer Role / Interview Opportunity"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea 
                      id="message" 
                      rows="4" 
                      required
                      placeholder="Hi Shivam, we came across your profile and would love to discuss a full-stack engineering role at..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn primary full-width glow-btn">
                    <Send size={16} />
                    <span>Send Message Directly</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;

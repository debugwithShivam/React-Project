import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import KeyStats from './components/KeyStats';
import Projects from './components/Projects';
import ProjectModal from './components/ProjectModal';
import Architecture from './components/Architecture';
import CodeShowcase from './components/CodeShowcase';
import SkillsMatrix from './components/SkillsMatrix';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ResumeModal from './components/ResumeModal';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    // Hero entry animations
    gsap.to('.animate-up', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.1
    });

    // Scroll reveal trigger animations
    const revealElements = gsap.utils.toArray('.gs-reveal');
    revealElements.forEach((elem) => {
      gsap.fromTo(
        elem,
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: elem,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out',
        }
      );
    });

    ScrollTrigger.refresh();
  }, []);

  return (
    <div className="portfolio-app-root">
      {/* 3D Background Canvas */}
      <ThreeBackground />

      {/* Sticky Navigation Bar */}
      <Navbar onOpenResume={() => setShowResumeModal(true)} />

      {/* Main Content Sections */}
      <main>
        <Hero 
          onOpenResume={() => setShowResumeModal(true)} 
          onSelectProject={(p) => setSelectedProject(p)} 
        />
        
        <KeyStats />

        <Projects 
          onSelectProject={(p) => setSelectedProject(p)} 
        />

        <Architecture />

        <CodeShowcase />

        <SkillsMatrix />

        <Education />

        <Contact />
      </main>

      {/* Footer */}
      <Footer onOpenResume={() => setShowResumeModal(true)} />

      {/* Modals */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {showResumeModal && (
        <ResumeModal 
          onClose={() => setShowResumeModal(false)} 
        />
      )}
    </div>
  );
};

export default App;

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { useEffect,useState } from 'react';
// --- Custom Sub Pages ---
const usePageReveal = () => {
    useEffect(() => {
        gsap.to(".page-reveal", {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15
        });

        const revealElements = gsap.utils.toArray(".gs-reveal");
        revealElements.forEach((elem) => {
            gsap.to(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            });
        });
        ScrollTrigger.refresh();
    }, []);
};

export default usePageReveal
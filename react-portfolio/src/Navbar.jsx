import { NavLink } from "react-router-dom";
import { useEffect,useState } from "react";
// --- Navbar Component ---
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={scrolled ? 'scrolled' : ''}>
            <div className="logo">debugwithShivam</div>
            <ul className="nav-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/todo">Projects</NavLink></li>
                <li><NavLink to="/notebook">Future</NavLink></li>
                <li><NavLink to="/roadmap">Future Plan</NavLink></li>
            </ul>
            <a href="https://github.com/debugwithShivam" target="_blank" rel="noopener noreferrer" className="github-btn">GitHub</a>
        </nav>
    );
};

export default Navbar
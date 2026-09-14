import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import SafetyPage from './pages/SafetyPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RidesHistoryPage from './pages/RidesHistoryPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import Admin from './pages/Admin';
// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// 404 Fallback
function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-6xl font-black text-brand-dark mb-4">404</div>
      <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        The destination you are looking for does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-brand-yellow text-brand-dark font-black rounded-xl text-xs shadow-md hover:bg-brand-yellow-hover"
      >
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white text-gray-900 w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/my-rides" element={<RidesHistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsConditionsPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/Admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

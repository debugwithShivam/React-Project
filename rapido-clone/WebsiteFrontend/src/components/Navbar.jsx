import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, LogOut, UserCircle } from 'lucide-react';
import logo from '../image/logo.png';
import { useSiteContent } from '../context/SiteContentContext';
import { useQuery } from '@tanstack/react-query';
import api, { clearAuth } from '../api/axios';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const navLinks = content.navigation;

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return response.data;
    },
    retry: false,
  });

  const user = data?.success ? data.user : null;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 overflow-hidden">
              <img src={logo} alt="Sawaari Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-dark flex items-center gap-1">
                {content.brand.name} <span className="text-[10px] sm:text-xs bg-brand-dark text-brand-yellow px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Ride</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 tracking-wider uppercase -mt-0.5 sm:-mt-1">
                {content.brand.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action CTA Buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-8 h-8 text-brand-dark" />
                  <div className="max-w-[150px] leading-tight">
                    <p className="truncate text-xs font-bold text-brand-dark">{user.name}</p>
                    <p className="truncate text-[10px] text-gray-500">{user.email || user.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-brand-dark transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-brand-yellow text-brand-dark hover:bg-brand-yellow-hover shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 group"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions: Book Ride Button & Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/book"
              className="px-3 py-1.5 text-xs font-bold bg-brand-yellow text-brand-dark rounded-full shadow-sm"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-brand-dark hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="grid gap-1 pb-3 border-b border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive(link.path)
                    ? 'bg-brand-yellow text-brand-dark font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <UserCircle className="w-8 h-8 text-brand-dark" />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-bold text-brand-dark">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email || user.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 text-xs"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-brand-yellow font-bold text-brand-dark shadow-sm text-xs"
                >
                  Sign Up (Get ₹50 Off First Ride)
                </Link>
                <Link
                  to="/signup?role=captain"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-semibold text-gray-500 hover:text-brand-dark"
                >
                  Become a Captain Partner →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
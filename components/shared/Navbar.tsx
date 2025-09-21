

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME } from '../../constants';

interface NavbarProps {
  isLoginPage?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoginPage = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Effect to close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Styles for desktop links
  const activeDesktopStyle = "text-primary font-semibold border-b-2 border-primary";
  const inactiveDesktopStyle = "text-gray-700 hover:text-primary transition-colors duration-200";
  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `py-2 ${isActive ? activeDesktopStyle : inactiveDesktopStyle}`;

  // Styles for mobile links
  const activeMobileStyle = "bg-primary text-white";
  const inactiveMobileStyle = "text-gray-700 hover:bg-gray-100";
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `block w-full py-2 px-3 rounded transition-colors duration-150 ${isActive ? activeMobileStyle : inactiveMobileStyle}`;
  
  const navClasses = "bg-white shadow-md sticky top-0 z-50 transition-all duration-300";

  return (
    <nav className={navClasses} id="main-navbar">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          {APP_NAME}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-4 sm:space-x-6">
          {!isLoginPage && (
            <>
              <NavLink to="/opportunities" className={desktopNavLinkClasses}>Opportunities</NavLink>
              <NavLink to="/events" className={desktopNavLinkClasses}>Events</NavLink>
              <NavLink to="/dashboard/collective" className={desktopNavLinkClasses}>Collective Impact</NavLink>
            </>
          )}
          
          {user ? (
            <>
              <NavLink to="/dashboard/individual" className={desktopNavLinkClasses}>My Impact</NavLink>
              <NavLink to="/log-hours" className={desktopNavLinkClasses}>Log Hours</NavLink>
              <NavLink to="/submit-opportunity" className={desktopNavLinkClasses}>Post Opportunity</NavLink>
              <NavLink to="/profile" className={desktopNavLinkClasses}>Profile</NavLink>
              <button onClick={logout} className="px-4 py-2 rounded transition duration-150 text-sm sm:text-base bg-accent text-white hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            !isLoginPage && (
              <NavLink to="/login" className="px-4 py-2 rounded transition duration-150 text-sm sm:text-base bg-primary text-white hover:bg-primary-dark">
                Login/Sign Up
              </NavLink>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (collapsible) */}
      <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'} animate-fade-in-down`} id="mobile-menu" style={{animationDuration: '300ms'}}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {!isLoginPage && (
            <>
              <NavLink to="/opportunities" className={mobileNavLinkClasses}>Opportunities</NavLink>
              <NavLink to="/events" className={mobileNavLinkClasses}>Events</NavLink>
              <NavLink to="/dashboard/collective" className={mobileNavLinkClasses}>Collective Impact</NavLink>
            </>
          )}
          
          {user ? (
            <>
              {/* Divider */}
              {!isLoginPage && <hr className="my-2 border-gray-200" />}
              <NavLink to="/dashboard/individual" className={mobileNavLinkClasses}>My Impact</NavLink>
              <NavLink to="/log-hours" className={mobileNavLinkClasses}>Log Hours</NavLink>
              <NavLink to="/submit-opportunity" className={mobileNavLinkClasses}>Post Opportunity</NavLink>
              <NavLink to="/profile" className={mobileNavLinkClasses}>Profile</NavLink>
              <button onClick={logout} className="w-full text-left mt-2 px-3 py-2 rounded transition duration-150 text-base bg-accent text-white hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            !isLoginPage && (
              <NavLink to="/login" className="block w-full text-center mt-2 px-3 py-2 rounded transition duration-150 text-base bg-primary text-white hover:bg-primary-dark">
                Login/Sign Up
              </NavLink>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

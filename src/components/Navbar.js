import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Import NavLink
import { useBetSlip } from '../context/BetSlipContext';
import { useAuth } from '../context/AuthContext';
import {
  FaBars, FaTimes, FaSearch, FaUserCircle, FaSignOutAlt,
  FaShoppingCart, FaWallet // Added FaWallet and FaShoppingCart
} from 'react-icons/fa';
import './Navbar.css';

// Assuming this API endpoint returns an array of all events
const API_ALL_EVENTS_URL = 'https://betwise-sport-betting-app.onrender.com/api/user/all-events';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { slipItems } = useBetSlip();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Renamed 'click' to 'isMobileMenuOpen' for clarity
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [eventCount, setEventCount] = useState(0); // New state for event count

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search term:', searchTerm);
    setSearchTerm('');
    setShowSearchBar(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    closeMobileMenu(); // Also close mobile menu on logout
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (showSearchBar && !event.target.closest('.search-bar-container') && !event.target.closest('.search-icon')) {
        setShowSearchBar(false);
        setSearchTerm('');
      }
      if (showUserDropdown && !event.target.closest('.user-profile-container') && !event.target.closest('.user-dropdown-trigger')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showSearchBar, showUserDropdown]);

  // New useEffect to fetch event count
  useEffect(() => {
    const fetchEventCount = async () => {
      try {
        const response = await fetch(API_ALL_EVENTS_URL);
        if (!response.ok) {
          console.error('Failed to fetch event count:', response.statusText);
          setEventCount(0); // Set to 0 on error
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setEventCount(data.length);
        } else {
          console.warn('API for events did not return an array:', data);
          setEventCount(0); // Set to 0 if data is not an array
        }
      } catch (err) {
        console.error('Error fetching event count:', err);
        setEventCount(0); // Set to 0 on fetch error
      }
    };

    fetchEventCount();
  }, []); // Empty dependency array to run once on mount

  const navLinkClassName = ({ isActive }) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-lime-600 text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const mobileNavLinkClassName = ({ isActive }) => // Consistent styling for mobile NavLinks
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${ // text-base for mobile
      isActive ? 'bg-lime-600 text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;


  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          BetWise
        </Link>

        {/* Desktop Menu Items (visible when not in mobile menu mode) */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink to="/" className={navLinkClassName}>Home</NavLink>
          <NavLink to="/event" className={navLinkClassName}>
            Events {eventCount > 0 && <span className="ml-1 text-xs bg-lime-200 text-lime-700 font-bold px-1.5 py-0.5 rounded-full">{eventCount}</span>}
          </NavLink>
          <NavLink to="/live" className={navLinkClassName}>
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live
          </NavLink>
          <NavLink to="/sports" className={navLinkClassName}>Sports</NavLink>

          {/* Links available to all users */}
          <NavLink to="/betslip" className={navLinkClassName}>
            <FaShoppingCart className="mr-1" /> Bet Slip {slipItems.length > 0 && <span className="ml-1 text-xs bg-lime-200 text-lime-700 font-bold px-1.5 py-0.5 rounded-full">{slipItems.length}</span>}
          </NavLink>
          <NavLink to="/booked-bets" className={navLinkClassName}>Booked Bets</NavLink>
          {/* Links available only to authenticated users */}
          
          {isAuthenticated && (
          <NavLink to="/wallet" className={navLinkClassName}><FaWallet className="mr-1" />Wallet</NavLink>
             
          )}
          <NavLink to="/about" className={navLinkClassName}>About Us</NavLink>
          <NavLink to="/contact" className={navLinkClassName}>Contact</NavLink>
        </div>

        <div className="menu-icons-right">
          <div className="search-icon icon-container" onClick={toggleSearchBar}>
            <FaSearch />
          </div>

          {isAuthenticated && currentUser ? (
            <div className="user-profile-container icon-container">
              <FaUserCircle size={24} onClick={() => setShowUserDropdown(!showUserDropdown)} className="cursor-pointer user-dropdown-trigger" />
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    Hello, {currentUser?.nickName || 'User'}
                  </div>
                  <NavLink to="/wallet" className="dropdown-item flex items-center" onClick={() => setShowUserDropdown(false)}>
                    <FaWallet className="mr-2" /> My Wallet
                  </NavLink>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>My Profile</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-button">
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex">
              <NavLink to="/login" className={navLinkClassName}>Login</NavLink>
            </div>
          )}

          <div className="menu-icon md:hidden" onClick={toggleMobileMenu}> {/* Changed from menu-icon to md:hidden */}
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>

        {showSearchBar && (
          <div className="search-bar-container active">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-button"><FaSearch /></button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        <ul className={`${isMobileMenuOpen ? 'nav-menu active' : 'nav-menu'}`}> {/* md:hidden removed, CSS now controls visibility based on screen size */}
          <li className="nav-item-mobile"> {/* Use a different class for mobile items if needed or style NavLink directly */}
            <NavLink to="/" className={mobileNavLinkClassName} onClick={closeMobileMenu}>Home</NavLink>
          </li>
          <li className="nav-item-mobile">
            <NavLink to="/event" className={mobileNavLinkClassName} onClick={closeMobileMenu}>
              Events {eventCount > 0 && <span className="ml-1 text-xs bg-lime-200 text-lime-700 font-bold px-1.5 py-0.5 rounded-full">{eventCount}</span>}
            </NavLink>
          </li>
          <li className="nav-item-mobile">
            <NavLink to="/live" className={mobileNavLinkClassName} onClick={closeMobileMenu}>
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live
              </div>
            </NavLink>
          </li>
          <li className="nav-item-mobile">
            <NavLink to="/sports" className={mobileNavLinkClassName} onClick={closeMobileMenu}>Sports</NavLink>
          </li>

          {/* Links available to all users */}
          <li className="nav-item-mobile">
            <NavLink to="/betslip" className={mobileNavLinkClassName} onClick={closeMobileMenu}>
              <FaShoppingCart className="mr-2" />Bet Slip {slipItems.length > 0 && `(${slipItems.length})`}
            </NavLink>
          </li>
          <li className="nav-item-mobile">
            <NavLink to="/booked-bets" className={mobileNavLinkClassName} onClick={closeMobileMenu}>Booked Bets</NavLink>
          </li>
          {/* Links available only to authenticated users */}
          
          {isAuthenticated && (
            <li className="nav-item-mobile">
              <NavLink to="/wallet" className={mobileNavLinkClassName} onClick={closeMobileMenu}>
                <FaWallet className="mr-2" />Wallet
              </NavLink>
            </li>
           
          )}
          <li className="nav-item-mobile">
            <NavLink to="/about" className={mobileNavLinkClassName} onClick={closeMobileMenu}>About Us</NavLink>
          </li>
          <li className="nav-item-mobile">
            <NavLink to="/contact" className={mobileNavLinkClassName} onClick={closeMobileMenu}>Contact</NavLink>
          </li>
          {!isAuthenticated && (
            <li className="nav-item-mobile">
              <NavLink to="/login" className={mobileNavLinkClassName} onClick={closeMobileMenu}>Login</NavLink>
            </li>
          )}
          {isAuthenticated && (
             <li className="nav-item-mobile mt-2"> {/* Added margin-top for separation */}
                <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                    <FaSignOutAlt className="mr-2" />
                    Logout ({currentUser?.nickName || 'User'})
                </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

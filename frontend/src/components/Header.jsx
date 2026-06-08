import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Header = () => {
    const { user, cart, logoutUser } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    ASTREX
                </Link>

                <nav className={`nav ${isMenuOpen ? 'nav-mobile-open' : ''}`}>
                    <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
                    <NavLink to="/shop" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Shop</NavLink>
                    {user && <NavLink to="/orders" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Orders</NavLink>}
                    <NavLink to="/cart" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Cart</NavLink>
                    <NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact Us</NavLink>
                    {user ? (
                        <div className="mobile-only-user">
                            <button onClick={() => { logoutUser(); closeMenu(); }} className="btn-outline mobile-logout">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" onClick={closeMenu} className="nav-link mobile-only-signin">Sign In</Link>
                    )}
                </nav>

                <div className="header-actions">
                    <div className="desktop-user">
                        {user ? (
                            <div className="user-info">
                                <Link to="/profile" className="user-name" style={{ textDecoration: 'none' }}>{user.name.split(' ')[0]}</Link>
                                <button onClick={logoutUser} className="btn-outline logout-btn">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="nav-link signin-link">Sign In</Link>
                        )}
                    </div>

                    <Link to="/cart" className="cart-btn" onClick={closeMenu}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        <span className="cart-count">{cart.length}</span>
                    </Link>

                    <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                        {isMenuOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;


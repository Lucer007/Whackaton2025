import React from "react";
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <header className="navbar">
                <div className="container">
                    <Link to="/" className="logo">Nudge</Link>
                    <nav>
                        <ul className="nav-list">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><a href="projects.html">Project</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <h1>Nudge</h1>
                    <p className="subtitle">Like BeReal, but for studying.</p>
                    <p className="description">
                        A social study app where your daily check-ins, class streaks, and authentic snapshots keep you accountable without pressure, without fake productivity.
                    </p>
                    <Link to="/calendar" className="button primary">Get Started</Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2>Study the way you already live online</h2>
                    <div className="feature-grid">
                        <div className="feature-item">
                            <img src="iphone1.jpg" alt="Feature 1" />
                            <h3>Example 1</h3>
                            <p>Short description of what this feature or image represents.</p>
                        </div>
                        <div className="feature-item">
                            <img src="iphone2.jpg" alt="Feature 2" />
                            <h3>Example 2</h3>
                            <p>Short description of this second feature or image.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="container">
                    <p>© 2025 Nudge — All Rights Reserved</p>
                </div>
            </footer>
        </div>
    );
}
import React from "react";
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <header className="navbar">
                <div className="container">
                    <Link to="/" className="logo">Nudge</Link>
                    <nav>
                        <ul className="nav-list">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about" className="active">About</Link></li>
                            <li><Link to="/projects">Project</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <h1>About Nudge</h1>
                    <p className="subtitle">The study app that keeps you accountable without pressure.</p>
                    <p className="description">
                        Like BeReal, but for studying. Your daily check-ins, class streaks, and authentic snapshots keep you motivated while staying stress-free.
                    </p>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="features">
                <div className="container">
                    <h2>How It Works</h2>
                    <div className="feature-grid">
                        <div className="feature-item">
                            <img src="pic1.jpeg" alt="Connect Classes" />
                            <h3>Connect Classes</h3>
                            <p>Tap once → Nudge pulls your Canvas/Blackboard schedule or uploads your syllabus and extracts all due dates automatically.</p>
                        </div>
                        <div className="feature-item">
                            <img src="pic3.jpeg" alt="Create Plan" />
                            <h3>Nudge Creates Your Plan</h3>
                            <p>The app figures out how long tasks will take and suggests the best study times for you.</p>
                        </div>
                        <div className="feature-item">
                            <img src="pic2.jpeg" alt="Post Time" />
                            <h3>Show Up & Post</h3>
                            <p>Pick a suggested time, take a quick study pic, and maintain your streak while unlocking the feed.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why It Works Section */}
            <section className="features">
                <div className="container">
                    <h2>Why This Works</h2>
                    <div className="feature-grid">
                        <div className="feature-item">
                            <h3>Consistency</h3>
                            <p>You show up because your friends show up, helping you stay accountable.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Organization</h3>
                            <p>Nudge automatically reads your syllabus and schedules tasks so you never miss assignments.</p>
                        </div>
                        <div className="feature-item">
                            <h3>No Cramming</h3>
                            <p>Tasks are spaced out early to help you work consistently, avoiding last-minute stress.</p>
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
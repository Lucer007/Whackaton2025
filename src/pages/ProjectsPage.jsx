    import React from "react";
    import { Link } from 'react-router-dom';

    export default function ProjectsPage() {
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
                                <li><Link to="/projects">Project</Link></li>
                            </ul>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="hero">
                    <div className="container hero-content">
                        <h1>Our Projects</h1>
                        <p className="subtitle">See what we're building to make studying easier and more social.</p>
                        <p className="description">
                            From smart scheduling to streak tracking, our projects focus on helping students stay accountable without stress.
                        </p>
                    </div>
                </section>

                {/* Project Features Section */}
                <section className="features">
                    <div className="container">
                        <h2>Featured Projects</h2>
                        <div className="feature-grid">
                            <div className="feature-item">
                                <img src="iphone1.jpg" alt="Project 1" />
                                <h3>Smart Scheduler</h3>
                                <p>Automatically organizes your study tasks and assigns optimal times to help you stay on top of everything.</p>
                            </div>
                            <div className="feature-item">
                                <img src="iphone2.jpg" alt="Project 2" />
                                <h3>Daily Streaks</h3>
                                <p>Track your study streaks and stay motivated while keeping the competition fun with friends.</p>
                            </div>
                            <div className="feature-item">
                                <img src="iphone1.jpg" alt="Project 3" />
                                <h3>Real Moments Feed</h3>
                                <p>Share authentic study snapshots and see what your friends are accomplishing in real time.</p>
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
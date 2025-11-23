import React from "react";
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="navbar" role="banner">
                <a href="/" className="logo" aria-label="Nudge — home">
                    Nudge
                </a>
                <nav role="navigation" aria-label="Main navigation">
                    <ul style={{listStyle:'none', display:'flex', gap:'30px', margin:0, padding:0, alignItems:'center'}}>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><a href="projects.html">Projects</a></li>
                    </ul>
                </nav>
            </header>

            <main id="main" role="main" style={{flex: 1}}>
                <section className="hero" aria-labelledby="hero-heading">
                    <div className="hero-inner" style={{maxWidth:'1000px', margin:'0 auto', padding:'0 8%'}}>
                        <h1 id="hero-heading">Modern. Clean. Professional.</h1>
                        <p>Build your online presence with a sleek landing page that stands out.</p>

                        <div className="hero-btns" style={{display:'flex', gap:'16px', justifyContent:'center', marginTop:'28px'}}>
                            <Link to="/calendar" className="button primary">Get Started</Link>
                            <a href="learn-more.html" className="button secondary">Learn More</a>
                        </div>
                    </div>
                </section>
            </main>

            <footer role="contentinfo">
                <p>© 2025 Nudge — All Rights Reserved</p>
            </footer>
        </div>
    );
}
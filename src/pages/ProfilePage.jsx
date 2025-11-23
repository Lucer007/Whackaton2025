// src/pages/StudyProfilePage.jsx
import React from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { Link } from "react-router-dom";

const classes = [
    {
        name: "Calculus I",
        shortName: "Calculus",
        streakDays: 7,
        daysStudiedThisWeek: 7,
        hoursThisWeek: 10,
        assignmentsCompleted: 3,
    },
    {
        name: "Intro to Algorithms",
        shortName: "Algorithms",
        streakDays: 5,
        daysStudiedThisWeek: 6,
        hoursThisWeek: 8,
        assignmentsCompleted: 4,
    },
    {
        name: "Psychology of Learning",
        shortName: "Psychology",
        streakDays: 3,
        daysStudiedThisWeek: 4,
        hoursThisWeek: 6,
        assignmentsCompleted: 2,
    },
    {
        name: "Writing & Composition",
        shortName: "Writing",
        streakDays: 9,
        daysStudiedThisWeek: 7,
        hoursThisWeek: 11,
        assignmentsCompleted: 5,
    },
];

const totalHours = classes.reduce((sum, c) => sum + c.hoursThisWeek, 0);
const bestStreak = Math.max(...classes.map((c) => c.streakDays));
const totalAssignments = classes.reduce(
    (sum, c) => sum + c.assignmentsCompleted,
    0
);

const StudyProfilePage = () => {
    // BAR: per-class weekly progress
    const barData = {
        labels: classes.map((c) => c.shortName),
        datasets: [
            {
                label: "Hours studied this week",
                data: classes.map((c) => c.hoursThisWeek),
                backgroundColor: "#7C3AED",
            },
            {
                label: "Assignments completed",
                data: classes.map((c) => c.assignmentsCompleted),
                backgroundColor: "#C4B5FD",
            },
        ],
    };

    const barOptions = {
        responsive: true,
        scales: {
            y: { beginAtZero: true },
        },
    };

    // LINE: total hours over weeks (example)
    const lineData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        datasets: [
            {
                label: "Total hours studied",
                data: [12, 16, 18, 20, 22, 24],
                borderColor: "#7C3AED",
                backgroundColor: "rgba(124, 58, 237, 0.15)",
                fill: true,
                tension: 0.35,
            },
            {
                label: "Target hours",
                data: [14, 14, 18, 18, 20, 20],
                borderColor: "#E9D5FF",
                borderDash: [6, 4],
                fill: false,
                tension: 0.35,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="profile-page">
            {/* NAVBAR – unchanged, styled by .navbar-gradient in your CSS */}
            <header className="navbar-gradient">
                <div className="container">
                    <Link to="/" className="Navbar-title">
                        Nudge
                    </Link>
                    <nav>
                        <ul className="navbar-link">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/projects">Projects</Link>
                            </li>
                            <li>
                                <Link to="/calendar">Calendar</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* PAGE CONTENT */}
            <main className="profile-main">
                <div className="profile-content">
                    {/* PROFILE HEADER ROW */}
                    <section className="profile-header">
                        {/* Left: profile card */}
                        <div className="profile-card">
                            <div className="profile-card-left">
                                <div className="avatar-circle">SK</div>
                                <div>
                                    <h2 className="profile-name">Sarah Kim</h2>
                                    <p className="profile-role">
                                        Computer Science • Sophomore
                                    </p>
                                    <p className="profile-subtitle">
                                        Focus: Deep work &amp; consistency
                                    </p>
                                </div>
                            </div>
                            <div className="profile-card-actions">
                                <button className="btn-primary">Edit profile</button>
                                <button className="btn-secondary">Share progress</button>
                            </div>
                        </div>

                        {/* Right: weekly summary card */}
                        <div className="summary-card">
                            <p className="summary-label">This week</p>
                            <div className="summary-row">
                                <div>
                                    <p className="summary-title">Total study hours</p>
                                    <p className="summary-value">{totalHours} hrs</p>
                                </div>
                            </div>
                            <div className="summary-grid">
                                <div>
                                    <p className="summary-mini-label">Best streak</p>
                                    <p className="summary-mini-value">{bestStreak} days</p>
                                </div>
                                <div>
                                    <p className="summary-mini-label">Assignments</p>
                                    <p className="summary-mini-value">{totalAssignments}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CLASS STREAK CARDS */}
                    <section className="class-section">
                        <h3 className="section-title">Class streaks</h3>
                        <div className="class-grid">
                            {classes.map((cls) => {
                                const perfectWeek = cls.daysStudiedThisWeek === 7;
                                return (
                                    <div className="class-card" key={cls.name}>
                                        <div className="class-card-top">
                                            <div className="class-left">
                                                <div className="class-icon">
                                                    {cls.shortName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="class-short-name">{cls.shortName}</p>
                                                    <p className="class-full-name">{cls.name}</p>
                                                </div>
                                            </div>
                                            <span className="class-streak-pill">
                        🔥 {cls.streakDays} d
                      </span>
                                        </div>
                                        <p className="class-message">
                                            {perfectWeek
                                                ? "You studied every day this week."
                                                : `Studied ${cls.daysStudiedThisWeek}/7 days this week.`}
                                        </p>
                                        <div className="class-stats">
                                            <p>Hours this week: {cls.hoursThisWeek} hrs</p>
                                            <p>Assignments completed: {cls.assignmentsCompleted}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ANALYTICS SECTION */}
                    <section className="analytics-section">
                        <h3 className="section-title">Study analytics</h3>
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h4 className="analytics-title">Weekly progress by class</h4>
                                <Bar data={barData} options={barOptions} />
                            </div>
                            <div className="analytics-card">
                                <h4 className="analytics-title">Hours studied over time</h4>
                                <Line data={lineData} options={lineOptions} />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default StudyProfilePage;




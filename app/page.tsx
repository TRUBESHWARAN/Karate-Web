"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="brand">
            <span className="logo-icon">🥋</span>
            <span className="logo-text">Mass Dragon Karate</span>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-login">
              Member Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Forge Your <span className="highlight">Character</span> <br />
            Through Discipline
          </h1>
          <p className="hero-subtitle">
            Join the elite dojo of Mass Dragon Karate Do.
            Experience traditional training, modern conditioning, and the path to becoming your best self.
          </p>
          <div className="cta-group">
            <Link href="/login?mode=signup" className="btn btn-primary">
              Start Your Journey
            </Link>
            <Link href="#schedule" className="btn btn-outline">
              View Schedule
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Train With Us?</h2>
            <div className="separator"></div>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon">🏆</div>
              <h3>Expert Instruction</h3>
              <p>Learn from certified masters with decades of experience in traditional forms and combat.</p>
            </div>
            <div className="feature-card">
              <div className="icon">💪</div>
              <h3>Physical Fitness</h3>
              <p>Improve flexibility, strength, and endurance through rigorous and dynamic training sessions.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🧘</div>
              <h3>Mental Discipline</h3>
              <p>Karate is 10% physical and 90% mental. Develop focus, patience, and unshakeable confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section (Schedule & Location) */}
      <section id="schedule" className="info-section">
        <div className="container split-layout">
          <div className="info-card schedule-card">
            <h3>🕐 Class Schedule</h3>
            <ul className="schedule-list">
              <li>
                <span className="day">Saturday (Evening)</span>
                <span className="time">06:30 PM - 08:30 PM</span>
              </li>
              <li>
                <span className="day">Sunday (Morning)</span>
                <span className="time">06:30 AM - 08:30 AM</span>
              </li>
            </ul>
            <p className="note">* Special training camps announced quarterly.</p>
          </div>

          <div className="info-card location-card">
            <h3>📍 Dojo Location</h3>
            <address>
              <strong>Kurinji Nagar</strong><br />
              Old Perungalathur<br />
              Chennai - 600063<br />
              Tamil Nadu, INDIA
            </address>
            <div className="map-placeholder">
              <span>View on Map ↗</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Mass Dragon Karate Do - India. All rights reserved.</p>
          <p className="footer-links">
            Created for excellence.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }
        
        /* Navbar */
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand {
            display: flex; align-items: center; gap: 0.5rem;
            font-weight: 800; font-size: 1.25rem; color: #111;
        }
        .logo-icon { font-size: 1.5rem; }
        .btn-login {
            background: #111; color: white; padding: 0.5rem 1.25rem;
            border-radius: 99px; font-size: 0.9rem; font-weight: 500;
            text-decoration: none; transition: all 0.2s;
        }
        .btn-login:hover { background: #333; transform: translateY(-1px); }

        /* Hero */
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
          padding: 2rem;
          overflow: hidden;
        }
        .hero-overlay {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 50%);
        }
        .hero-content {
          z-index: 10;
          max-width: 800px;
          animation: fadeUp 0.8s ease-out;
        }
        .hero-title {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #111;
        }
        .hero-title .highlight {
            color: var(--primary-color);
            position: relative;
            display: inline-block;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: #666;
          margin-bottom: 2.5rem;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .cta-group {
            display: flex; gap: 1rem; justify-content: center;
        }
        .btn {
            padding: 1rem 2rem; border-radius: 8px; font-weight: 600;
            text-decoration: none; transition: all 0.2s;
        }
        .btn-primary {
            background: var(--primary-color); color: white;
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); background: var(--primary-dark); }
        .btn-outline {
            background: transparent; color: #333; border: 1px solid #e5e5e5;
        }
        .btn-outline:hover { border-color: #333; }

        /* Features */
        .features { padding: 5rem 1.5rem; background: white; }
        .container { max-width: 1100px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-header h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
        .separator { width: 60px; height: 4px; background: var(--primary-color); margin: 0 auto; }
        
        .feature-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .feature-card {
            padding: 2rem; background: #fafafa; border-radius: 16px;
            text-align: center; transition: transform 0.2s;
        }
        .feature-card:hover { transform: translateY(-5px); background: #f5f5f5; }
        .feature-card .icon { font-size: 3rem; margin-bottom: 1rem; }
        .feature-card h3 { font-size: 1.25rem; margin-bottom: 1rem; font-weight: 700; }
        .feature-card p { color: #666; line-height: 1.6; }

        /* Info Section */
        .info-section { padding: 5rem 1.5rem; background: #111; color: white; }
        .split-layout {
            display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
        }
        .info-card h3 { font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 1rem; }
        
        .schedule-list { list-style: none; padding: 0; }
        .schedule-list li {
            display: flex; justify-content: space-between;
            padding: 1rem 0; border-bottom: 1px solid #222;
        }
        .schedule-list .day { font-weight: 600; color: #ddd; }
        .schedule-list .time { color: var(--primary-color); }
        .note { margin-top: 1rem; font-size: 0.85rem; color: #666; font-style: italic; }

        .location-card address {
            font-style: normal; line-height: 1.8; color: #ddd; margin-bottom: 1.5rem;
        }
        .map-placeholder {
            background: #222; height: 150px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            color: #666; font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .map-placeholder:hover { background: #333; color: white; }

        /* Footer */
        .footer { padding: 2rem 1.5rem; background: #000; color: #666; text-align: center; border-top: 1px solid #111; }
        .footer-links { margin-top: 0.5rem; font-size: 0.9rem; }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-title { font-size: 2.5rem; }
            .cta-group { flex-direction: column; }
            .split-layout { grid-template-columns: 1fr; gap: 3rem; }
            .nav-text { display: none; }
        }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

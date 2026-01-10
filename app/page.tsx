"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1>MASS DRAGON KARATE DO - INDIA</h1>
          <p>Join our Karate Dojo. Discipline, Strength, Honor.</p>
          <div className="cta-group">
            <Link href="/login" className="btn btn-primary">
              Student/Admin Login
            </Link>
          </div>
        </div>
      </header>

      <section className="info-section">
        <div className="card">
          <h2>Class Schedule</h2>
          <p>Sat: 06:30 PM - 8:30 AM</p>
          <p>Sun: 06:30 AM - 08:30 AM</p>
        </div>
        <div className="card">
          <h2>Location</h2>
          <p>Kurinji Nagar, Old Perungalathur, Chennai - 600063</p>
        </div>
      </section>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero {
          background-color: var(--secondary-color);
          color: white;
          padding: var(--spacing-2xl) var(--spacing-md);
          text-align: center;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero h1 {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
          color: var(--primary-color);
        }
        .hero p {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-xl);
        }
        .btn {
          display: inline-block;
          padding: var(--spacing-md) var(--spacing-xl);
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: transform var(--transition-fast);
        }
        .btn-primary {
          background-color: var(--primary-color);
          color: white;
        }
        .btn-primary:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
        }
        .info-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
          padding: var(--spacing-2xl) var(--spacing-md);
          background-color: var(--background-color);
        }
        .card {
          background: var(--surface-color);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          text-align: center;
        }
        .card h2 {
          color: var(--primary-color);
          margin-bottom: var(--spacing-md);
        }
      `}</style>
    </div>
  );
}

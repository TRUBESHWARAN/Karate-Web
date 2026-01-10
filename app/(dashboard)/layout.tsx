"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="loading">Loading Dojo...</div>;
  }

  // Role based protection
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    router.push('/student');
    return null;
  }
  if (pathname.startsWith('/student') && user.role !== 'student') {
    router.push('/admin'); // Or allow admin to view student view? Let's keep strict for now.
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="mobile-brand">Karate Dojo</span>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <h2>Karate Dojo</h2>
          <span className="badge">{user.role.toUpperCase()}</span>
        </div>

        <ul className="nav-links">
          {user.role === 'student' && (
            <>
              <li><Link href="/student" className={pathname === '/student' ? 'active' : ''}>Dashboard</Link></li>
              <li><Link href="/student/profile" className={pathname === '/student/profile' ? 'active' : ''}>Profile</Link></li>
              <li><Link href="/student/fees" className={pathname === '/student/fees' ? 'active' : ''}>My Fees</Link></li>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <li><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>Dashboard</Link></li>
              <li><Link href="/admin/students" className={pathname.startsWith('/admin/students') ? 'active' : ''}>Students</Link></li>
              <li><Link href="/admin/fees" className={pathname.startsWith('/admin/fees') ? 'active' : ''}>Fee Management</Link></li>
            </>
          )}
        </ul>

        <div className="user-profile">
          <p>{user.name}</p>
          <button onClick={logout} className="logout-btn">Sign Out</button>
        </div>
      </nav>

      <main className="content">
        {children}
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--background-color);
        }

        /* Mobile Header */
        .mobile-header {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 60px;
            background: white;
            border-bottom: 1px solid #E5E7EB;
            z-index: 40;
            align-items: center;
            padding: 0 var(--spacing-lg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .menu-btn {
            background: none; border: none; cursor: pointer;
            padding: 8px; margin-right: 16px;
        }
        .mobile-brand { font-weight: 700; color: var(--primary-color); font-size: 1.25rem; }

        .sidebar {
          width: 250px;
          background-color: var(--surface-color);
          border-right: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          padding: var(--spacing-lg);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
        }
        .brand {
          margin-bottom: var(--spacing-2xl);
        }
        .brand h2 {
          color: var(--primary-color);
          margin-bottom: var(--spacing-xs);
        }
        .badge {
          background: var(--secondary-color);
          color: white;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .nav-links {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
        }
        .nav-links li {
          margin-bottom: var(--spacing-xs);
        }
        .nav-links a {
          display: block;
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        .nav-links a:hover, .nav-links a.active {
          background-color: #FEF2F2; /* Light Red */
          color: var(--primary-color);
        }
        .user-profile {
          border-top: 1px solid #E5E7EB;
          padding-top: var(--spacing-md);
        }
        .user-profile p {
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }
        .logout-btn {
          color: var(--text-muted);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .logout-btn:hover {
          color: var(--error-color);
        }
        .content {
          flex: 1;
          padding: var(--spacing-xl);
          overflow-y: auto;
        }
        .loading {
          display: flex;
          height: 100vh;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          font-weight: 600;
        }
        .sidebar-overlay { display: none; }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
            .dashboard-layout { flex-direction: column; padding-top: 60px; }
            .mobile-header { display: flex; }
            
            .sidebar {
                position: fixed;
                top: 60px; left: 0; bottom: 0;
                transform: translateX(-100%);
                width: 260px;
                box-shadow: 2px 0 8px rgba(0,0,0,0.1);
            }
            .sidebar.open { transform: translateX(0); }
            
            .sidebar-overlay {
                display: block;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 45;
            }

            .content { padding: var(--spacing-lg); }
        }
      `}</style>
    </div>
  );
}

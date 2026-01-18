"use client";
import { useEffect, useState } from "react";
import { supabaseDataService } from "@/lib/services/SupabaseDataService";
import { Student, Fee, Announcement } from "@/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingFees, setPendingFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const s = await supabaseDataService.getStudents();
      const f = await supabaseDataService.getAllFees();
      setStudents(s);
      setPendingFees(f.filter(fee => fee.status === 'pending' || fee.status === 'overdue'));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Sensei's Dashboard...</div>;

  const totalRevenue = pendingFees.reduce((acc, fee) => acc + (fee.status === 'paid' ? fee.amount : 0), 0); // Mock for now if we don't fetch paid ones
  const pendingAmount = pendingFees.reduce((acc, fee) => acc + fee.amount, 0);

  return (
    <div className="admin-dashboard">
      <header className="page-header">
        <div>
          <h1>Dojo Command Center</h1>
          <p className="subtitle">Welcome back, Sensei. Here is what's happening today.</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🥋</div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <p className="stat-value">{students.length}</p>
            <span className="stat-trend">Active Members</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Pending Fees</h3>
            <p className="stat-value">{pendingFees.length}</p>
            <span className="stat-trend text-warning">${pendingAmount} outstanding</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Revenue Potential</h3>
            <p className="stat-value">${pendingAmount + totalRevenue}</p>
            <span className="stat-trend">This Month</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="main-col">
          {/* Quick Actions */}
          <section className="section-card quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-grid">
              <Link href="/admin/students" className="action-btn">
                <span className="icon">👥</span>
                <span>Manage Students</span>
              </Link>
              <Link href="/admin/fees" className="action-btn">
                <span className="icon">💳</span>
                <span>Fee Management</span>
              </Link>
              <button className="action-btn" onClick={() => (document.getElementById('announcement-input') as HTMLInputElement)?.focus()}>
                <span className="icon">📢</span>
                <span>New Announcement</span>
              </button>
            </div>
          </section>

          {/* Recent Students Preview */}
          <section className="section-card recent-students">
            <div className="card-header-row">
              <h2>New Joiners</h2>
              <Link href="/admin/students">View All</Link>
            </div>
            <ul className="student-list">
              {students.slice(0, 5).map(s => (
                <li key={s.id} className="student-row">
                  <div className="avatar">{s.name.charAt(0)}</div>
                  <div className="info">
                    <span className="name">{s.name}</span>
                    <span className="rank">{s.rank}</span>
                  </div>
                  <span className="joined">Joined {new Date(s.joinDate).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="side-col">
          {/* Announcement Widget */}
          <section className="section-card announcement-widget">
            <h2>New Announcement</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const title = (form.elements.namedItem('title') as HTMLInputElement).value;
              const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
              if (title && content) {
                await supabaseDataService.createAnnouncement({ title, content, authorId: 'admin' });
                alert('Announcement Posted!');
                form.reset();
              }
            }} className="announcement-form">
              <div className="form-group">
                <input id="announcement-input" name="title" placeholder="Announcement Title" required />
              </div>
              <div className="form-group">
                <textarea name="content" placeholder="Write your message to the dojo..." required rows={4} />
              </div>
              <button type="submit" className="btn-primary full-width">Post Update 🚀</button>
            </form>
          </section>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
            animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: var(--spacing-2xl);
        }
        .page-header h1 { font-size: 2rem; color: var(--primary-color); margin: 0; }
        .page-header .subtitle { color: var(--text-secondary); margin: 0; }
        
        .date-badge {
            background: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            color: var(--text-secondary);
            box-shadow: var(--shadow-sm);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing-lg);
            margin-bottom: var(--spacing-2xl);
        }
        .stat-card {
            background: white;
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
            border: 1px solid #F3F4F6;
            transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .stat-icon {
            width: 50px;
            height: 50px;
            background: #F9FAFB;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        .stat-info h3 { font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 4px 0; text-transform: uppercase; }
        .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0; }
        .stat-trend { font-size: 0.8rem; color: #10B981; font-weight: 600; }
        .text-warning { color: #F59E0B; }
        
        .dashboard-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: var(--spacing-xl);
        }
        @media (max-width: 900px) { .dashboard-content { grid-template-columns: 1fr; } }
        
        .section-card {
            background: white;
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            box-shadow: var(--shadow-sm);
            border: 1px solid #F3F4F6;
            margin-bottom: var(--spacing-xl);
        }
        .section-card h2 { font-size: 1.25rem; margin-bottom: var(--spacing-lg); color: var(--primary-color); }
        
        .action-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-md);
        }
        .action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-lg);
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: var(--radius-md);
            color: var(--text-primary);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .action-btn:hover { background: #EEF2FF; border-color: var(--primary-color); color: var(--primary-color); }
        .action-btn .icon { font-size: 2rem; margin-bottom: 8px; }

        .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
        .student-list { list-style: none; padding: 0; margin: 0; }
        .student-row {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-md) 0;
            border-bottom: 1px solid #F3F4F6;
        }
        .student-row:last-child { border: none; }
        .avatar {
            width: 40px; height: 40px;
            background: var(--secondary-color);
            color: white;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700;
        }
        .info { flex: 1; display: flex; flex-direction: column; }
        .name { font-weight: 600; color: var(--text-primary); }
        .rank { font-size: 0.8rem; color: var(--text-secondary); }
        .joined { font-size: 0.85rem; color: var(--text-muted); }

        .announcement-form .form-group { margin-bottom: var(--spacing-md); }
        .announcement-form input, .announcement-form textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: var(--radius-md);
        }
        .full-width { width: 100%; }
      `}</style>
    </div>
  );
}

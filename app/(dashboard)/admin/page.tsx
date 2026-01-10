"use client";
import { useEffect, useState } from "react";
import { mockDataService } from "@/lib/services/mock/MockDataService";
import { Student, Fee, Announcement } from "@/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingFees, setPendingFees] = useState<Fee[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const s = await mockDataService.getStudents();
      const f = await mockDataService.getAllFees();
      setStudents(s);
      setPendingFees(f.filter(fee => fee.status === 'pending' || fee.status === 'overdue'));
    };
    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Sensei.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">{students.length}</p>
        </div>
        <div className="stat-card warning">
          <h3>Pending Fees</h3>
          <p className="stat-value">{pendingFees.length}</p>
          <Link href="/admin/fees" className="stat-link">View Details &rarr;</Link>
        </div>
        <div className="stat-card">
          <h3>Active Classes</h3>
          <p className="stat-value">3</p>
        </div>
      </div>

      <div className="recent-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link href="/admin/students" className="btn">Manage Students</Link>
          <Link href="/admin/fees" className="btn">Check Fees</Link>
        </div>
      </div>

      <div className="announcement-section">
        <h2>Post Announcement</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const title = (form.elements.namedItem('title') as HTMLInputElement).value;
          const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
          if (title && content) {
            await mockDataService.createAnnouncement({ title, content, authorId: 'admin' });
            alert('Announcement Posted!');
            form.reset();
          }
        }} className="announcement-form">
          <input name="title" placeholder="Title" required />
          <textarea name="content" placeholder="Message content..." required rows={3} />
          <button type="submit" className="btn-primary">Post Update</button>
        </form>
      </div>

      <style jsx>{`
        .page-header {
          margin-bottom: var(--spacing-xl);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }
        .stat-card {
          background: white;
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        .stat-card.warning .stat-value {
          color: var(--warning-color);
        }
        .stat-card h3 {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin: 0;
        }
        .stat-link {
          font-size: 0.875rem;
          margin-top: var(--spacing-sm);
          display: inline-block;
        }
        .recent-section {
          background: white;
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        .action-buttons {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }
        .btn {
          background: var(--background-color);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 600;
          color: var(--text-primary);
          border: 1px solid #E5E7EB;
        }
        .btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      `}</style>
    </div>
  );
}

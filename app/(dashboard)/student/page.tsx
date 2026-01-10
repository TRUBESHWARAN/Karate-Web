"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

import { supabaseDataService } from "@/lib/services/SupabaseDataService";
import { Student, Announcement } from "@/types";
import Link from "next/link";

export default function StudentDashboard() {
    const { user } = useAuth();
    const [student, setStudent] = useState<Student | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                // In real app, we'd use getCurrentUser or fetch by user.id
                // Note: email might be hidden in real service now, so this check might fail if we don't fix getStudents logic or query differently. 
                // Better: getStudentById(user.id) since ID should match Auth ID
                const studentProfile = await supabaseDataService.getStudentById(user.id);

                setStudent(studentProfile || null);

                const ann = await supabaseDataService.getAnnouncements();
                setAnnouncements(ann);
            }
        };
        fetchData();
    }, [user]);

    if (!student) return <div>Loading Profile...</div>;

    return (
        <div className="student-dashboard">
            <header className="page-header">
                <h1>Welcome, {student.name}</h1>
                <div className="belt-display">
                    Current Rank: <span className="belt-name">{student.rank}</span>
                </div>
            </header>

            <div className="dashboard-grid">
                <section className="info-card">
                    <h2>Announcements</h2>
                    <div className="announcement-list">
                        {announcements.map(ann => (
                            <div key={ann.id} className="announcement-item">
                                <h4>{ann.title}</h4>
                                <p>{ann.content}</p>
                                <span className="date">{ann.createdAt}</span>
                            </div>
                        ))}
                        {announcements.length === 0 && <p>No new announcements.</p>}
                    </div>
                </section>

                <section className="info-card profile-card">
                    <h2>Your Profile</h2>
                    <div className="profile-details">
                        <p><strong>Join Date:</strong> {student.joinDate}</p>
                        <p><strong>Age:</strong> {student.age}</p>
                        <p><strong>Contact:</strong> {student.phone}</p>
                    </div>
                    <Link href="/student/fees" className="btn-secondary">Check Fees</Link>
                </section>
            </div>

            <style jsx>{`
        .page-header { margin-bottom: var(--spacing-xl); }
        .belt-display { font-size: 1.25rem; color: var(--text-secondary); }
        .belt-name { color: var(--primary-color); font-weight: 700; }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--spacing-xl);
        }
        .info-card {
            background: white;
            padding: var(--spacing-xl);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
        }
        .info-card h2 { margin-bottom: var(--spacing-lg); color: var(--primary-color); }
        
        .announcement-item {
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: var(--spacing-md);
            margin-bottom: var(--spacing-md);
        }
        .announcement-item:last-child { border-bottom: none; }
        .announcement-item h4 { margin-bottom: var(--spacing-xs); }
        .announcement-item .date { font-size: 0.8rem; color: var(--text-muted); }

        .profile-details p { margin-bottom: var(--spacing-sm); }
        .btn-secondary {
            display: inline-block;
            margin-top: var(--spacing-lg);
            padding: var(--spacing-sm) var(--spacing-lg);
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            border-radius: var(--radius-md);
        }
        .btn-secondary:hover { background: #FEF2F2; }
      `}</style>
        </div>
    );
}

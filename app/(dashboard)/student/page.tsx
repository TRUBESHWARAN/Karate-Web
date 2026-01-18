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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const studentProfile = await supabaseDataService.getStudentById(user.id);
                setStudent(studentProfile || null);

                const ann = await supabaseDataService.getAnnouncements();
                setAnnouncements(ann);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Dojo Data...</p>
            <style jsx>{`
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 50vh;
                    color: var(--text-secondary);
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(211, 47, 47, 0.1);
                    border-radius: 50%;
                    border-top-color: var(--primary-color);
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: var(--spacing-md);
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    if (!student) return <div>Profile not found.</div>;

    // Helper for Belt Color
    const getBeltColor = (rank: string) => {
        const r = rank.toLowerCase();
        if (r.includes('white')) return '#e5e7eb';
        if (r.includes('yellow')) return '#fde047';
        if (r.includes('orange')) return '#fb923c';
        if (r.includes('green')) return '#4ade80';
        if (r.includes('blue')) return '#60a5fa';
        if (r.includes('brown')) return '#a8a29e';
        if (r.includes('black')) return '#1f2937';
        return '#e5e7eb';
    };

    const beltColor = getBeltColor(student.rank);
    const isWhiteBelt = student.rank.toLowerCase().includes('white');

    return (
        <div className="student-dashboard">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Welcome back, <br /> <span className="highlight">{student.name}</span></h1>
                    <p className="subtitle">"The ultimate aim of Karate lies not in victory or defeat, but in the perfection of the character of the participant."</p>
                </div>
                <div className="belt-badge">
                    <div className="belt-stripe" style={{ background: beltColor }}></div>
                    <span style={{ color: isWhiteBelt ? '#374151' : beltColor }}>{student.rank}</span>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="label">Member Since</span>
                    <span className="value">{new Date(student.joinDate).getFullYear()}</span>
                </div>
                <div className="stat-card">
                    <span className="label">Status</span>
                    <span className="value active">Active</span>
                </div>
                <div className="stat-card">
                    <span className="label">Next Class</span>
                    <span className="value">Tomorrow</span>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Profile Overview */}
                <section className="card profile-card">
                    <div className="card-header">
                        <h2>My Dojo Profile</h2>
                        <Link href="/student/fees" className="action-link">View Fees →</Link>
                    </div>
                    <div className="profile-details">
                        <div className="detail-item">
                            <label>Full Name</label>
                            <p>{student.name}</p>
                        </div>
                        <div className="detail-item">
                            <label>Email</label>
                            <p>{user?.email}</p>
                        </div>
                        <div className="detail-item">
                            <label>Phone</label>
                            <p>{student.phone || 'Not set'}</p>
                        </div>
                        <div className="detail-item">
                            <label>Belt Level</label>
                            <p>{student.rank}</p>
                        </div>
                    </div>
                </section>

                {/* Announcements Feed */}
                <section className="card announcement-card">
                    <div className="card-header">
                        <h2>Notice Board</h2>
                    </div>
                    <div className="announcement-list">
                        {announcements.map(ann => (
                            <div key={ann.id} className="announcement-item">
                                <div className="ann-date">
                                    {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="ann-content">
                                    <h4>{ann.title}</h4>
                                    <p>{ann.content}</p>
                                </div>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <div className="empty-state">
                                <p>No announcements yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <style jsx>{`
                .student-dashboard {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .hero-section {
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
                    color: white;
                    padding: var(--spacing-2xl);
                    border-radius: var(--radius-xl);
                    margin-bottom: var(--spacing-2xl);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: var(--shadow-lg);
                    position: relative;
                    overflow: hidden;
                }
                
                .hero-content h1 {
                    font-size: 2.5rem;
                    line-height: 1.2;
                    margin-bottom: var(--spacing-md);
                    font-weight: 800;
                }
                .hero-content .subtitle {
                    opacity: 0.9;
                    font-style: italic;
                    max-width: 500px;
                    line-height: 1.6;
                }
                .belt-badge {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    padding: var(--spacing-lg);
                    border-radius: var(--radius-lg);
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.2);
                    min-width: 150px;
                }
                .belt-stripe {
                    height: 8px;
                    width: 100%;
                    border-radius: 4px;
                    margin-bottom: var(--spacing-sm);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .belt-badge span {
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: var(--spacing-lg);
                    margin-bottom: var(--spacing-2xl);
                }
                .stat-card {
                    background: white;
                    padding: var(--spacing-lg);
                    border-radius: var(--radius-lg);
                    text-align: center;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid #F3F4F6;
                    transition: transform 0.2s;
                }
                .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
                .stat-card .label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    margin-bottom: var(--spacing-xs);
                    letter-spacing: 0.5px;
                }
                .stat-card .value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .stat-card .value.active { color: #10B981; }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 2fr 3fr;
                    gap: var(--spacing-2xl);
                }
                @media (max-width: 768px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .hero-section { flex-direction: column; text-align: center; gap: var(--spacing-xl); }
                }

                .card {
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid #F3F4F6;
                    overflow: hidden;
                }
                .card-header {
                    padding: var(--spacing-lg) var(--spacing-xl);
                    border-bottom: 1px solid #F3F4F6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #FAFAFA;
                }
                .card-header h2 { font-size: 1.25rem; color: var(--text-primary); margin: 0; }
                .action-link {
                    color: var(--primary-color);
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-decoration: none;
                }
                .action-link:hover { text-decoration: underline; }

                .profile-details {
                    padding: var(--spacing-xl);
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-lg);
                }
                .detail-item label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }
                .detail-item p {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .announcement-list { padding: var(--spacing-lg); }
                .announcement-item {
                    display: flex;
                    gap: var(--spacing-md);
                    padding-bottom: var(--spacing-lg);
                    margin-bottom: var(--spacing-lg);
                    border-bottom: 1px solid #F3F4F6;
                }
                .announcement-item:last-child { border: none; margin: 0; padding: 0; }
                .ann-date {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    min-width: 60px;
                    text-align: center;
                    background: #F3F4F6;
                    padding: 8px;
                    border-radius: 8px;
                    height: fit-content;
                }
                .ann-content h4 { margin: 0 0 4px 0; color: var(--text-primary); }
                .ann-content p { margin: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; }
            `}</style>
        </div>
    );
}

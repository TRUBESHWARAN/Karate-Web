"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabaseDataService } from "@/lib/services/SupabaseDataService";
import { Student } from "@/types";

export default function StudentProfilePage() {
    const { user } = useAuth();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        age: 0,
        dob: '',
        bloodGroup: '',
        phone: '',
        address: '',
        emergencyContact: ''
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const data = await supabaseDataService.getStudentById(user.id);
                    if (data) {
                        setStudent(data);
                        setFormData({
                            age: data.age || 0,
                            dob: data.dob || '',
                            bloodGroup: data.bloodGroup || '',
                            phone: data.phone || '',
                            address: data.address || '',
                            emergencyContact: data.emergencyContact || ''
                        });
                    }
                } catch (error) {
                    console.error("Error fetching profile", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        setSaving(true);
        try {
            const updated = await supabaseDataService.updateStudent(student.id, {
                ...student,
                age: Number(formData.age),
                dob: formData.dob,
                bloodGroup: formData.bloodGroup,
                phone: formData.phone,
                address: formData.address,
                emergencyContact: formData.emergencyContact
            });
            setStudent(updated);
            setIsEditing(false);
            alert("Profile Updated Successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading Profile...</div>;
    if (!student) return <div>Profile not found.</div>;

    return (
        <div className="profile-page">
            <header className="page-header">
                <h1>My Profile</h1>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-primary">
                        Edit Profile
                    </button>
                )}
            </header>

            <div className="profile-container">
                <div className="profile-info-header">
                    <div className="avatar-placeholder">{student.name.charAt(0)}</div>
                    <div>
                        <h2>{student.name}</h2>
                        <span className="rank-badge">{student.rank}</span>
                    </div>
                </div>

                <form onSubmit={handleSave} className="profile-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name (Read Only)</label>
                            <input type="text" value={student.name} disabled className="disabled" />
                        </div>
                        <div className="form-group">
                            <label>Email (Read Only)</label>
                            <input type="text" value={user?.email || ''} disabled className="disabled" />
                        </div>

                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>Blood Group</label>
                            <select
                                value={formData.bloodGroup}
                                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                disabled={!isEditing}
                            >
                                <option value="">Select Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing}
                                placeholder="+91..."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Address</label>
                            <textarea
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                disabled={!isEditing}
                                rows={3}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Emergency Contact</label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Name and Phone Number"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" disabled={saving}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <style jsx>{`
                .profile-page { animation: fadeIn 0.3s ease-in-out; }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-xl);
                }
                .page-header h1 { color: var(--primary-color); }

                .profile-container {
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    padding: var(--spacing-2xl);
                    max-width: 800px;
                    margin: 0 auto;
                }

                .profile-info-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-lg);
                    margin-bottom: var(--spacing-2xl);
                    padding-bottom: var(--spacing-lg);
                    border-bottom: 1px solid #E5E7EB;
                }
                .avatar-placeholder {
                    width: 80px;
                    height: 80px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                }
                .profile-info-header h2 { margin: 0 0 4px 0; }
                .rank-badge {
                    background: #F3F4F6;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .profile-form { max-width: 100%; }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-lg);
                }
                .full-width { grid-column: span 2; }

                @media (max-width: 600px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .full-width { grid-column: span 1; }
                }

                .form-group label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #E5E7EB;
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    background: white;
                }
                .form-group input:disabled, .form-group textarea:disabled, .form-group select:disabled {
                    background: #F9FAFB;
                    color: var(--text-secondary);
                    cursor: not-allowed;
                }
                .form-group input.disabled {
                    background: #F3F4F6;
                    border-color: transparent;
                }

                .form-actions {
                    grid-column: span 2;
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-md);
                    margin-top: var(--spacing-xl);
                    padding-top: var(--spacing-lg);
                    border-top: 1px solid #E5E7EB;
                }

                .btn-primary, .btn-secondary {
                    padding: 10px 20px;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                .btn-primary:hover { background: var(--primary-dark); }
                .btn-secondary {
                    background: #E5E7EB;
                    color: var(--text-primary);
                }
                .btn-secondary:hover { background: #D1D5DB; }
            `}</style>
        </div>
    );
}

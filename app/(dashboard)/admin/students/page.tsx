"use client";
import { useEffect, useState } from "react";
import { supabaseDataService } from "@/lib/services/SupabaseDataService";
import { Student } from "@/types";

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // New Student Form State
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        rank: 'White Belt',
        age: '',
        phone: '',
        address: '',
        emergencyContact: ''
    });

    const fetchStudents = async () => {
        const data = await supabaseDataService.getStudents();
        setStudents(data);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.name || !newStudent.email) return;

        await supabaseDataService.addStudent({
            ...newStudent,
            age: Number(newStudent.age),
            joinDate: new Date().toISOString().split('T')[0],
            phone: newStudent.phone || 'N/A',
            address: newStudent.address || '',
            emergencyContact: newStudent.emergencyContact || ''
        });

        setIsAdding(false);
        setNewStudent({ name: '', email: '', rank: 'White Belt', age: '', phone: '', address: '', emergencyContact: '' });
        fetchStudents();
    };

    return (
        <div>
            <header className="page-header">
                <h1>Student Management</h1>
                <button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "Add New Student"}
                </button>
            </header>

            {isAdding && (
                <div className="add-form-container">
                    <form onSubmit={handleAddStudent} className="add-form">
                        <h3>Register New Student</h3>
                        <div className="form-grid">
                            <input
                                placeholder="Full Name"
                                value={newStudent.name}
                                onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Email (Login ID)"
                                type="email"
                                value={newStudent.email}
                                onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                required
                            />
                            <select
                                value={newStudent.rank}
                                onChange={e => setNewStudent({ ...newStudent, rank: e.target.value })}
                            >
                                <option value="White Belt">White Belt</option>
                                <option value="Yellow Belt">Yellow Belt</option>
                                <option value="Green Belt">Green Belt</option>
                                <option value="Brown Belt">Brown Belt</option>
                                <option value="Black Belt">Black Belt</option>
                            </select>
                            <input
                                placeholder="Age"
                                type="number"
                                value={newStudent.age}
                                onChange={e => setNewStudent({ ...newStudent, age: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Phone"
                                value={newStudent.phone}
                                onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                            />
                            <input
                                placeholder="Emergency Contact"
                                value={newStudent.emergencyContact}
                                onChange={e => setNewStudent({ ...newStudent, emergencyContact: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-submit">Register Student</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Rank</th>
                            <th>Age</th>
                            <th>Join Date</th>
                            <th>Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>
                                    <div className="student-name">{student.name}</div>
                                    <div className="student-email">{student.email}</div>
                                </td>
                                <td><span className="badge">{student.rank}</span></td>
                                <td>{student.age}</td>
                                <td>{student.joinDate}</td>
                                <td>{student.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }
        .btn-primary {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
        }
        .add-form-container {
          background: white;
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-xl);
          box-shadow: var(--shadow-md);
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        input, select {
          padding: var(--spacing-sm);
          border: 1px solid #E5E7EB;
          border-radius: var(--radius-md);
          width: 100%;
        }
        .btn-submit {
          background: var(--secondary-color);
          color: white;
          border: none;
          padding: var(--spacing-sm) var(--spacing-xl);
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        .table-container {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          background: #F9FAFB;
          padding: var(--spacing-md);
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid #E5E7EB;
        }
        td {
          padding: var(--spacing-md);
          border-bottom: 1px solid #E5E7EB;
        }
        .student-name {
          font-weight: 600;
        }
        .student-email {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .badge {
          background: #EEF2FF;
          color: #4F46E5;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
        </div>
    );
}

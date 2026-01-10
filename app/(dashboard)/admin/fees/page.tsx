"use client";
import { useEffect, useState } from "react";
import { mockDataService } from "@/lib/services/mock/MockDataService";
import { Student, Fee } from "@/types";

export default function AdminFeesPage() {
    const [fees, setFees] = useState<(Fee & { studentName?: string })[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const fetchData = async () => {
        const f = await mockDataService.getAllFees();
        const s = await mockDataService.getStudents();

        // Join student names
        const enrichedFees = f.map(fee => ({
            ...fee,
            studentName: s.find(st => st.id === fee.studentId)?.name || 'Unknown'
        }));

        setFees(enrichedFees);
        setStudents(s);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMarkPaid = async (feeId: string) => {
        await mockDataService.updateFeeStatus(feeId, 'paid');
        fetchData();
    };

    const handleCreateFee = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Simplified: Add 'Monthly Fee' for all students
        // In real app, modal to select student/month.
        // For now, let's just add a test fee for first student to show it works.
        const formData = new FormData(e.currentTarget);
        const studentId = formData.get('studentId') as string;
        const amount = Number(formData.get('amount'));
        const month = formData.get('month') as string;

        await mockDataService.createFee({
            studentId,
            amount,
            month,
            status: 'pending',
            dueDate: new Date().toISOString().split('T')[0] // today
        });
        fetchData();
        e.currentTarget.reset();
    };

    return (
        <div>
            <header className="page-header">
                <h1>Fee Management</h1>
            </header>

            <div className="fee-actions">
                <form onSubmit={handleCreateFee} className="create-fee-form">
                    <h3>Assign New Fee</h3>
                    <div className="form-row">
                        <select name="studentId" required>
                            <option value="">Select Student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input name="month" placeholder="Month (e.g. Feb 2026)" required />
                        <input name="amount" type="number" placeholder="Amount" defaultValue={50} required />
                        <button type="submit" className="btn-primary">Assign Fee</button>
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Month</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Due Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map(fee => (
                            <tr key={fee.id}>
                                <td>{fee.studentName}</td>
                                <td>{fee.month}</td>
                                <td>${fee.amount}</td>
                                <td>
                                    <span className={`status-badge ${fee.status}`}>
                                        {fee.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>{fee.dueDate}</td>
                                <td>
                                    {fee.status !== 'paid' && (
                                        <button
                                            className="btn-pay"
                                            onClick={() => handleMarkPaid(fee.id)}
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                    {fee.status === 'paid' && <span className="paid-date">{fee.paymentDate}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .page-header { margin-bottom: var(--spacing-lg); }
        .fee-actions {
            background: white;
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            margin-bottom: var(--spacing-xl);
        }
        .create-fee-form h3 { font-size: 1rem; margin-bottom: var(--spacing-md); }
        .form-row {
            display: flex;
            gap: var(--spacing-md);
            flex-wrap: wrap;
        }
        .form-row input, .form-row select {
            flex: 1;
            padding: var(--spacing-sm);
            border: 1px solid #E5E7EB;
            border-radius: var(--radius-md);
        }
        .btn-primary {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0 var(--spacing-lg);
            border-radius: var(--radius-md);
            cursor: pointer;
        }
        .table-container {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th, td { padding: var(--spacing-md); border-bottom: 1px solid #E5E7EB; }
        th { background: #F9FAFB; font-weight: 600; color: var(--text-secondary); }
        .status-badge {
            padding: 2px 8px;
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            font-weight: 600;
        }
        .status-badge.paid { background: #D1FAE5; color: #059669; }
        .status-badge.pending { background: #FEF3C7; color: #D97706; }
        .status-badge.overdue { background: #FEE2E2; color: #DC2626; }
        .btn-pay {
            background: var(--success-color);
            color: white;
            border: none;
            padding: 4px 12px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.875rem;
        }
        .paid-date { font-size: 0.875rem; color: var(--text-muted); }
      `}</style>
        </div>
    );
}

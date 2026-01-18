"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Student, Fee } from "@/types";
import { supabaseDataService } from "@/lib/services/SupabaseDataService";

export default function StudentFeesPage() {
    const { user } = useAuth();
    const [fees, setFees] = useState<Fee[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                // Find student ID first (since auth user ID matches student ID in our mock, but in real app usually linked)
                // Our mock uses same ID for user and student for simplicity in seeding? 
                // Actually in mock data: User 2 is John, Student 2 is John. Yes.
                const myFees = await supabaseDataService.getFeesByStudent(user.id);
                setFees(myFees);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div>
            <header className="page-header">
                <h1>My Fees</h1>
            </header>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Due Date</th>
                            <th>Payment Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map(fee => (
                            <tr key={fee.id}>
                                <td>{fee.month}</td>
                                <td>${fee.amount}</td>
                                <td>
                                    <span className={`status-badge ${fee.status}`}>
                                        {fee.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>{fee.dueDate}</td>
                                <td>{fee.paymentDate || '-'}</td>
                            </tr>
                        ))}
                        {fees.length === 0 && <tr><td colSpan={5}>No fee records found.</td></tr>}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .page-header { margin-bottom: var(--spacing-lg); }
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
      `}</style>
        </div>
    );
}

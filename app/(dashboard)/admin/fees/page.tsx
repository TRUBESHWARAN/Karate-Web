"use client";
import { useEffect, useState, useRef } from "react";
import { supabaseDataService } from "@/lib/services/SupabaseDataService";
import { Student, Fee } from "@/types";

export default function AdminFeesPage() {
    // State
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Data
    const [fees, setFees] = useState<(Fee & { studentName?: string })[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);

    // Filters
    const [studentFilter, setStudentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');

    // UI
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState<string | null>(null); // Student ID for history modal
    const [historyFees, setHistoryFees] = useState<Fee[]>([]);

    // Format YYYY-MM -> "MonthName YYYY"
    const formatMonthToData = (isoMonth: string) => {
        if (!isoMonth) return '';
        const [year, month] = isoMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Main fetch
    const fetchMonthData = async (isoMonth: string) => {
        setIsLoading(true);
        try {
            const monthStr = formatMonthToData(isoMonth);

            // 1. Ensure fees exist for this month (ONLY IN AUTO MODE)
            if (mode === 'auto') {
                await supabaseDataService.ensureFeesForMonth(monthStr);
            }

            // 2. Fetch fees for this month ONLY
            const f = await supabaseDataService.getFeesByMonth(monthStr);
            const s = await supabaseDataService.getStudents();

            // 3. User info
            if (!currentUser) {
                const user = await supabaseDataService.getCurrentUser();
                if (user) setCurrentUser({ name: user.name });
            }

            const enriched = f.map(fee => ({
                ...fee,
                studentName: s.find(st => st.id === fee.studentId)?.name || 'Unknown'
            }));

            setFees(enriched);
            setStudents(s);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthData(selectedMonth);
    }, [selectedMonth, mode]); // Re-fetch when month OR mode changes

    const handleCreateFee = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const studentId = formData.get('studentId') as string;
        const amount = Number(formData.get('amount'));
        const rawMonth = formData.get('month') as string; // YYYY-MM

        if (!studentId || !rawMonth) return;

        const formattedMonth = formatMonthToData(rawMonth); // Month YYYY

        // Check duplicate in current local state first (optimization)
        const exists = fees.some(f => f.studentId === studentId && f.month === formattedMonth);
        if (exists) {
            alert(`Fee for this student and month (${formattedMonth}) already exists!`);
            return;
        }

        try {
            await supabaseDataService.createFee({
                studentId,
                amount,
                month: formattedMonth,
                status: 'pending',
                dueDate: new Date(rawMonth + '-28').toISOString().split('T')[0]
            });
            fetchMonthData(selectedMonth);
            e.currentTarget.reset();
        } catch (error: any) {
            alert("Failed to create fee. It may already exist.");
        }
    };

    const handleMarkPaid = async (feeId: string) => {
        if (!currentUser) return;
        await supabaseDataService.updateFeeStatus(feeId, 'paid', currentUser.name);
        // Optimistic update or refetch
        fetchMonthData(selectedMonth);
    };

    const loadHistory = async (studentId: string) => {
        setShowHistory(studentId);
        const f = await supabaseDataService.getFeesByStudent(studentId);
        // Sort by date desc (rough appx by month string parsing or created_at if avail, 
        // but for now just show list)
        setHistoryFees(f);
    };

    // Computed
    const filteredFees = fees.filter(f => {
        if (studentFilter !== 'all' && f.studentId !== studentFilter) return false;
        if (statusFilter !== 'all' && f.status !== statusFilter) return false;
        return true;
    });

    const metrics = {
        totalStudents: students.length,
        paidCount: filteredFees.filter(f => f.status === 'paid').length,
        unpaidCount: filteredFees.filter(f => f.status !== 'paid').length,
        expected: filteredFees.reduce((sum, f) => sum + f.amount, 0),
        collected: filteredFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)
    };



    return (
        <div className="fee-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Fee Management</h1>
                    <div className="month-selector">
                        <label>Select Month:</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mode-toggle">
                    <button
                        className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
                        onClick={() => setMode('auto')}
                    >
                        Auto Monthly
                    </button>
                    <button
                        className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
                        onClick={() => setMode('manual')}
                    >
                        Manual Assign
                    </button>
                </div>
            </header>

            {mode === 'manual' && (
                <div className="fee-actions">
                    <form onSubmit={handleCreateFee} className="create-fee-form">
                        <h3>Assign New Fee (Manual)</h3>
                        <div className="form-row">
                            <select name="studentId" required>
                                <option value="">Select Student</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input
                                name="month"
                                type="month"
                                defaultValue={selectedMonth}
                                required
                            />
                            <input name="amount" type="number" placeholder="Amount (₹)" defaultValue={500} required />
                            <button type="submit" className="btn-primary">Assign Fee</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card">
                    <h3>Total Students</h3>
                    <p>{metrics.totalStudents}</p>
                </div>
                <div className="card success">
                    <h3>Paid</h3>
                    <p>{metrics.paidCount}</p>
                </div>
                <div className="card warning">
                    <h3>Unpaid</h3>
                    <p>{metrics.unpaidCount}</p>
                </div>
                <div className="card">
                    <h3>Expected</h3>
                    <p>₹{metrics.expected.toLocaleString()}</p>
                </div>
                <div className="card highlight">
                    <h3>Collected</h3>
                    <p>₹{metrics.collected.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="controls-bar">
                <div className="filter-group">
                    <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)}>
                        <option value="all">All Students</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Unpaid</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                {isLoading ? <p className="loading">Loading fees...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Amount (₹)</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Received By</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFees.map(fee => (
                                <tr key={fee.id}>
                                    <td>
                                        <button className="link-btn" onClick={() => loadHistory(fee.studentId)}>
                                            {fee.studentName}
                                        </button>
                                    </td>
                                    <td>₹{fee.amount}</td>
                                    <td>
                                        <span className={`status-badge ${fee.status}`}>
                                            {fee.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{fee.dueDate}</td>
                                    <td>{fee.receivedBy || '—'}</td>
                                    <td>
                                        {fee.status !== 'paid' ? (
                                            <button
                                                className="btn-pay"
                                                onClick={() => handleMarkPaid(fee.id)}
                                            >
                                                Mark Paid
                                            </button>
                                        ) : (
                                            <span className="paid-date">
                                                Paid {new Date(fee.paymentDate!).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && filteredFees.length === 0 && <p className="no-data">No records found.</p>}
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="modal-overlay" onClick={() => setShowHistory(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <header>
                            <h2>Fee History</h2>
                            <button className="close-btn" onClick={() => setShowHistory(null)}>×</button>
                        </header>
                        <div className="history-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyFees.map(h => (
                                        <tr key={h.id}>
                                            <td>{h.month}</td>
                                            <td>
                                                <span className={`status-badge ${h.status}`}>
                                                    {h.status}
                                                </span>
                                            </td>
                                            <td>{h.paymentDate ? new Date(h.paymentDate).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); }
                .header-left { display: flex; align-items: center; gap: var(--spacing-xl); }
                .month-selector { display: flex; align-items: center; gap: var(--spacing-sm); }
                .month-selector input { padding: 8px; border: 1px solid #ddd; border-radius: var(--radius-md); font-size: 1rem; }
                
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-xl);
                }
                .card {
                    background: white;
                    padding: var(--spacing-md);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    text-align: center;
                }
                .card h3 { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
                .card p { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0; }
                .card.success p { color: var(--success-color); }
                .card.warning p { color: #DC2626; }
                .card.highlight { border: 1px solid var(--primary-color); }
                .card.highlight p { color: var(--primary-color); }

                .controls-bar {
                    display: flex;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-md);
                }
                .filter-group select { padding: 8px; border: 1px solid #ddd; border-radius: var(--radius-md); min-width: 150px; }

                .table-container { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th, td { padding: var(--spacing-md); border-bottom: 1px solid #E5E7EB; }
                th { background: #F9FAFB; font-weight: 600; color: var(--text-secondary); }
                
                .status-badge { padding: 2px 8px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; display: inline-block; }
                .status-badge.paid { background: #D1FAE5; color: #059669; }
                .status-badge.pending { background: #FEF3C7; color: #D97706; }
                .status-badge.overdue { background: #FEE2E2; color: #DC2626; }

                .btn-pay { background: var(--success-color); color: white; border: none; padding: 4px 12px; border-radius: var(--radius-sm); cursor: pointer; }
                .link-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; text-decoration: underline; font-weight: 500; }
                .loading, .no-data { padding: 20px; text-align: center; color: var(--text-secondary); }

                /* Modal */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 100;
                }
                .modal-content {
                    background: white;
                    padding: var(--spacing-lg);
                    border-radius: var(--radius-lg);
                    width: 500px;
                    max-width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .modal-content header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-md); }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

                .mode-toggle {
                    background: #E5E7EB;
                    padding: 4px;
                    border-radius: var(--radius-md);
                    display: flex;
                    gap: 4px;
                }
                .mode-btn {
                    border: none;
                    background: transparent;
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .mode-btn.active {
                    background: white;
                    color: var(--primary-color);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .fee-actions {
                    background: white;
                    padding: var(--spacing-lg);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--spacing-xl);
                    box-shadow: var(--shadow-sm);
                }
                .form-row {
                    display: flex;
                    gap: var(--spacing-md);
                    flex-wrap: wrap;
                    align-items: center;
                }
                .form-row input, .form-row select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: var(--radius-md);
                }
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

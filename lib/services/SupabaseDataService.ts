import { DataService } from './DataService';
import { Student, Fee, Announcement, User } from '@/types';
import { supabase } from '@/lib/supabase';

export class SupabaseDataService implements DataService {

    // --- Auth ---
    async login(email: string): Promise<User | null> {
        // Handled by AuthContext directly via Supabase Auth
        return null;
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) return null;

        return {
            id: user.id,
            email: user.email!,
            role: profile.role,
            name: profile.full_name || user.email!.split('@')[0]
        };
    }

    // --- Students ---
    async getStudents(): Promise<Student[]> {
        const { data, error } = await supabase
            .from('students')
            .select('*, profiles(full_name)');

        if (error) {
            console.error('Error fetching students:', error);
            return [];
        }

        return data.map((s: any) => ({
            id: s.id,
            role: 'student',
            name: s.profiles?.full_name || 'Unknown',
            email: 'hidden@email.com',
            rank: s.rank,
            joinDate: s.join_date,
            age: s.age,
            emergencyContact: s.emergency_contact,
            phone: s.phone,
            address: s.address
        }));
    }

    async getStudentById(id: string): Promise<Student | null> {
        const { data, error } = await supabase
            .from('students')
            .select('*, profiles(full_name)')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            role: 'student',
            name: data.profiles?.full_name || 'Unknown',
            email: '',
            rank: data.rank,
            joinDate: data.join_date,
            age: data.age,
            dob: data.dob,
            bloodGroup: data.blood_group,
            emergencyContact: data.emergency_contact,
            phone: data.phone,
            address: data.address
        };
    }

    async addStudent(studentData: Omit<Student, 'id' | 'role'>): Promise<Student> {
        // In this architecture, Students sign up themselves to create auth user.
        // Admin cannot create auth users from client side without cloud functions.
        throw new Error("Cannot create Auth User from Client. Students must Sign Up themselves.");
    }

    async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .update({
                rank: updates.rank,
                age: updates.age,
                dob: updates.dob,
                blood_group: updates.bloodGroup,
                phone: updates.phone,
                address: updates.address,
                emergency_contact: updates.emergencyContact
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { ...updates, ...data } as Student;
    }

    async deleteStudent(id: string): Promise<void> {
        await supabase.from('students').delete().eq('id', id);
        await supabase.from('profiles').delete().eq('id', id);
    }

    // --- Fees ---
    async getFeesByStudent(studentId: string): Promise<Fee[]> {
        const { data, error } = await supabase
            .from('fees')
            .select('*')
            .eq('student_id', studentId);

        if (error) return [];
        return data.map((f: any) => ({
            id: f.id,
            studentId: f.student_id,
            month: f.month,
            amount: f.amount,
            status: f.status,
            dueDate: f.due_date,
            paymentDate: f.payment_date,
            receivedBy: f.received_by
        }));
    }

    async getAllFees(): Promise<Fee[]> {
        const { data, error } = await supabase.from('fees').select('*');
        if (error) return [];
        return data.map((f: any) => ({
            id: f.id,
            studentId: f.student_id,
            month: f.month,
            amount: f.amount,
            status: f.status,
            dueDate: f.due_date,
            paymentDate: f.payment_date,
            receivedBy: f.received_by
        }));
    }

    async updateFeeStatus(feeId: string, status: Fee['status'], receivedBy?: string): Promise<Fee> {
        const updates: any = { status };
        if (status === 'paid') {
            updates.payment_date = new Date().toISOString();
            if (receivedBy) updates.received_by = receivedBy;
        } else {
            updates.payment_date = null;
            updates.received_by = null;
        }

        const { data, error } = await supabase
            .from('fees')
            .update(updates)
            .eq('id', feeId)
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            studentId: data.student_id,
            month: data.month,
            amount: data.amount,
            status: data.status,
            dueDate: data.due_date,
            paymentDate: data.payment_date,
            receivedBy: data.received_by
        };
    }

    // Ensures that every student has a fee record for the specified month
    async ensureFeesForMonth(monthStr: string): Promise<void> {
        const students = await this.getStudents();
        const { data: existingFees } = await supabase
            .from('fees')
            .select('student_id')
            .eq('month', monthStr);

        const existingStudentIds = new Set((existingFees || []).map((f: any) => f.student_id));
        const feesToInsert: any[] = [];

        // Calculate due date (end of the specified month)
        // monthStr format: "MonthName YYYY" e.g. "January 2026"
        const [mName, yStr] = monthStr.split(' ');
        const monthIndex = new Date(`${mName} 1, 2000`).getMonth();
        const year = parseInt(yStr);
        const dueDate = new Date(year, monthIndex + 1, 0).toISOString(); // Last day of month

        students.forEach(student => {
            // Check if student joined before or during this month
            // monthIndex is 0-based index of selected month
            // year is selected year
            const monthStart = new Date(year, monthIndex, 1);
            const studentJoin = new Date(student.joinDate);

            // Only generate if student joined before the end of this month
            // Actually user requirement: "If student.join_date <= selected_month_start"
            // Let's be lenient: if joined in this month, they pay.
            // So if joinDate < nextMonthStart

            if (!existingStudentIds.has(student.id)) {
                // Parse join date safely
                if (!isNaN(studentJoin.getTime()) && studentJoin <= new Date(year, monthIndex + 1, 0)) {
                    feesToInsert.push({
                        student_id: student.id,
                        month: monthStr,
                        amount: 500, // Default fee
                        status: 'pending',
                        due_date: dueDate
                    });
                }
            }
        });

        if (feesToInsert.length > 0) {
            const { error } = await supabase.from('fees').insert(feesToInsert);
            if (error) console.error("Error creating monthly fees:", error);
        }
    }

    async getFeesByMonth(monthStr: string): Promise<Fee[]> {
        const { data, error } = await supabase
            .from('fees')
            .select('*')
            .eq('month', monthStr);

        if (error || !data) return [];
        return data.map((f: any) => ({
            id: f.id,
            studentId: f.student_id,
            month: f.month,
            amount: f.amount,
            status: f.status,
            dueDate: f.due_date,
            paymentDate: f.payment_date,
            receivedBy: f.received_by
        }));
    }

    async createFee(fee: Omit<Fee, 'id'>): Promise<Fee> {
        const { data, error } = await supabase
            .from('fees')
            .insert({
                student_id: fee.studentId,
                month: fee.month,
                amount: fee.amount,
                status: fee.status,
                due_date: fee.dueDate
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            studentId: data.student_id,
            month: data.month,
            amount: data.amount,
            status: data.status,
            dueDate: data.due_date,
            paymentDate: data.payment_date
        };
    }

    // --- Announcements ---
    async getAnnouncements(): Promise<Announcement[]> {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return [];
        return data.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            createdAt: new Date(a.created_at).toISOString().split('T')[0],
            authorId: a.author_id
        }));
    }

    async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
        const { data, error } = await supabase
            .from('announcements')
            .insert({
                title: announcement.title,
                content: announcement.content,
                author_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            title: data.title,
            content: data.content,
            createdAt: data.created_at,
            authorId: data.author_id
        };
    }

    async cleanupDuplicateFees(): Promise<number> {
        const { data: fees, error } = await supabase.from('fees').select('*');
        if (error || !fees) return 0;

        const uniqueMap = new Map<string, any>();
        const duplicatesToDelete: string[] = [];

        fees.forEach(fee => {
            const key = `${fee.student_id}-${fee.month}`;
            if (uniqueMap.has(key)) {
                const existing = uniqueMap.get(key);
                // Keep the one that is 'paid' or has later created_at if both same status
                // If existing is paid, keep it, mark current as delete
                // If current is paid and existing is not, keep current, mark existing delete
                // If both same, keep existing (arbitrary, or by updated_at?)

                if (existing.status === 'paid' && fee.status !== 'paid') {
                    duplicatesToDelete.push(fee.id);
                } else if (fee.status === 'paid' && existing.status !== 'paid') {
                    duplicatesToDelete.push(existing.id);
                    uniqueMap.set(key, fee);
                } else {
                    // Both paid or both pending -> delete valid duplicate
                    duplicatesToDelete.push(fee.id);
                }
            } else {
                uniqueMap.set(key, fee);
            }
        });

        if (duplicatesToDelete.length > 0) {
            await supabase.from('fees').delete().in('id', duplicatesToDelete);
        }

        return duplicatesToDelete.length;
    }
}

export const supabaseDataService = new SupabaseDataService();

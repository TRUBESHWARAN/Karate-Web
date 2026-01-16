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
            paymentDate: f.payment_date
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
            paymentDate: f.payment_date
        }));
    }

    async updateFeeStatus(feeId: string, status: Fee['status']): Promise<Fee> {
        const updates: any = { status };
        if (status === 'paid') updates.payment_date = new Date().toISOString();

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
            paymentDate: data.payment_date
        };
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
}

export const supabaseDataService = new SupabaseDataService();

import { DataService } from './DataService';
import { Student, Fee, Announcement, User } from '@/types';
import { supabase } from '@/lib/supabase';

export class SupabaseDataService implements DataService {

    // --- Auth (Handled mostly by AuthContext, but helper here) ---
    async login(email: string): Promise<User | null> {
        // In real Supabase, login is handled via supabase.auth.signInWithPassword
        // This method might be redundant or used to fetch profile after auth
        // For now, we return null as the AuthContext handles the session
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
        // Join profiles to get name and email
        const { data, error } = await supabase
            .from('students')
            .select('*, profiles(full_name, email:id)'); // Assuming email is not in profiles but auth.users, actually we need to join slightly differently or replicate email.
        // For simplicity in schema, we didn't store email in profiles. 
        // We will just fetch students and manually map or adjust schema.
        // Let's assume for this MVP we stored full_name in profiles.

        if (error) {
            console.error('Error fetching students:', error);
            return [];
        }

        // Determine how to get email. Supabase doesn't let you join auth.users easily.
        // We might need to store email in profiles or public.students.
        // For now, let's treat the 'profiles' join as the source of name.

        return data.map((s: any) => ({
            id: s.id,
            role: 'student',
            name: s.profiles?.full_name || 'Unknown',
            email: 'hidden@email.com', // RLS limitation on auth.users
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
            emergencyContact: data.emergency_contact,
            phone: data.phone,
            address: data.address
        };
    }

    async addStudent(studentData: Omit<Student, 'id' | 'role'>): Promise<Student> {
        // Creating a student in Supabase usually requires creating an Auth User first.
        // Admin cannot easily create "Auth Users" without backend functions.
        // For this MVP, we will assume the Student ALREADY Signed Up, 
        // and the Admin is just creating the Student Record for them?
        // OR we use a "Invite" flow.

        // Alternative: We create a row in 'students' and 'profiles' linked to a placeholder ID? No, ID must match auth. 

        // REVISED STRATEGY for MVP:
        // Admin creates a 'student' record. We might need a separate 'users' table if we aren't using Supabase Auth for *every* student yet.
        // But we promised Real Auth.
        // Let's implement: Admin cannot "create" a login-able user from client side easily.
        // Instead: We'll stick to updating existing profiles.

        throw new Error("Cannot create Auth User from Client. Students must Sign Up themselves.");
    }

    async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .update({
                rank: updates.rank,
                age: updates.age,
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
                // author_id: handled by RLS authentication usually, or passed explicitly
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

import { Student, Fee, Announcement, User, Admin } from '@/types';

export interface DataService {
    // Auth (Mock)
    login(email: string): Promise<User | null>;
    getCurrentUser(): Promise<User | null>;

    // Students
    getStudents(): Promise<Student[]>;
    getStudentById(id: string): Promise<Student | null>;
    addStudent(student: Omit<Student, 'id' | 'role'>): Promise<Student>;
    updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
    deleteStudent(id: string): Promise<void>;

    // Fees
    getFeesByStudent(studentId: string): Promise<Fee[]>;
    getAllFees(): Promise<Fee[]>; // Admin view
    updateFeeStatus(feeId: string, status: Fee['status']): Promise<Fee>;
    createFee(fee: Omit<Fee, 'id'>): Promise<Fee>;

    // Announcements
    getAnnouncements(): Promise<Announcement[]>;
    createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement>;
}

import { DataService } from '../DataService';
import { Student, Fee, Announcement, User, Role } from '@/types';

// Seed Data
const MOCK_USERS: User[] = [
    { id: '1', email: 'admin@karate.com', role: 'admin', name: 'Sensei Dave' },
    { id: '2', email: 'john@karate.com', role: 'student', name: 'John Doe' },
    { id: '3', email: 'jane@karate.com', role: 'student', name: 'Jane Smith' },
];

const MOCK_STUDENTS: Student[] = [
    {
        id: '2',
        email: 'john@karate.com',
        role: 'student',
        name: 'John Doe',
        rank: 'White Belt',
        joinDate: '2025-01-15',
        age: 10,
        emergencyContact: 'Mom: 555-0101',
        phone: '555-0102',
        address: '123 Dojo Way',
    },
    {
        id: '3',
        email: 'jane@karate.com',
        role: 'student',
        name: 'Jane Smith',
        rank: 'Yellow Belt',
        joinDate: '2024-06-01',
        age: 12,
        emergencyContact: 'Dad: 555-0202',
        phone: '555-0203',
        address: '456 Oak St',
    },
];

const MOCK_FEES: Fee[] = [
    { id: '101', studentId: '2', month: 'January 2026', amount: 50, status: 'pending', dueDate: '2026-01-31' },
    { id: '102', studentId: '3', month: 'January 2026', amount: 50, status: 'paid', paymentDate: '2026-01-05', dueDate: '2026-01-31' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: '1', title: 'Grading Next Week', content: 'Prepare for belt grading on Saturday!', createdAt: '2026-01-10', authorId: '1' },
];

// In-memory store (reset on reload)
let studentsStore = [...MOCK_STUDENTS];
let feesStore = [...MOCK_FEES];
let announcementsStore = [...MOCK_ANNOUNCEMENTS];

export class MockDataService implements DataService {
    async login(email: string): Promise<User | null> {
        const user = MOCK_USERS.find(u => u.email === email);
        if (user) return { ...user };
        return null;
    }

    async getCurrentUser(): Promise<User | null> {
        // In a real app, this verifies the session. 
        // Here we'll need a context to track logged in user, 
        // but the service itself is stateless usually. 
        // We'll rely on the Auth Context to hold the user.
        return null;
    }

    async getStudents(): Promise<Student[]> {
        return [...studentsStore];
    }

    async getStudentById(id: string): Promise<Student | null> {
        return studentsStore.find(s => s.id === id) || null;
    }

    async addStudent(studentData: Omit<Student, 'id' | 'role'>): Promise<Student> {
        const newStudent: Student = {
            ...studentData,
            id: Math.random().toString(36).substr(2, 9),
            role: 'student',
        };
        studentsStore.push(newStudent);
        // Also add to mock users for login
        MOCK_USERS.push({ id: newStudent.id, email: newStudent.email, role: 'student', name: newStudent.name });
        return newStudent;
    }

    async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
        const index = studentsStore.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Student not found');
        studentsStore[index] = { ...studentsStore[index], ...updates };
        return studentsStore[index];
    }

    async deleteStudent(id: string): Promise<void> {
        studentsStore = studentsStore.filter(s => s.id !== id);
    }

    async getFeesByStudent(studentId: string): Promise<Fee[]> {
        return feesStore.filter(f => f.studentId === studentId);
    }

    async getAllFees(): Promise<Fee[]> {
        return [...feesStore];
    }

    async updateFeeStatus(feeId: string, status: Fee['status']): Promise<Fee> {
        const fee = feesStore.find(f => f.id === feeId);
        if (!fee) throw new Error('Fee not found');
        fee.status = status;
        if (status === 'paid') fee.paymentDate = new Date().toISOString().split('T')[0];
        else fee.paymentDate = undefined;
        return fee;
    }

    async createFee(feeData: Omit<Fee, 'id'>): Promise<Fee> {
        const newFee = { ...feeData, id: Math.random().toString(36).substr(2, 9) };
        feesStore.push(newFee);
        return newFee;
    }

    async getAnnouncements(): Promise<Announcement[]> {
        // Sort by date desc
        return [...announcementsStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    async createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
        const newAnn = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString().split('T')[0]
        };
        announcementsStore.unshift(newAnn);
        return newAnn;
    }
}

export const mockDataService = new MockDataService();

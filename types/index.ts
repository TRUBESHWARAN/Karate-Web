export type Role = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface Student extends User {
  role: 'student';
  rank: string; // e.g. "White Belt", "Yellow Belt"
  joinDate: string;
  age: number;
  dob?: string;
  bloodGroup?: string;
  emergencyContact: string;
  phone: string;
  address: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Fee {
  id: string;
  studentId: string;
  month: string; // e.g., "October 2025"
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  dueDate: string;
  receivedBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
}


import { collection, getDocs, addDoc, updateDoc, doc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Parent {
    name: string;
    email: string;
    phone: string;
}

export interface Student {
    id: string;
    name: string;
    avatar: string;
    route: string;
    parent: Parent;
    status: 'Enrolled' | 'Withdrawn';
}

export const getStudents = async (): Promise<Student[]> => {
    if (!db) {
        console.error("Firestore not initialized");
        return [];
    }
    const studentsCol = collection(db, 'students');
    const studentSnapshot = await getDocs(query(studentsCol));
    const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    return studentList;
};

export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const studentsCol = collection(db, 'students');
    const docRef = await addDoc(studentsCol, student);
    return { id: docRef.id, ...student };
};

export const updateStudent = async (id: string, updates: Partial<Omit<Student, 'id'>>): Promise<void> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const studentDoc = doc(db, 'students', id);
    await updateDoc(studentDoc, updates);
};

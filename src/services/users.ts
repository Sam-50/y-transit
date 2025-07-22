
'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SUPERUSER_EMAILS = [
    'cypriankigen@yellowtransit.com',
    'sammykemboi@yellowtransit.com',
    'cynthia@yellowtransit.com',
    'okadeng@yellowtransit.com'
];

export async function isSuperUser(email: string): Promise<boolean> {
    return SUPERUSER_EMAILS.includes(email);
}

export const getUserRole = async (email: string, selectedRole: 'admin' | 'driver' | 'parent'): Promise<'admin' | 'driver' | 'parent' | 'unknown'> => {
    if (!db) {
        console.error("Firestore not initialized");
        return 'unknown';
    }

    if (await isSuperUser(email)) {
        return selectedRole;
    }

    // Check if user is a driver
    const driversCol = collection(db, 'drivers');
    const driverQuery = query(driversCol, where('email', '==', email));
    const driverSnapshot = await getDocs(driverQuery);
    if (!driverSnapshot.empty) {
        return selectedRole === 'driver' ? 'driver' : 'unknown';
    }

    // Check if user is a parent
    const studentsCol = collection(db, 'students');
    const parentQuery = query(studentsCol, where('parent.email', '==', email));
    const parentSnapshot = await getDocs(parentQuery);
    if (!parentSnapshot.empty) {
        return selectedRole === 'parent' ? 'parent' : 'unknown';
    }

    // If not a driver or parent, they can only be an admin.
    if (selectedRole === 'admin') {
         return 'admin';
    }
   
    // If they selected a role they don't have, access is denied.
    return 'unknown';
};


interface UserDetails {
    name: string;
    role: 'admin' | 'driver' | 'parent' | 'unknown';
}

export const getUserDetails = async (email: string): Promise<UserDetails> => {
    if (!db) {
        return { name: 'User', role: 'unknown' };
    }

    // Check drivers collection
    const driversCol = collection(db, 'drivers');
    const driverQuery = query(driversCol, where('email', '==', email));
    const driverSnapshot = await getDocs(driverQuery);
    if (!driverSnapshot.empty) {
        const driverData = driverSnapshot.docs[0].data();
        return { name: driverData.name, role: 'driver' };
    }

    // Check students collection for a parent
    const studentsCol = collection(db, 'students');
    const parentQuery = query(studentsCol, where('parent.email', '==', email));
    const parentSnapshot = await getDocs(parentQuery);
    if (!parentSnapshot.empty) {
        const studentData = parentSnapshot.docs[0].data();
        return { name: studentData.parent.name, role: 'parent' };
    }

    // Default to admin if not found elsewhere
    // In a real app, you might have an admins collection or a different way to identify admins
    return { name: email.split('@')[0], role: 'admin' };
};

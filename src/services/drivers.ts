
import { collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Driver {
    id: string;
    name: string;
    avatar: string;
    route: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    since: string;
    license: string;
    email?: string;
    phone?: string;
}

export const getDrivers = async (): Promise<Driver[]> => {
    if (!db) {
        console.error("Firestore not initialized");
        return [];
    }
    const driversCol = collection(db, 'drivers');
    const driverSnapshot = await getDocs(driversCol);
    const driverList = driverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
    return driverList;
};

export const addDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
     if (!db) {
        throw new Error("Firestore not initialized");
    }
    const driversCol = collection(db, 'drivers');
    const docRef = await addDoc(driversCol, driver);
    // Fetch the newly created document to get its data along with the ID
    const newDocSnapshot = await getDoc(docRef);
    if (!newDocSnapshot.exists()) {
        throw new Error("Failed to create and retrieve new driver document.");
    }
    return { id: newDocSnapshot.id, ...newDocSnapshot.data() } as Driver;
};

export const updateDriver = async (id: string, updates: Partial<Omit<Driver, 'id'>>): Promise<void> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const driverDoc = doc(db, 'drivers', id);
    await updateDoc(driverDoc, updates);
};

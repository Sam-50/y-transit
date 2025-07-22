
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStudents } from './students';
import { getDrivers } from './drivers';

export interface Route {
    id: string;
    name: string;
    driver: string;
    students: number;
    stops: number;
    onTimeRate: string;
}

export const getRoutes = async (): Promise<Route[]> => {
    if (!db) {
        console.error("Firestore not initialized");
        return [];
    }
    const routesCol = collection(db, 'routes');
    const routeSnapshot = await getDocs(routesCol);
    
    const [students, drivers] = await Promise.all([getStudents(), getDrivers()]);

    const studentCountByRoute = students.reduce((acc, student) => {
        if (student.route) {
            acc[student.route] = (acc[student.route] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const driverByRoute = drivers.reduce((acc, driver) => {
        if (driver.route && driver.route !== 'N/A') {
            acc[driver.route] = driver.name;
        }
        return acc;
    }, {} as Record<string, string>);

    const routeList = routeSnapshot.docs.map(doc => {
        const routeData = doc.data();
        const routeName = routeData.name;
        return { 
            id: doc.id, 
            ...routeData,
            students: studentCountByRoute[routeName] || 0,
            driver: driverByRoute[routeName] || 'Unassigned',
        } as Route
    });

    return routeList;
};

export const addRoute = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const routesCol = collection(db, 'routes');
    const docRef = await addDoc(routesCol, route);
    return { id: docRef.id, ...route };
};

export const updateRoute = async (id: string, updates: Partial<Omit<Route, 'id'>>): Promise<void> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const routeDoc = doc(db, 'routes', id);
    await updateDoc(routeDoc, updates);
};

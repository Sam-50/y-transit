
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type IncidentSeverity = 'Low' | 'Medium' | 'High';
export type IncidentStatus = 'Closed' | 'Under Review' | 'Investigation Open' | 'Escalated';

export interface Incident {
    id: string;
    route: string;
    driver: string;
    date: string;
    report: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
}

export const getIncidents = async (): Promise<Incident[]> => {
    if (!db) {
        console.error("Firestore not initialized");
        return [];
    }
    const incidentsCol = collection(db, 'incidents');
    const incidentSnapshot = await getDocs(incidentsCol);
    const incidentList = incidentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
    return incidentList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addIncident = async (incident: Omit<Incident, 'id'>): Promise<Incident> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const incidentsCol = collection(db, 'incidents');
    const docRef = await addDoc(incidentsCol, incident);
    return { id: docRef.id, ...incident };
};

export const updateIncident = async (id: string, updates: Partial<Omit<Incident, 'id'>>): Promise<void> => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    const incidentDoc = doc(db, 'incidents', id);
    await updateDoc(incidentDoc, updates);
};


import { getStudents, type Student } from './students';

export interface ParentWithChildren {
    name: string;
    email: string;
    phone: string;
    children: string[];
}

export const getParents = async (): Promise<ParentWithChildren[]> => {
    const students = await getStudents();
    
    const parentMap = new Map<string, ParentWithChildren>();

    students.forEach(student => {
        const parentEmail = student.parent.email;
        if (!parentMap.has(parentEmail)) {
            parentMap.set(parentEmail, {
                ...student.parent,
                children: []
            });
        }
        parentMap.get(parentEmail)!.children.push(student.name);
    });

    return Array.from(parentMap.values());
};

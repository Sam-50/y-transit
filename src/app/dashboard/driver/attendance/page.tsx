
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ListChecks, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getStudents, type Student, updateStudent } from '@/services/students';
import { useToast } from '@/hooks/use-toast';

type TripStatus = 'not_started' | 'in_progress' | 'ended';
type TripPeriod = 'MORNING' | 'EVENING' | 'NONE';

const MORNING_TRIP_START_HOUR = 6;
const MORNING_TRIP_END_HOUR = 10;
const EVENING_TRIP_START_HOUR = 14;
const EVENING_TRIP_END_HOUR = 18;

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [tripStatus, setTripStatus] = useState<TripStatus>('in_progress');
    const [currentTripPeriod, setCurrentTripPeriod] = useState<TripPeriod>('NONE');

     useEffect(() => {
        const checkCurrentTime = () => {
        const currentHour = new Date().getHours();
        if (currentHour >= MORNING_TRIP_START_HOUR && currentHour < MORNING_TRIP_END_HOUR) {
            setCurrentTripPeriod('MORNING');
        } else if (currentHour >= EVENING_TRIP_START_HOUR && currentHour < EVENING_TRIP_END_HOUR) {
            setCurrentTripPeriod('EVENING');
        } else {
            setCurrentTripPeriod('NONE');
        }
        };
        checkCurrentTime();
        const tripTimer = setInterval(checkCurrentTime, 60000); // every minute
        return () => clearInterval(tripTimer);
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch students for the current driver's route.
                const fetchedStudents = await getStudents();
                setStudents(fetchedStudents);
            } catch (error) {
                console.error("Failed to fetch students:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load student data.'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, [toast]);


    const handleAttendanceChange = async (studentId: string, checked: boolean | 'indeterminate') => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let newStatus: Student['status'] = student.status;
        if (checked) {
            newStatus = currentTripPeriod === 'MORNING' ? 'Enrolled' : 'Enrolled'; // Simplified status logic
        } else {
            newStatus = 'Withdrawn'; // Simplified status logic
        }

        try {
            await updateStudent(studentId, { status: newStatus });
            setStudents(prevStudents =>
                prevStudents.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
            );
            toast({
                title: 'Attendance Updated',
                description: `${student.name}'s status has been updated.`
            });
        } catch (error) {
            console.error("Failed to update attendance:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update attendance status.'
            });
        }
    };
    
    const isTripInProgress = tripStatus === 'in_progress';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Attendance Marking</h1>
                <p className="text-muted-foreground">Mark student pickups and drop-offs for your route.</p>
            </div>
            
            {!isTripInProgress && (
                <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/50">
                    <AlertCircle className="h-4 w-4 !text-yellow-600" />
                    <AlertTitle>Trip Not Started</AlertTitle>
                    <AlertDescription>
                        You must start the trip from the main dashboard before you can mark attendance.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Student Roster ({currentTripPeriod})</CardTitle>
                    <CardDescription>Check off students as they are picked up or dropped off. Data is fetched from the database.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {students.map((student, index) => (
                                <div key={student.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox 
                                                id={student.id} 
                                                checked={student.status === 'Enrolled'}
                                                disabled={!isTripInProgress || student.status === 'Withdrawn'}
                                                onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                                            />
                                            <label
                                                htmlFor={student.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {student.name}
                                            </label>
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            student.status === 'Enrolled' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </div>
                                    {index < students.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

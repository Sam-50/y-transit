
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Users, ShieldAlert, PlayCircle, StopCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { getStudents, type Student, updateStudent } from '@/services/students';
import { getRoutes, type Route } from '@/services/routes';

type TripStatus = 'not_started' | 'in_progress' | 'ended';
type TripPeriod = 'MORNING' | 'EVENING' | 'NONE';

const MORNING_TRIP_START_HOUR = 6;
const MORNING_TRIP_END_HOUR = 10;
const EVENING_TRIP_START_HOUR = 14;
const EVENING_TRIP_END_HOUR = 18;

export default function DriverDashboardPage({ welcomeProps }: { welcomeProps?: { user: 'Admin' | 'Driver' | 'Parent', name: string }}) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripStatus, setTripStatus] = useState<TripStatus>('not_started');
  const [currentTripPeriod, setCurrentTripPeriod] = useState<TripPeriod>('NONE');
  const [tripTitle, setTripTitle] = useState("Today's Route");

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // In a real app, you would fetch students & route for the current driver.
            const [fetchedStudents, fetchedRoutes] = await Promise.all([getStudents(), getRoutes()]);
            setStudents(fetchedStudents);
            if(fetchedRoutes.length > 0) {
              setRoute(fetchedRoutes[0]); // Assign first route for demo
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard data.' });
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    const checkCurrentTime = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= MORNING_TRIP_START_HOUR && currentHour < MORNING_TRIP_END_HOUR) {
        setCurrentTripPeriod('MORNING');
        setTripTitle(`Today's Morning Route: ${route?.name || ''}`);
      } else if (currentHour >= EVENING_TRIP_START_HOUR && currentHour < EVENING_TRIP_END_HOUR) {
        setCurrentTripPeriod('EVENING');
        setTripTitle(`Today's Evening Route: ${route?.name || ''}`);
      } else {
        setCurrentTripPeriod('NONE');
        setTripTitle("No Active Trip");
      }
    };
    checkCurrentTime();
    const tripTimer = setInterval(checkCurrentTime, 60000);
    return () => clearInterval(tripTimer);
  }, [route]);
  
  const handleStartTrip = () => {
    setTripStatus('in_progress');
    toast({
        title: `${currentTripPeriod} Trip Started`,
        description: "Admins and parents have been notified that the trip has started.",
    })
  }

  const handleEndTrip = () => {
    setTripStatus('ended');
     toast({
        title: `${currentTripPeriod} Trip Ended`,
        description: "Admins and parents have been notified that the trip is complete.",
    })
  }

  const handleAttendanceChange = async (studentId: string, checked: boolean | 'indeterminate') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newStatus = checked ? 'Enrolled' : 'Withdrawn';
    try {
        await updateStudent(student.id, { status: newStatus });
        setStudents(prevStudents =>
          prevStudents.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
        );
        toast({
            title: 'Attendance Updated',
            description: `${student.name} marked as ${newStatus === 'Enrolled' ? 'Present' : 'Absent'}.`
        });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update student status.' });
    }
  };
  
  const isTripTime = currentTripPeriod !== 'NONE';

  const stopsRemaining = route ? route.stops - students.filter(s => s.status === 'Enrolled').length : 0;

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Driver Dashboard</h1>
          <p className="text-muted-foreground">Have a safe and great day on your route!</p>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Student Attendance</CardTitle>
                    <CardDescription>Check off students as they are picked up or dropped off. Enabled only during a trip. Data is fetched from the database.</CardDescription>
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
                                            disabled={student.status === 'Withdrawn' || tripStatus !== 'in_progress'}
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
        
        <div className="space-y-8">
            <Card className="lg:hidden">
                <CardHeader>
                     <CardTitle>Trip Control</CardTitle>
                </CardHeader>
                <CardContent>
                     {tripStatus === 'not_started' && (
                        <>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" onClick={handleStartTrip} disabled={!isTripTime}>
                            <PlayCircle className="mr-2 h-4 w-4" /> Start {currentTripPeriod === 'NONE' ? 'Trip' : `${currentTripPeriod} Trip`}
                        </Button>
                        {!isTripTime && (
                         <p className="text-xs text-center text-muted-foreground flex items-center gap-2 justify-center mt-2">
                            <Clock className="h-4 w-4" /> Next trip is not for a while.
                         </p>
                        )}
                        </>
                     )}
                     {tripStatus === 'in_progress' && (
                        <Button className="w-full" variant="destructive" size="lg" onClick={handleEndTrip}>
                            <StopCircle className="mr-2 h-4 w-4" /> End Trip
                        </Button>
                     )}
                     {tripStatus === 'ended' && (
                        <p className="text-sm text-center text-muted-foreground">Trip for today is complete.</p>
                     )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button variant="outline" className="w-full" size="lg" asChild>
                        <Link href="/dashboard/report-safety">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Report Incident
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Route Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                    <>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Students:</span>
                        <span>{students.length}</span>
                    </div>
                     <div className="hidden lg:flex justify-between">
                        <span className="text-muted-foreground">Trip Control:</span>
                         {tripStatus === 'not_started' && (
                            <Button className="bg-green-600 hover:bg-green-700 text-white h-7 px-2" onClick={handleStartTrip} disabled={!isTripTime}>
                                <PlayCircle className="mr-2 h-4 w-4" /> Start
                            </Button>
                        )}
                        {tripStatus === 'in_progress' && (
                            <Button className="h-7 px-2" variant="destructive" onClick={handleEndTrip}>
                                <StopCircle className="mr-2 h-4 w-4" /> End
                            </Button>
                        )}
                         {tripStatus === 'ended' && (
                            <p className="text-sm text-right text-muted-foreground">Done</p>
                         )}
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Stops Remaining:</span>
                        <span>{stopsRemaining > 0 ? stopsRemaining : 0}</span>
                    </div>
                     <div className="flex justify-between font-medium">
                        <span className="text-muted-foreground">Trip Status:</span>
                         <span className={tripStatus === 'in_progress' ? 'text-green-600' : ''}>
                           {tripStatus === 'not_started' && 'Not Started'}
                           {tripStatus === 'in_progress' && 'In Progress'}
                           {tripStatus === 'ended' && 'Completed'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. On-Time Rate:</span>
                        <span>{route?.onTimeRate || 'N/A'}</span>
                    </div>
                    </>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

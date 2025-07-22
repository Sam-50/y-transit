
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks, AlertCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { getStudents, updateStudent, type Student } from '@/services/students';


export default function ParentAttendancePage() {
  const { toast } = useToast();
  const [children, setChildren] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchChildrenData = async () => {
          setIsLoading(true);
          try {
              // In a real app, you would fetch children for the logged-in parent.
              // For demo, we fetch all students.
              const students = await getStudents();
              setChildren(students);
          } catch(e) {
              console.error("Failed to fetch children data:", e);
              toast({ variant: 'destructive', title: 'Error', description: 'Could not load children data.' });
          } finally {
              setIsLoading(false);
          }
      };
      fetchChildrenData();
  }, [toast]);

  const handleAttendanceChange = async (childId: string, status: 'Enrolled' | 'Withdrawn') => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    try {
        await updateStudent(childId, { status });
        setChildren(prev => 
            prev.map(c => 
                c.id === childId ? {...c, status: status} : c
            )
        );
        toast({
            title: "Attendance Updated",
            description: `${child.name} has been marked as ${status === 'Enrolled' ? 'Present' : 'Absent'} for today. The driver has been notified.`,
        });
    } catch (e) {
        console.error("Failed to update status", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update attendance.' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Student Attendance</h1>
        <p className="text-muted-foreground">View the real-time attendance status and mark your child as absent if needed.</p>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/50">
          <AlertCircle className="h-4 w-4 !text-blue-600" />
          <AlertTitle>Attendance Information</AlertTitle>
          <AlertDescription>
              The "Bus Status" is updated by the driver in real-time. You can mark your child as absent for the day below, which will notify the driver.
          </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Today's Status</CardTitle>
          <CardDescription>Attendance status for your children from the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoading ? (
                 <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            ) : children.map((child, index) => (
                <Card key={child.id} className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={child.avatar} alt={child.name} data-ai-hint="child portrait" />
                                <AvatarFallback>{child.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{child.name}</p>
                                <p className="text-sm text-muted-foreground">{child.route}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Bus Status</p>
                             <Badge variant={child.status === 'Enrolled' ? 'default' : 'secondary'} className={child.status === 'Enrolled' ? 'bg-green-500 text-white' : ''}>
                                {child.status === 'Enrolled' ? 'On Bus' : 'Absent'}
                            </Badge>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div>
                        <Label className="text-sm font-medium">Mark Today's Attendance</Label>
                        <RadioGroup 
                          value={child.status} 
                          onValueChange={(value: 'Enrolled' | 'Withdrawn') => handleAttendanceChange(child.id, value)} 
                          className="flex items-center gap-6 mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Enrolled" id={`${child.id}-present`} />
                                <Label htmlFor={`${child.id}-present`}>Present</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Withdrawn" id={`${child.id}-absent`} />
                                <Label htmlFor={`${child.id}-absent`}>Absent</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </Card>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

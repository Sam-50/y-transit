
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStudents, type Student } from '@/services/students';

export default function MyStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentsForRoute = async () => {
        setIsLoading(true);
        // In a real app, you would fetch students for the current driver's route.
        // e.g., getStudentsByRoute('North Route');
        const allStudents = await getStudents(); 
        setStudents(allStudents);
        setIsLoading(false);
    }
    fetchStudentsForRoute();
  }, []);

  const handleContactParent = (parentName: string) => {
    toast({
      title: "Contacting Parent",
      description: `A message has been sent to ${parentName}. They will be notified shortly.`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Students</h1>
        <p className="text-muted-foreground">List of students assigned to your route.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Route Student Roster</CardTitle>
          <CardDescription>A list of all students assigned to your bus today from the database.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assigned Route</TableHead>
                    <TableHead className="hidden sm:table-cell">Parent/Guardian</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="child avatar" />
                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span>{student.name}</span>
                                <span className="text-sm text-muted-foreground sm:hidden">{student.parent.name}</span>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>{student.route}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.parent.name}</TableCell>
                        <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleContactParent(student.parent.name)}>
                                <Phone className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Contact</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

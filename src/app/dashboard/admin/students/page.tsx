
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus, User, Mail, Phone, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Student, getStudents, addStudent, updateStudent } from '@/services/students';
import { type Route, getRoutes } from '@/services/routes';

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignRouteOpen, setIsAssignRouteOpen] = useState(false);
  const [isParentDetailsOpen, setIsParentDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [fetchedStudents, fetchedRoutes] = await Promise.all([getStudents(), getRoutes()]);
      setStudents(fetchedStudents);
      setAvailableRoutes(fetchedRoutes);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newStudentData = {
      name: formData.get('studentName') as string,
      avatar: 'https://placehold.co/40x40.png',
      route: 'N/A',
      parent: { 
        name: formData.get('parentName') as string,
        email: formData.get('parentEmail') as string,
        phone: formData.get('parentPhone') as string
      },
      status: 'Enrolled' as const,
    };
    
    try {
        const newStudent = await addStudent(newStudentData);
        setStudents(prev => [...prev, newStudent]);
        setIsAddDialogOpen(false);
        form.reset();
        toast({
            title: "Student Added",
            description: `${newStudent.name} has been successfully enrolled.`,
        });
    } catch (e) {
        toast({ variant: 'destructive', title: "Error", description: "Could not add student." });
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const openAssignRouteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsAssignRouteOpen(true);
  };

  const openParentDetailsDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsParentDetailsOpen(true);
  };

  const handleEditStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;
    
    const formData = new FormData(event.currentTarget);
    const updatedData = {
        name: formData.get('studentName') as string,
        parent: {
            name: formData.get('parentName') as string,
            email: formData.get('parentEmail') as string,
            phone: formData.get('parentPhone') as string,
        }
    };
    
    try {
        await updateStudent(selectedStudent.id, updatedData);
        setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, ...updatedData } : s));
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
        toast({
            title: "Student Updated",
            description: `${updatedData.name}'s information has been updated.`,
        });
    } catch (e) {
        toast({ variant: 'destructive', title: "Error", description: "Could not update student information." });
    }
  };
  
  const handleAssignRoute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;
    
    const formData = new FormData(event.currentTarget);
    const newRoute = formData.get('route') as string;

    try {
        await updateStudent(selectedStudent.id, { route: newRoute });
        setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, route: newRoute } : s));
        setIsAssignRouteOpen(false);
        setSelectedStudent(null);
        toast({
            title: "Route Assigned",
            description: `${selectedStudent.name} has been assigned to ${newRoute}.`,
        });
    } catch (e) {
        toast({ variant: 'destructive', title: "Error", description: "Could not assign route." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Management</h1>
          <p className="text-muted-foreground">Manage student enrollment for bus services.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Enter the student and parent details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentName" className="text-right">Student Name</Label>
                  <Input id="studentName" name="studentName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parentName" className="text-right">Parent/Guardian</Label>
                  <Input id="parentName" name="parentName" className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parentEmail" className="text-right">Parent Email</Label>
                  <Input id="parentEmail" name="parentEmail" type="email" className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parentPhone" className="text-right">Parent Phone</Label>
                  <Input id="parentPhone" name="parentPhone" type="tel" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>A list of all students enrolled in the transport system.</CardDescription>
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
                  <TableHead className="hidden md:table-cell">Parent/Guardian</TableHead>
                  <TableHead>Status</TableHead>
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
                        <span>{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.route}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.parent.name}</TableCell>
                     <TableCell>
                      <Badge variant={student.status === 'Enrolled' ? 'secondary' : 'outline'}
                            className={student.status === 'Enrolled' ? 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30' : ''}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => openEditDialog(student)}>Edit Information</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openAssignRouteDialog(student)}>Assign to Route</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openParentDetailsDialog(student)}>View Parent Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-studentName" className="text-right">Student Name</Label>
                <Input id="edit-studentName" name="studentName" className="col-span-3" defaultValue={selectedStudent?.name} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-parentName" className="text-right">Parent/Guardian</Label>
                <Input id="edit-parentName" name="parentName" className="col-span-3" defaultValue={selectedStudent?.parent.name} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-parentEmail" className="text-right">Parent Email</Label>
                <Input id="edit-parentEmail" name="parentEmail" type="email" className="col-span-3" defaultValue={selectedStudent?.parent.email} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-parentPhone" className="text-right">Parent Phone</Label>
                <Input id="edit-parentPhone" name="parentPhone" type="tel" className="col-span-3" defaultValue={selectedStudent?.parent.phone} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Assign Route Dialog */}
      <Dialog open={isAssignRouteOpen} onOpenChange={setIsAssignRouteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Route</DialogTitle>
            <DialogDescription>Assign a route for {selectedStudent?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignRoute}>
            <div className="grid gap-4 py-4">
               <Select name="route" required defaultValue={selectedStudent?.route !== 'N/A' ? selectedStudent?.route : undefined}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                      {availableRoutes.map(route => (
                          <SelectItem key={route.id} value={route.name}>{route.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Assign Route</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Parent Details Dialog */}
      <Dialog open={isParentDetailsOpen} onOpenChange={setIsParentDetailsOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Parent/Guardian Details</DialogTitle>
                  <DialogDescription>Contact information for {selectedStudent?.parent.name}.</DialogDescription>
              </DialogHeader>
              {selectedStudent && (
                  <div className="grid gap-4 py-4 text-sm">
                      <div className="flex items-center gap-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Name</span>
                            <span>{selectedStudent.parent.name}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                            <span className="text-muted-foreground">Email</span>
                            <a href={`mailto:${selectedStudent.parent.email}`} className="text-primary hover:underline">{selectedStudent.parent.email}</a>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                           <div className="flex flex-col">
                            <span className="text-muted-foreground">Phone</span>
                            <a href={`tel:${selectedStudent.parent.phone}`} className="text-primary hover:underline">{selectedStudent.parent.phone}</a>
                          </div>
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button onClick={() => setIsParentDetailsOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

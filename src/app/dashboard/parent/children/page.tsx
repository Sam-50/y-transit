
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Edit, FileText, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type Student, getStudents, updateStudent } from '@/services/students';

// Assuming in a real app, we'd filter students by the logged-in parent.
// For this demo, we will show all students.

export default function ChildManagementPage() {
    const { toast } = useToast();
    const [children, setChildren] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<Student | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        const fetchChildren = async () => {
            setIsLoading(true);
            // In a real app, this would be `getChildrenForParent(auth.currentUser.id)`
            const allStudents = await getStudents(); 
            setChildren(allStudents);
            setIsLoading(false);
        }
        fetchChildren();
    }, []);

    const handleContactDriver = (childName: string) => {
        toast({
            title: "Contacting Driver",
            description: `A message has been sent to the driver regarding ${childName}. They will respond when it is safe to do so.`,
        })
    }

    const openViewDialog = (child: Student) => {
        setSelectedChild(child);
        setIsViewDialogOpen(true);
    }
    
    const openEditDialog = (child: Student) => {
        setSelectedChild(child);
        setIsEditDialogOpen(true);
    }

    const handleEditChild = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedChild) return;

        const formData = new FormData(event.currentTarget);
        const updatedData = {
            name: formData.get('name') as string,
            parent: {
                ...selectedChild.parent,
                name: formData.get('parentName') as string,
            }
        };
        
        try {
            await updateStudent(selectedChild.id, updatedData);
            setChildren(children.map(c => c.id === selectedChild.id ? { ...c, ...updatedData } : c));
            setIsEditDialogOpen(false);
            toast({
                title: "Details Updated",
                description: `Information for ${updatedData.name} has been updated.`,
            });
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Could not update details." });
        }
    };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Child Management</h1>
          <p className="text-muted-foreground">View and manage your children's transportation details.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6">
            {children.map((child) => (
                <Card key={child.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={child.avatar} alt={child.name} data-ai-hint="child portrait" />
                                <AvatarFallback>{child.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{child.name}</CardTitle>
                                <CardDescription>{child.route}</CardDescription>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5"/>
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => openViewDialog(child)}>
                                    <FileText className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openEditDialog(child)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleContactDriver(child.name)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Contact Driver
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="font-medium">Assigned Route</p>
                                <p className="text-muted-foreground">{child.route}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">Parent/Guardian</p>
                                <p className="text-muted-foreground">{child.parent.name}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

       {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> {selectedChild?.name}'s Details</DialogTitle>
            <DialogDescription>Full details for your child's transportation.</DialogDescription>
          </DialogHeader>
           {selectedChild && (
            <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right text-muted-foreground">Route</Label>
                    <span className="col-span-2">{selectedChild.route}</span>
                </div>
                 <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right text-muted-foreground">Parent</Label>
                    <span className="col-span-2">{selectedChild.parent.name}</span>
                </div>
                 <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right text-muted-foreground">Parent Email</Label>
                    <span className="col-span-2">{selectedChild.parent.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-right text-muted-foreground">Parent Phone</Label>
                    <span className="col-span-2">{selectedChild.parent.phone}</span>
                </div>
            </div>
           )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Details</DialogTitle>
                <DialogDescription>Update the information for {selectedChild?.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditChild}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" defaultValue={selectedChild?.name} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="parentName" className="text-right">Parent Name</Label>
                        <Input id="parentName" name="parentName" defaultValue={selectedChild?.parent.name} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

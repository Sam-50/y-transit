
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Driver, getDrivers, addDriver, updateDriver } from '@/services/drivers';
import { type Route, getRoutes } from '@/services/routes';

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignRouteOpen, setIsAssignRouteOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedDrivers, fetchedRoutes] = await Promise.all([getDrivers(), getRoutes()]);
        setDrivers(fetchedDrivers);
        setAvailableRoutes(fetchedRoutes);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Could not retrieve driver and route information from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddDriver = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newDriverData: Omit<Driver, 'id'> = {
      name: formData.get('name') as string,
      license: formData.get('license') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      avatar: 'https://placehold.co/40x40.png',
      route: 'N/A',
      status: 'Active',
      since: new Date().toISOString().split('T')[0],
    };

    try {
        const newDriver = await addDriver(newDriverData);
        setDrivers(prev => [...prev, newDriver]);
        setIsAddDialogOpen(false);
        form.reset();
        toast({
            title: "Driver Added",
            description: `${newDriver.name} has been successfully added to the roster.`,
        });
    } catch(e) {
        console.error("Failed to add driver:", e);
        toast({ variant: 'destructive', title: "Error", description: "Could not add driver. Please check your connection and try again." });
    }
  };

  const handleEditDriver = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDriver) return;

    const formData = new FormData(event.currentTarget);
    const updatedData = {
      name: formData.get('name') as string,
      license: formData.get('license') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    try {
        await updateDriver(selectedDriver.id, updatedData);
        setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...d, ...updatedData } : d));
        setIsEditDialogOpen(false);
        setSelectedDriver(null);
        toast({
            title: "Driver Updated",
            description: `${updatedData.name}'s profile has been updated.`,
        });
    } catch(e) {
        console.error("Failed to update driver:", e);
        toast({ variant: 'destructive', title: "Error", description: "Could not update driver." });
    }
  };

  const handleAssignRoute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDriver) return;

    const formData = new FormData(event.currentTarget);
    const assignedRoute = formData.get('route') as string;
    
    try {
        await updateDriver(selectedDriver.id, { route: assignedRoute });
        setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...d, route: assignedRoute } : d));
        setIsAssignRouteOpen(false);
        setSelectedDriver(null);
        toast({
            title: "Route Assigned",
            description: `${selectedDriver.name} has been assigned to ${assignedRoute}.`,
        });
    } catch(e) {
        console.error("Failed to assign route:", e);
        toast({ variant: 'destructive', title: "Error", description: "Could not assign route." });
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    const newStatus = driver.status === 'Active' ? 'Inactive' : 'Active';

    try {
        await updateDriver(driver.id, { status: newStatus });
        setDrivers(drivers.map(d => d.id === driver.id ? { ...d, status: newStatus } : d));
        toast({
          title: "Status Updated",
          description: `${driver.name}'s status has been changed to ${newStatus}.`
        });
    } catch(e) {
        console.error("Failed to toggle status:", e);
        toast({ variant: 'destructive', title: "Error", description: "Could not update status." });
    }
  };
  
  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsEditDialogOpen(true);
  }

  const openAssignRouteDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsAssignRouteOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Driver Management</h1>
          <p className="text-muted-foreground">View, add, and manage your bus drivers.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>Enter the details for the new driver.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDriver}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="license" className="text-right">License No.</Label>
                        <Input id="license" name="license" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" name="email" type="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" name="phone" type="tel" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Add Driver</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Roster</CardTitle>
          <CardDescription>A list of all drivers in the system. Data is fetched from the database.</CardDescription>
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
                    <TableHead>Driver</TableHead>
                    <TableHead className="hidden md:table-cell">Assigned Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Member Since</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={driver.avatar} alt={driver.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                             <span>{driver.name}</span>
                             <span className="text-muted-foreground text-sm md:hidden">{driver.route}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{driver.route}</TableCell>
                      <TableCell>
                        <Badge variant={driver.status === 'Active' ? 'default' : driver.status === 'On Leave' ? 'secondary' : 'destructive'} 
                               className={driver.status === 'Active' ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : ''}>
                          {driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{driver.since}</TableCell>
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
                            <DropdownMenuItem onSelect={() => openEditDialog(driver)}>Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openAssignRouteDialog(driver)}>Assign Route</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => handleToggleStatus(driver)}>
                              {driver.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
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
      
      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Driver Profile</DialogTitle>
            <DialogDescription>Update the driver's details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDriver}>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-name" className="text-right">Name</Label>
                      <Input id="edit-name" name="name" className="col-span-3" defaultValue={selectedDriver?.name} required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-license" className="text-right">License No.</Label>
                      <Input id="edit-license" name="license" className="col-span-3" defaultValue={selectedDriver?.license} required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email" className="text-right">Email</Label>
                        <Input id="edit-email" name="email" type="email" className="col-span-3" defaultValue={selectedDriver?.email} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                        <Input id="edit-phone" name="phone" type="tel" className="col-span-3" defaultValue={selectedDriver?.phone} />
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
            <DialogDescription>Assign a route to {selectedDriver?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignRoute}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route" className="text-right">Route</Label>
                <div className="col-span-3">
                   <Select name="route" required defaultValue={selectedDriver?.route !== 'N/A' ? selectedDriver?.route : undefined}>
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
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Assign Route</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

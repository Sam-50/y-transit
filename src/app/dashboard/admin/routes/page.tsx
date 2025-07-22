
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Users, Clock, AlertCircle, Loader2, Route as RouteIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type Route, getRoutes, addRoute, updateRoute } from '@/services/routes';

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoutes = async () => {
      setIsLoading(true);
      const fetchedRoutes = await getRoutes();
      setRoutes(fetchedRoutes);
      setIsLoading(false);
    };
    fetchRoutes();
  }, []);

  const handleCreateRoute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newRouteData = {
      name: formData.get('routeName') as string,
      driver: 'Unassigned',
      students: 0,
      stops: parseInt(formData.get('stops') as string, 10) || 0,
      onTimeRate: '100%',
    };
    
    try {
        const newRoute = await addRoute(newRouteData);
        setRoutes(prev => [...prev, newRoute]);
        setIsCreateDialogOpen(false);
        form.reset();
        toast({
            title: "Route Created",
            description: `The route "${newRoute.name}" has been successfully created.`,
        });
    } catch(e) {
        toast({ variant: 'destructive', title: "Error", description: "Could not create route." });
    }
  };

  const handleEditRoute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRoute) return;
    
    const formData = new FormData(event.currentTarget);
    const updatedData = {
      name: formData.get('routeName') as string,
      stops: parseInt(formData.get('stops') as string) || selectedRoute.stops,
    };

    try {
        await updateRoute(selectedRoute.id, updatedData);
        setRoutes(routes.map(r => r.id === selectedRoute.id ? { ...r, ...updatedData } : r));
        setIsEditDialogOpen(false);
        setSelectedRoute(null);
        toast({
            title: "Route Updated",
            description: `The route "${updatedData.name}" has been successfully updated.`,
        });
    } catch(e) {
        toast({ variant: 'destructive', title: "Error", description: "Could not update route." });
    }
  };

  const openEditDialog = (route: Route) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };
  
  const handleActionToast = (action: string, routeName: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Action "${action}" triggered for route ${routeName}.`,
    });
  };

  const avgOnTimeRate = routes.length > 0
    ? (routes.reduce((acc, route) => acc + parseFloat(route.onTimeRate), 0) / routes.length).toFixed(1) + '%'
    : 'N/A';
  
  const routesWithIssues = routes.filter(route => parseFloat(route.onTimeRate) < 95).length;
  const totalStudentsOnRoutes = routes.reduce((acc, route) => acc + route.students, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Route Management</h1>
          <p className="text-muted-foreground">Plan, optimize, and manage all school bus routes.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>Enter the details for the new route.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoute}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="routeName" className="text-right">Route Name</Label>
                  <Input id="routeName" name="routeName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stops" className="text-right">Number of Stops</Label>
                  <Input id="stops" name="stops" type="number" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Route</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOnTimeRate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes with Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routesWithIssues}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudentsOnRoutes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>A list of all configured bus routes from the database.</CardDescription>
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
                  <TableHead>Route Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Driver</TableHead>
                  <TableHead className="hidden lg:table-cell">Students</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>On-Time %</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{route.driver}</TableCell>
                    <TableCell className="hidden lg:table-cell">{route.students}</TableCell>
                    <TableCell>{route.stops}</TableCell>
                    <TableCell>
                      <Badge variant={parseFloat(route.onTimeRate) > 95 ? 'secondary' : 'destructive'} 
                             className={parseFloat(route.onTimeRate) > 95 ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20' : 'bg-red-500/10 text-red-700 hover:bg-red-500/20'}>
                          {route.onTimeRate}
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
                          <DropdownMenuItem onSelect={() => handleActionToast('View Details', route.name)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleActionToast('Optimize Route', route.name)}>Optimize Route</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openEditDialog(route)}>Edit</DropdownMenuItem>
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

      {/* Edit Route Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>Update the details for the route.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRoute}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="routeName" className="text-right">Route Name</Label>
                <Input id="routeName" name="routeName" className="col-span-3" defaultValue={selectedRoute?.name} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stops" className="text-right">Number of Stops</Label>
                <Input id="stops" name="stops" type="number" className="col-span-3" defaultValue={selectedRoute?.stops} required />
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

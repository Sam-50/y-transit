
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Filter, FileText, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type Incident, getIncidents, updateIncident, IncidentStatus, IncidentSeverity } from '@/services/incidents';

const incidentStatuses: IncidentStatus[] = ['Closed', 'Under Review', 'Investigation Open', 'Escalated'];

export default function SafetyReportsPage() {
    const { toast } = useToast();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState({ low: true, medium: true, high: true });
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            setIsLoading(true);
            const fetchedIncidents = await getIncidents();
            setIncidents(fetchedIncidents);
            setIsLoading(false);
        }
        fetchIncidents();
    }, []);

    const handleFilterChange = (severity: 'low' | 'medium' | 'high') => {
        setFilterSeverity(prev => ({...prev, [severity]: !prev[severity]}));
    };

    const filteredIncidents = incidents.filter(incident => {
        if (filterSeverity.low && incident.severity === 'Low') return true;
        if (filterSeverity.medium && incident.severity === 'Medium') return true;
        if (filterSeverity.high && incident.severity === 'High') return true;
        return false;
    });

    const openStatusDialog = (incident: Incident) => {
        setSelectedIncident(incident);
        setIsStatusDialogOpen(true);
    };

    const openDetailsDialog = (incident: Incident) => {
        setSelectedIncident(incident);
        setIsDetailsDialogOpen(true);
    };

    const handleUpdateStatus = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedIncident) return;
        
        const formData = new FormData(event.currentTarget);
        const newStatus = formData.get('status') as IncidentStatus;

        try {
            await updateIncident(selectedIncident.id, { status: newStatus });
            setIncidents(incidents.map(i => i.id === selectedIncident.id ? { ...i, status: newStatus } : i));
            setIsStatusDialogOpen(false);
            setSelectedIncident(null);
            toast({
                title: "Incident Status Updated",
                description: `Incident ${selectedIncident.id} status has been updated to ${newStatus}.`,
            });
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Could not update incident status." });
        }
    };
    
    const handleEscalate = async (incident: Incident) => {
        const newStatus: IncidentStatus = 'Escalated';
        try {
            await updateIncident(incident.id, { status: newStatus });
            setIncidents(incidents.map(i => i.id === incident.id ? { ...i, status: newStatus } : i));
            toast({
                title: "Incident Escalated",
                description: `Incident ${incident.id} has been escalated for further review.`,
            });
        } catch(e) {
            toast({ variant: 'destructive', title: "Error", description: "Could not escalate incident." });
        }
    };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Safety Incident Reports</h1>
          <p className="text-muted-foreground">Review, manage, and resolve all reported incidents.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>All Incidents</CardTitle>
                <CardDescription>A log of all safety-related reports from the database.</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={filterSeverity.low} onCheckedChange={() => handleFilterChange('low')}>Low</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filterSeverity.medium} onCheckedChange={() => handleFilterChange('medium')}>Medium</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filterSeverity.high} onCheckedChange={() => handleFilterChange('high')}>High</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="hidden md:table-cell">Driver</TableHead>
                  <TableHead className="w-full md:w-[40%]">Report Summary</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.date}</TableCell>
                    <TableCell className="font-medium">{incident.route}</TableCell>
                    <TableCell className="hidden md:table-cell">{incident.driver}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] sm:max-w-xs truncate">{incident.report}</TableCell>
                    <TableCell>
                      <Badge variant={incident.severity === 'High' ? 'destructive' : incident.severity === 'Medium' ? 'secondary' : 'outline'}
                             className={incident.severity === 'Medium' ? 'bg-orange-400/20 text-orange-600' : ''}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{incident.status}</Badge>
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
                          <DropdownMenuItem onSelect={() => openDetailsDialog(incident)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openStatusDialog(incident)}>Update Status</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEscalate(incident)}>Escalate</DropdownMenuItem>
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
      
      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Incident Status</DialogTitle>
            <DialogDescription>Change the status for incident {selectedIncident?.id}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus}>
            <div className="grid gap-4 py-4">
               <Select name="status" required defaultValue={selectedIncident?.status}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                      {incidentStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Update Status</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Incident Details: {selectedIncident?.id}</DialogTitle>
            </DialogHeader>
            {selectedIncident && (
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Date</Label>
                        <span className="col-span-2">{selectedIncident.date}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Route</Label>
                        <span className="col-span-2">{selectedIncident.route}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Driver</Label>
                        <span className="col-span-2">{selectedIncident.driver}</span>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Severity</Label>
                        <Badge variant={selectedIncident.severity === 'High' ? 'destructive' : selectedIncident.severity === 'Medium' ? 'secondary' : 'outline'}
                               className={selectedIncident.severity === 'Medium' ? 'bg-orange-400/20 text-orange-600 w-fit' : 'w-fit'}>
                            {selectedIncident.severity}
                        </Badge>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Status</Label>
                        <Badge variant="outline" className="w-fit">{selectedIncident.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label className="text-muted-foreground">Full Report</Label>
                        <p className="p-3 bg-muted/50 rounded-md border text-foreground">{selectedIncident.report}</p>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

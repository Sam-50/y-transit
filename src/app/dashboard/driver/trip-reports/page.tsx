
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Calendar, Clock, Users, AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getIncidents, addIncident, type Incident } from '@/services/incidents';

// Simplified TripReport for display, derived from Incident
interface TripReport {
    id: string;
    date: string;
    route: string;
    issues: number;
    issueDetails: string;
}

export default function TripReportsPage() {
  const [reports, setReports] = useState<TripReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TripReport | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const incidents = await getIncidents();
        // Transforming incidents to a trip report format for this page
        const tripReports = incidents.map(inc => ({
          id: inc.id,
          date: inc.date,
          route: inc.route,
          issues: 1, // Each incident is considered a trip with an issue
          issueDetails: inc.report,
        }));
        setReports(tripReports);
      } catch (e) {
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch trip reports." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [toast]);

  const handleViewDetails = (report: TripReport) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };
  
  const handleCreateReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const issueDetails = formData.get('issueDetails') as string;
    
    if (issueDetails.trim().length === 0) {
      toast({ variant: 'destructive', title: "No Details", description: "Please describe the issue." });
      return;
    }

    const newIncidentData = {
      report: issueDetails,
      date: format(new Date(), 'yyyy-MM-dd'),
      route: formData.get('route') as string,
      driver: 'John Doe', // Placeholder, would come from auth
      severity: 'Low' as const,
      status: 'Under Review' as const,
    };
    
    try {
        const newIncident = await addIncident(newIncidentData);
        const newReport: TripReport = {
          id: newIncident.id,
          date: newIncident.date,
          route: newIncident.route,
          issues: 1,
          issueDetails: newIncident.report,
        };
        setReports(prev => [newReport, ...prev]);
        setIsCreateOpen(false);
        form.reset();
        toast({
            title: "Trip Report Created",
            description: `Report ${newReport.id} has been successfully logged.`,
        });
    } catch(e) {
       toast({ variant: 'destructive', title: "Error", description: "Could not log the report." });
    }
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Trip Reports</h1>
                <p className="text-muted-foreground">Review your past trip summaries and log new issues.</p>
            </div>
             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Log New Issue
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Issue Report</DialogTitle>
                        <DialogDescription>
                            Log the details for an issue that occurred during a trip.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateReport}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="route" className="text-right">Route</Label>
                                <Input id="route" name="route" className="col-span-3" required placeholder="e.g. North Route" />
                            </div>
                             <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="issueDetails" className="text-right mt-2">Issue Details</Label>
                                <Textarea id="issueDetails" name="issueDetails" className="col-span-3" placeholder="e.g., Heavy traffic, minor delay..." required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Log Report</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Past Reports</CardTitle>
          <CardDescription>A summary of your completed trips with logged issues, from the database.</CardDescription>
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
                  <TableHead>Report ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Route</TableHead>
                  <TableHead>Issues</TableHead>
                   <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell className="hidden md:table-cell">{report.route}</TableCell>
                     <TableCell>
                       <Badge variant={report.issues > 0 ? 'destructive' : 'secondary'}>{report.issues}</Badge>
                    </TableCell>
                    <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trip Report Details</DialogTitle>
            <DialogDescription>
              A detailed summary of trip report {selectedReport?.id}.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4 text-sm">
                <div className="flex items-center">
                    <Calendar className="mr-3 h-4 w-4 text-muted-foreground"/>
                    <span className="font-medium">Date:</span>
                    <span className="ml-2 text-muted-foreground">{selectedReport.date}</span>
                </div>
                 <div className="flex items-center">
                    <Users className="mr-3 h-4 w-4 text-muted-foreground"/>
                    <span className="font-medium">Route:</span>
                    <span className="ml-2 text-muted-foreground">{selectedReport.route}</span>
                </div>
                <Separator />
                <div className="flex items-start">
                     <AlertTriangle className={`mr-3 h-4 w-4 ${selectedReport.issues > 0 ? 'text-destructive' : 'text-green-500'}`}/>
                    <div>
                        <span className="font-medium">Issues Logged:</span>
                        {selectedReport.issues > 0 ? (
                           <p className="text-muted-foreground mt-1">{selectedReport.issueDetails}</p>
                        ) : (
                           <p className="text-muted-foreground mt-1">No issues were logged for this trip.</p>
                        )}
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

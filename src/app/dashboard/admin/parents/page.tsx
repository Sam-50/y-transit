
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { getParents, type ParentWithChildren } from '@/services/parents';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function ParentManagementPage() {
  const [parents, setParents] = useState<ParentWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedParents = await getParents();
        setParents(fetchedParents);
      } catch (error) {
        console.error("Failed to fetch parent data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Could not retrieve parent information from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Parent Management</h1>
        <p className="text-muted-foreground">A consolidated list of all parents and their children.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parent Directory</CardTitle>
          <CardDescription>
            This list is automatically compiled from the student enrollment records in the database.
          </CardDescription>
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
                    <TableHead>Parent Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Children</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.map((parent) => (
                    <TableRow key={parent.email}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                           <User className="h-5 w-5 text-muted-foreground"/>
                           <span>{parent.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <a href={`mailto:${parent.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Mail className="h-4 w-4" /> {parent.email}
                          </a>
                          <a href={`tel:${parent.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                             <Phone className="h-4 w-4" /> {parent.phone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                          {parent.children.join(', ')}
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

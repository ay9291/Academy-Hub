import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, MoreHorizontal, Eye, Edit, UserX, Download } from "lucide-react";
import type { Teacher } from "@shared/schema";

const teacherFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  subjects: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.coerce.number().min(0).optional(),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

function TeacherForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: Teacher }) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      subjects: initialData?.subjects?.join(", ") || "",
      qualification: initialData?.qualification || "",
      experience: initialData?.experience || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const payload = { ...data, subjects: data.subjects?.split(",").map((s) => s.trim()).filter(Boolean) };
      if (isEditing) {
        return await apiRequest("PATCH", `/api/teachers/${initialData.id}`, payload);
      }
      return await apiRequest("POST", "/api/teachers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({ title: isEditing ? "Teacher updated" : "Teacher added" });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl><Input {...field} placeholder="Enter first name" data-testid="input-first-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name *</FormLabel>
              <FormControl><Input {...field} placeholder="Enter last name" data-testid="input-last-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} type="email" placeholder="teacher@email.com" data-testid="input-email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input {...field} placeholder="+91 9876543210" data-testid="input-phone" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="subjects" render={({ field }) => (
            <FormItem>
              <FormLabel>Subjects (comma-separated)</FormLabel>
              <FormControl><Input {...field} placeholder="Physics, Chemistry" data-testid="input-subjects" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="qualification" render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <FormControl><Input {...field} placeholder="M.Sc., B.Ed." data-testid="input-qualification" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="experience" render={({ field }) => (
            <FormItem>
              <FormLabel>Experience (years)</FormLabel>
              <FormControl><Input {...field} type="number" min="0" placeholder="5" data-testid="input-experience" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-teacher">
            {mutation.isPending ? "Saving..." : isEditing ? "Update Teacher" : "Add Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Teachers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const { data: teachers, isLoading } = useQuery<Teacher[]>({ queryKey: ["/api/teachers"] });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => await apiRequest("PATCH", `/api/teachers/${id}`, { isActive: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({ title: "Teacher deactivated" });
    },
  });

  const filteredTeachers = teachers?.filter((t) =>
    t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Teachers</h1>
          <p className="text-muted-foreground">Manage faculty and their assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-teacher"><Plus className="h-4 w-4 mr-2" />Add Teacher</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
                <DialogDescription>Fill in the details to manage teacher information.</DialogDescription>
              </DialogHeader>
              <TeacherForm onSuccess={() => { setIsDialogOpen(false); setEditingTeacher(null); }} initialData={editingTeacher || undefined} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teachers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : !filteredTeachers?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No teachers found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add your first teacher</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={teacher.profileImageUrl || undefined} />
                          <AvatarFallback className="text-xs">{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><code className="font-mono text-sm bg-muted px-2 py-1 rounded">{teacher.employeeId}</code></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.slice(0, 3).map((s, i) => <Badge key={i} variant="outline" size="sm">{s}</Badge>)}
                        {(teacher.subjects?.length || 0) > 3 && <Badge variant="secondary" size="sm">+{teacher.subjects!.length - 3}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{teacher.experience ? `${teacher.experience} years` : "-"}</TableCell>
                    <TableCell><Badge variant={teacher.isActive ? "default" : "secondary"} size="sm">{teacher.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingTeacher(teacher); setIsDialogOpen(true); }}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deactivateMutation.mutate(teacher.id)}><UserX className="h-4 w-4 mr-2" />Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

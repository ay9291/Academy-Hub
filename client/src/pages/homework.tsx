import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Search, FileText, Calendar, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Batch, Subject, Homework } from "@shared/schema";

const homeworkFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  batchId: z.string().min(1, "Batch is required"),
  subjectId: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  isMandatory: z.boolean().default(true),
});

type HomeworkFormData = z.infer<typeof homeworkFormSchema>;

function HomeworkForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const { data: batches } = useQuery<Batch[]>({ queryKey: ["/api/batches"] });
  const { data: subjects } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });

  const form = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkFormSchema),
    defaultValues: { title: "", description: "", batchId: "", subjectId: "", dueDate: "", isMandatory: true },
  });

  const mutation = useMutation({
    mutationFn: async (data: HomeworkFormData) => await apiRequest("POST", "/api/homework", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homework"] });
      toast({ title: "Homework uploaded", description: "Students can now view the assignment." });
      onSuccess();
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title *</FormLabel>
            <FormControl><Input {...field} placeholder="Chapter 5 Problems" data-testid="input-title" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea {...field} placeholder="Describe the assignment..." data-testid="input-description" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="batchId" render={({ field }) => (
            <FormItem>
              <FormLabel>Batch *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger data-testid="select-batch"><SelectValue placeholder="Select batch" /></SelectTrigger></FormControl>
                <SelectContent>{batches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="subjectId" render={({ field }) => (
            <FormItem>
              <FormLabel>Subject *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger data-testid="select-subject"><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="dueDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date *</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-due-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="isMandatory" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Mandatory</FormLabel>
                <p className="text-sm text-muted-foreground">Mark as required assignment</p>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-homework">
            {mutation.isPending ? "Uploading..." : "Upload Homework"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function HomeworkCard({ homework }: { homework: any }) {
  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    completed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    overdue: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  };

  const status = new Date(homework.dueDate) < new Date() ? "overdue" : "pending";
  const config = statusConfig[status];

  return (
    <Card className="hover-elevate" data-testid={`card-homework-${homework.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{homework.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline" size="sm">{homework.subjectName || "Subject"}</Badge>
              {homework.isMandatory && <Badge variant="destructive" size="sm">Mandatory</Badge>}
            </CardDescription>
          </div>
          <div className={`h-10 w-10 rounded-full ${config.bg} flex items-center justify-center`}>
            <config.icon className={`h-5 w-5 ${config.color}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {homework.description && <p className="text-sm text-muted-foreground line-clamp-2">{homework.description}</p>}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>Due: {format(new Date(homework.dueDate), "PPP")}</span></div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{homework.batchName || "Batch"}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomeworkPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: homework, isLoading } = useQuery<any[]>({ queryKey: ["/api/homework"] });

  const canUpload = user?.role === "admin" || user?.role === "teacher";

  const filteredHomework = homework?.filter((h) => h.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Homework</h1>
          <p className="text-muted-foreground">{canUpload ? "Manage and upload assignments" : "View your assignments"}</p>
        </div>
        {canUpload && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-homework"><Plus className="h-4 w-4 mr-2" />Upload Homework</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Homework</DialogTitle>
                <DialogDescription>Create a new assignment for students.</DialogDescription>
              </DialogHeader>
              <HomeworkForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search homework..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : !filteredHomework?.length ? (
        <Card><CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No homework found</p>
          {canUpload && <Button variant="outline" onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Upload your first homework</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHomework.map((hw) => <HomeworkCard key={hw.id} homework={hw} />)}
        </div>
      )}
    </div>
  );
}

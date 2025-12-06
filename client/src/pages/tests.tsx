import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Search, Award, Calendar, Users, TrendingUp, Trophy, Download, FileText } from "lucide-react";
import type { Batch, Subject, Test } from "@shared/schema";

const testFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  batchId: z.string().min(1, "Batch is required"),
  subjectId: z.string().min(1, "Subject is required"),
  testType: z.enum(["unit", "weekly", "monthly", "mock", "practice"]),
  testDate: z.string().min(1, "Test date is required"),
  totalMarks: z.coerce.number().min(1, "Total marks required"),
  passingMarks: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  negativeMarking: z.boolean().default(false),
});

type TestFormData = z.infer<typeof testFormSchema>;

function CreateTestForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { data: batches } = useQuery<Batch[]>({ queryKey: ["/api/batches"] });
  const { data: subjects } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });

  const form = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: { title: "", batchId: "", subjectId: "", testType: "unit", testDate: "", totalMarks: 100, passingMarks: 35, duration: 60, negativeMarking: false },
  });

  const mutation = useMutation({
    mutationFn: async (data: TestFormData) => await apiRequest("POST", "/api/tests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({ title: "Test scheduled", description: "Test has been scheduled successfully." });
      onSuccess();
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Test Title *</FormLabel>
            <FormControl><Input {...field} placeholder="Physics Unit Test 1" data-testid="input-title" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="batchId" render={({ field }) => (
            <FormItem>
              <FormLabel>Batch *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger></FormControl>
                <SelectContent>{batches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="subjectId" render={({ field }) => (
            <FormItem>
              <FormLabel>Subject *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="testType" render={({ field }) => (
            <FormItem>
              <FormLabel>Test Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="unit">Unit Test</SelectItem>
                  <SelectItem value="weekly">Weekly Test</SelectItem>
                  <SelectItem value="monthly">Monthly Test</SelectItem>
                  <SelectItem value="mock">Mock Test</SelectItem>
                  <SelectItem value="practice">Practice Test</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="testDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Test Date *</FormLabel>
              <FormControl><Input {...field} type="date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="totalMarks" render={({ field }) => (
            <FormItem>
              <FormLabel>Total Marks *</FormLabel>
              <FormControl><Input {...field} type="number" min="1" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="passingMarks" render={({ field }) => (
            <FormItem>
              <FormLabel>Passing Marks</FormLabel>
              <FormControl><Input {...field} type="number" min="0" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl><Input {...field} type="number" min="1" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="negativeMarking" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Negative Marking</FormLabel>
                <p className="text-sm text-muted-foreground">Apply negative marks for wrong answers</p>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Scheduling..." : "Schedule Test"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Tests() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tests, isLoading } = useQuery<any[]>({ queryKey: ["/api/tests"] });

  const canManage = user?.role === "admin" || user?.role === "teacher";

  const testTypeLabels: Record<string, string> = { unit: "Unit Test", weekly: "Weekly", monthly: "Monthly", mock: "Mock", practice: "Practice" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Tests & Marks</h1>
          <p className="text-muted-foreground">{canManage ? "Schedule tests and manage results" : "View your test results"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-schedule-test"><Plus className="h-4 w-4 mr-2" />Schedule Test</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Test</DialogTitle>
                  <DialogDescription>Create a new test for a batch.</DialogDescription>
                </DialogHeader>
                <CreateTestForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">24</div><p className="text-sm text-muted-foreground">This semester</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">5</div><p className="text-sm text-muted-foreground">Next 7 days</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">72%</div><p className="text-sm text-muted-foreground">All students</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle></CardHeader>
          <CardContent><div className="text-lg font-bold">Sneha Reddy</div><p className="text-sm text-muted-foreground">95% average</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><CardTitle>Test Schedule</CardTitle><CardDescription>Upcoming and past tests</CardDescription></div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { title: "Physics Unit Test 3", batch: "JEE Batch A", date: "2024-12-15", type: "unit", totalMarks: 100, avgScore: null, status: "upcoming" },
                { title: "Chemistry Weekly Test", batch: "NEET Batch B", date: "2024-12-10", type: "weekly", totalMarks: 50, avgScore: null, status: "upcoming" },
                { title: "Mathematics Mock", batch: "JEE Batch A", date: "2024-12-01", type: "mock", totalMarks: 300, avgScore: 68, status: "completed" },
                { title: "Biology Monthly Test", batch: "NEET Batch B", date: "2024-11-25", type: "monthly", totalMarks: 100, avgScore: 72, status: "completed" },
              ].map((test, index) => (
                <TableRow key={index} data-testid={`row-test-${index}`}>
                  <TableCell><p className="font-medium">{test.title}</p></TableCell>
                  <TableCell><Badge variant="outline" size="sm">{test.batch}</Badge></TableCell>
                  <TableCell>{format(new Date(test.date), "PPP")}</TableCell>
                  <TableCell><Badge variant="secondary" size="sm">{testTypeLabels[test.type]}</Badge></TableCell>
                  <TableCell>{test.totalMarks}</TableCell>
                  <TableCell>
                    {test.status === "completed" ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" size="sm">Completed</Badge>
                        {test.avgScore && <span className="text-sm text-muted-foreground">Avg: {test.avgScore}%</span>}
                      </div>
                    ) : (
                      <Badge variant="outline" size="sm">Upcoming</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && test.status === "completed" ? (
                      <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-1" />Results</Button>
                    ) : canManage ? (
                      <Button variant="ghost" size="sm"><Award className="h-4 w-4 mr-1" />Enter Marks</Button>
                    ) : (
                      <Button variant="ghost" size="sm">View</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

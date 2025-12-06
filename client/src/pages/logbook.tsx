import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";
import type { LogbookEntry, Batch, Subject, Teacher } from "@shared/schema";

const logbookFormSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  date: z.string().min(1, "Date is required"),
  topicsTaught: z.string().min(1, "Topics taught is required"),
  homeworkAssigned: z.string().optional(),
  testUpdates: z.string().optional(),
  remarks: z.string().optional(),
  lectureStatus: z.string().optional(),
});

type LogbookFormData = z.infer<typeof logbookFormSchema>;

function LogbookForm({ 
  onSuccess, 
  batches, 
  subjects, 
  teachers 
}: { 
  onSuccess: () => void; 
  batches: Batch[]; 
  subjects: Subject[]; 
  teachers: Teacher[];
}) {
  const { toast } = useToast();

  const form = useForm<LogbookFormData>({
    resolver: zodResolver(logbookFormSchema),
    defaultValues: {
      batchId: "",
      subjectId: "",
      teacherId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      topicsTaught: "",
      homeworkAssigned: "",
      testUpdates: "",
      remarks: "",
      lectureStatus: "completed",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LogbookFormData) => await apiRequest("POST", "/api/logbook", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logbook"] });
      toast({ title: "Entry added", description: "Logbook entry has been recorded." });
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
          <FormField
            control={form.control}
            name="batchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-batch">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-teacher">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" data-testid="input-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="topicsTaught"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topics Taught *</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="List topics covered in this session..." rows={3} data-testid="input-topics" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="homeworkAssigned"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Homework Assigned</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Homework details..." rows={2} data-testid="input-homework" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="testUpdates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Updates</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Any test announcements..." rows={2} data-testid="input-test-updates" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Additional notes..." rows={2} data-testid="input-remarks" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-logbook">
            {mutation.isPending ? "Saving..." : "Add Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Logbook() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: entries, isLoading } = useQuery<LogbookEntry[]>({
    queryKey: ["/api/logbook"],
  });

  const { data: batches } = useQuery<Batch[]>({ queryKey: ["/api/batches"] });
  const { data: subjects } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: teachers } = useQuery<Teacher[]>({ queryKey: ["/api/teachers"] });

  const getBatchName = (id: string) => batches?.find((b) => b.id === id)?.name || "Unknown";
  const getSubjectName = (id: string) => subjects?.find((s) => s.id === id)?.name || "Unknown";
  const getTeacherName = (id: string) => {
    const t = teachers?.find((t) => t.id === id);
    return t ? `${t.firstName} ${t.lastName}` : "Unknown";
  };

  const filteredEntries = entries?.filter((e) =>
    e.topicsTaught.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Logbook</h1>
          <p className="text-muted-foreground">Daily lecture and session records</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-entry">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Logbook Entry</DialogTitle>
              <DialogDescription>Record today's session details.</DialogDescription>
            </DialogHeader>
            <LogbookForm 
              onSuccess={() => setIsDialogOpen(false)} 
              batches={batches || []}
              subjects={subjects || []}
              teachers={teachers || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !filteredEntries?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No logbook entries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} data-testid={`card-logbook-${entry.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" size="sm">{getBatchName(entry.batchId)}</Badge>
                      <Badge variant="secondary" size="sm">{getSubjectName(entry.subjectId)}</Badge>
                      <Badge variant={entry.lectureStatus === "completed" ? "default" : "secondary"} size="sm">
                        {entry.lectureStatus === "completed" ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{entry.topicsTaught}</CardTitle>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {entry.date}
                    </div>
                    <p className="mt-1">By: {getTeacherName(entry.teacherId)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {entry.homeworkAssigned && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Homework</p>
                    <p>{entry.homeworkAssigned}</p>
                  </div>
                )}
                {entry.testUpdates && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Test Updates</p>
                    <p>{entry.testUpdates}</p>
                  </div>
                )}
                {entry.remarks && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Remarks</p>
                    <p>{entry.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

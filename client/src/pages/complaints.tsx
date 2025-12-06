import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, MessageSquare, ChevronDown, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import type { Complaint, ComplaintResponse } from "@shared/schema";

const complaintFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintFormSchema>;

const categories = [
  "Academic",
  "Fees",
  "Infrastructure",
  "Staff Behavior",
  "Timetable",
  "Other",
];

const statusConfig: Record<string, { icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { icon: AlertCircle, variant: "destructive" },
  in_progress: { icon: Clock, variant: "secondary" },
  resolved: { icon: CheckCircle, variant: "default" },
  closed: { icon: CheckCircle, variant: "outline" },
};

function ComplaintForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => await apiRequest("POST", "/api/complaints", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({ title: "Complaint submitted", description: "Your complaint has been registered." });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brief subject of your complaint" data-testid="input-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe your concern in detail..." rows={4} data-testid="input-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-complaint">
            {mutation.isPending ? "Submitting..." : "Submit Complaint"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: responses } = useQuery<ComplaintResponse[]>({
    queryKey: ["/api/complaints", complaint.id, "responses"],
    enabled: isOpen,
  });

  const replyMutation = useMutation({
    mutationFn: async (message: string) => 
      await apiRequest("POST", `/api/complaints/${complaint.id}/responses`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints", complaint.id, "responses"] });
      setReplyText("");
      toast({ title: "Reply sent" });
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async (status: string) => 
      await apiRequest("PATCH", `/api/complaints/${complaint.id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({ title: "Status updated" });
    },
  });

  const StatusIcon = statusConfig[complaint.status]?.icon || Clock;

  return (
    <Card data-testid={`card-complaint-${complaint.id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate rounded-t-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={statusConfig[complaint.status]?.variant || "outline"} size="sm">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {complaint.status.replace("_", " ")}
                  </Badge>
                  {complaint.category && (
                    <Badge variant="outline" size="sm">{complaint.category}</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{complaint.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {complaint.description}
                </CardDescription>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="border-t pt-4">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">{complaint.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted on {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>

              {responses && responses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Responses</p>
                  {responses.map((r) => (
                    <div key={r.id} className="bg-background border rounded-lg p-3">
                      <p className="text-sm">{r.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  data-testid="input-reply"
                />
                <Button 
                  size="icon" 
                  onClick={() => replyMutation.mutate(replyText)}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  data-testid="button-send-reply"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {user?.role === "admin" && complaint.status !== "resolved" && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => statusUpdateMutation.mutate("in_progress")}
                    disabled={complaint.status === "in_progress"}
                  >
                    Mark In Progress
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => statusUpdateMutation.mutate("resolved")}
                  >
                    Mark Resolved
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function Complaints() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const filteredComplaints = complaints?.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Complaints</h1>
          <p className="text-muted-foreground">Submit and track your concerns</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-complaint">
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit a Complaint</DialogTitle>
              <DialogDescription>We'll look into your concern and respond promptly.</DialogDescription>
            </DialogHeader>
            <ComplaintForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="filter-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !filteredComplaints?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No complaints found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}

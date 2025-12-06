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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, Users, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import type { Batch } from "@shared/schema";

const batchFormSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
  academicCategory: z.enum(["class_11", "class_12", "jee", "neet"]),
  room: z.string().optional(),
  capacity: z.coerce.number().min(1).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  days: z.array(z.string()).optional(),
});

type BatchFormData = z.infer<typeof batchFormSchema>;

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const categoryLabels: Record<string, string> = { class_11: "Class 11", class_12: "Class 12", jee: "JEE", neet: "NEET" };

function BatchForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: Batch }) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      academicCategory: (initialData?.academicCategory as any) || "class_11",
      room: initialData?.room || "",
      capacity: initialData?.capacity || 30,
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      days: initialData?.days || [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BatchFormData) => {
      if (isEditing) return await apiRequest("PATCH", `/api/batches/${initialData.id}`, data);
      return await apiRequest("POST", "/api/batches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      toast({ title: isEditing ? "Batch updated" : "Batch created" });
      onSuccess();
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Name *</FormLabel>
              <FormControl><Input {...field} placeholder="JEE Batch A" data-testid="input-batch-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="academicCategory" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="class_11">Class 11</SelectItem>
                  <SelectItem value="class_12">Class 12</SelectItem>
                  <SelectItem value="jee">JEE</SelectItem>
                  <SelectItem value="neet">NEET</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="room" render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <FormControl><Input {...field} placeholder="Room 101" data-testid="input-room" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="capacity" render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl><Input {...field} type="number" min="1" placeholder="30" data-testid="input-capacity" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="startTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl><Input {...field} type="time" data-testid="input-start-time" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="endTime" render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl><Input {...field} type="time" data-testid="input-end-time" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="days" render={() => (
          <FormItem>
            <FormLabel>Days</FormLabel>
            <div className="flex flex-wrap gap-4">
              {daysOfWeek.map((day) => (
                <FormField key={day} control={form.control} name="days" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(day)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          field.onChange(checked ? [...current, day] : current.filter((d) => d !== day));
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{day.slice(0, 3)}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
          </FormItem>
        )} />
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-batch">
            {mutation.isPending ? "Saving..." : isEditing ? "Update Batch" : "Create Batch"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Batches() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const { data: batches, isLoading } = useQuery<Batch[]>({ queryKey: ["/api/batches"] });

  const filteredBatches = batches?.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Batches</h1>
          <p className="text-muted-foreground">Manage batches and timetables</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-batch"><Plus className="h-4 w-4 mr-2" />Create Batch</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
              <DialogDescription>Configure batch details and schedule.</DialogDescription>
            </DialogHeader>
            <BatchForm onSuccess={() => { setIsDialogOpen(false); setEditingBatch(null); }} initialData={editingBatch || undefined} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search batches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : !filteredBatches?.length ? (
        <Card><CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No batches found</p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create your first batch</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <Card key={batch.id} className="hover-elevate" data-testid={`card-batch-${batch.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                    <CardDescription>{categoryLabels[batch.academicCategory]}</CardDescription>
                  </div>
                  <Badge variant={batch.isActive ? "default" : "secondary"} size="sm">{batch.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /><span>{batch.room || "No room assigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /><span>{batch.startTime && batch.endTime ? `${batch.startTime} - ${batch.endTime}` : "No schedule set"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /><span>Capacity: {batch.capacity || 30}</span>
                </div>
                {batch.days?.length ? (
                  <div className="flex flex-wrap gap-1">{batch.days.map((d) => <Badge key={d} variant="outline" size="sm">{d.slice(0, 3)}</Badge>)}</div>
                ) : null}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingBatch(batch); setIsDialogOpen(true); }}><Edit className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Search, CreditCard, Download, Receipt, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Student, FeeStructure, FeePayment } from "@shared/schema";

const paymentFormSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  amount: z.coerce.number().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

function RecordPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { data: students } = useQuery<Student[]>({ queryKey: ["/api/students"] });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { studentId: "", amount: 0, paymentDate: format(new Date(), "yyyy-MM-dd"), paymentMethod: "", remarks: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: PaymentFormData) => await apiRequest("POST", "/api/fees/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      toast({ title: "Payment recorded", description: "Fee payment has been recorded successfully." });
      onSuccess();
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <FormField control={form.control} name="studentId" render={({ field }) => (
          <FormItem>
            <FormLabel>Student *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger data-testid="select-student"><SelectValue placeholder="Select student" /></SelectTrigger></FormControl>
              <SelectContent>{students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.enrollmentNumber})</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹) *</FormLabel>
              <FormControl><Input {...field} type="number" min="1" placeholder="10000" data-testid="input-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="paymentDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date *</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-payment-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="paymentMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger data-testid="select-method"><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="remarks" render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl><Input {...field} placeholder="Optional notes" data-testid="input-remarks" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-payment">
            {mutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Fees() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: feeData, isLoading } = useQuery<any>({ queryKey: ["/api/fees/summary"] });

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Fees & Finance</h1>
          <p className="text-muted-foreground">{isAdmin ? "Manage fee collection and payments" : "View fee status and receipts"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-record-payment"><Plus className="h-4 w-4 mr-2" />Record Payment</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Record Fee Payment</DialogTitle>
                  <DialogDescription>Enter payment details to record a fee collection.</DialogDescription>
                </DialogHeader>
                <RecordPaymentForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹24.5L</div>
            <p className="text-sm text-muted-foreground mt-1">This academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">₹8.2L</div>
            <p className="text-sm text-muted-foreground mt-1">Outstanding amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₹2.1L</div>
            <p className="text-sm text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₹3.8L</div>
            <p className="text-sm text-muted-foreground mt-1">Collected in Dec</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Fee Records</CardTitle>
              <CardDescription>Student-wise fee status</CardDescription>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" data-testid="input-search" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Rahul Sharma", enrollment: "JEE-2024-042", total: 120000, paid: 120000, status: "paid" },
                { name: "Priya Patel", enrollment: "NEET-2024-015", total: 100000, paid: 75000, status: "partial" },
                { name: "Amit Kumar", enrollment: "JEE-2024-078", total: 120000, paid: 40000, status: "overdue" },
                { name: "Sneha Reddy", enrollment: "CLASS12-2024-023", total: 80000, paid: 80000, status: "paid" },
              ].map((record, index) => (
                <TableRow key={index} data-testid={`row-fee-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.name}</p>
                      <p className="text-sm text-muted-foreground">{record.enrollment}</p>
                    </div>
                  </TableCell>
                  <TableCell>₹{(record.total / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-green-600">₹{(record.paid / 1000).toFixed(0)}K</TableCell>
                  <TableCell className={record.total - record.paid > 0 ? "text-red-600" : ""}>₹{((record.total - record.paid) / 1000).toFixed(0)}K</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "paid" ? "default" : record.status === "partial" ? "secondary" : "destructive"} size="sm">
                      {record.status === "paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {record.status === "overdue" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><Receipt className="h-4 w-4 mr-1" />Receipt</Button>
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

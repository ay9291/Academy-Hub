import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { CalendarIcon, Check, X, Clock, Save, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Batch, Student } from "@shared/schema";

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  reason?: string;
}

function AttendanceStatusBadge({ percentage }: { percentage: number }) {
  if (percentage >= 85) return <Badge variant="default" className="bg-green-500 hover:bg-green-600" size="sm">{percentage}%</Badge>;
  if (percentage >= 70) return <Badge variant="secondary" className="bg-yellow-500 text-yellow-950" size="sm">{percentage}%</Badge>;
  return <Badge variant="destructive" size="sm">{percentage}%</Badge>;
}

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceStatus>>(new Map());

  const { data: batches, isLoading: batchesLoading } = useQuery<Batch[]>({ queryKey: ["/api/batches"] });
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students", selectedBatch],
    enabled: !!selectedBatch,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const records: AttendanceRecord[] = Array.from(attendanceRecords.entries()).map(([studentId, status]) => ({
        studentId, status, batchId: selectedBatch, date: format(selectedDate, "yyyy-MM-dd"),
      }));
      return await apiRequest("POST", "/api/attendance/bulk", { records });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({ title: "Attendance saved", description: `Attendance for ${format(selectedDate, "PPP")} has been recorded.` });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => new Map(prev).set(studentId, status));
  };

  const markAllPresent = () => {
    if (!students) return;
    const newRecords = new Map<string, AttendanceStatus>();
    students.forEach((s) => newRecords.set(s.id, "present"));
    setAttendanceRecords(newRecords);
  };

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const canMarkAttendance = isAdmin || isTeacher;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Attendance</h1>
          <p className="text-muted-foreground">{canMarkAttendance ? "Mark and track student attendance" : "View attendance records"}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export Report</Button>
      </div>

      {canMarkAttendance && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Select batch and date to mark attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger data-testid="select-batch"><SelectValue placeholder="Choose a batch" /></SelectTrigger>
                  <SelectContent>
                    {batches?.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")} data-testid="button-select-date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedBatch && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{students?.length || 0} students in this batch</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
                    <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || attendanceRecords.size === 0} data-testid="button-save-attendance">
                      <Save className="h-4 w-4 mr-2" />{saveMutation.isPending ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </div>

                {studentsLoading ? (
                  <div className="space-y-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : !students?.length ? (
                  <p className="text-center py-8 text-muted-foreground">No students in this batch</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Enrollment No.</TableHead>
                        <TableHead>Overall Attendance</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const currentStatus = attendanceRecords.get(student.id);
                        return (
                          <TableRow key={student.id} data-testid={`row-attendance-${student.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={student.profileImageUrl || undefined} />
                                  <AvatarFallback className="text-xs">{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.firstName} {student.lastName}</span>
                              </div>
                            </TableCell>
                            <TableCell><code className="font-mono text-sm">{student.enrollmentNumber}</code></TableCell>
                            <TableCell><AttendanceStatusBadge percentage={85} /></TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="icon"
                                  variant={currentStatus === "present" ? "default" : "outline"}
                                  className={cn(currentStatus === "present" && "bg-green-500 hover:bg-green-600")}
                                  onClick={() => handleStatusChange(student.id, "present")}
                                  data-testid={`button-present-${student.id}`}
                                ><Check className="h-4 w-4" /></Button>
                                <Button
                                  size="icon"
                                  variant={currentStatus === "absent" ? "default" : "outline"}
                                  className={cn(currentStatus === "absent" && "bg-red-500 hover:bg-red-600")}
                                  onClick={() => handleStatusChange(student.id, "absent")}
                                  data-testid={`button-absent-${student.id}`}
                                ><X className="h-4 w-4" /></Button>
                                <Button
                                  size="icon"
                                  variant={currentStatus === "late" ? "default" : "outline"}
                                  className={cn(currentStatus === "late" && "bg-yellow-500 hover:bg-yellow-600")}
                                  onClick={() => handleStatusChange(student.id, "late")}
                                  data-testid={`button-late-${student.id}`}
                                ><Clock className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Monthly attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-green-500/10">
              <div className="text-4xl font-bold text-green-600">87%</div>
              <p className="text-sm text-muted-foreground mt-1">Average Attendance</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-yellow-500/10">
              <div className="text-4xl font-bold text-yellow-600">12</div>
              <p className="text-sm text-muted-foreground mt-1">Students Below 70%</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary/10">
              <div className="text-4xl font-bold text-primary">156</div>
              <p className="text-sm text-muted-foreground mt-1">Present Today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

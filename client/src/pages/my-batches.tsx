import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  ArrowRight,
  MapPin,
} from "lucide-react";
import type { Batch, BatchTeacher, Subject, Student } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  class_11: "Class 11",
  class_12: "Class 12",
  jee: "JEE",
  neet: "NEET",
};

const dayLabels: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

interface BatchWithDetails extends Batch {
  subject?: Subject;
  studentCount?: number;
}

export default function MyBatches() {
  const { user } = useAuth();

  const { data: batches, isLoading: batchesLoading } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: batchTeachers } = useQuery<BatchTeacher[]>({
    queryKey: ["/api/batch-teachers"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: teachers } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
  });

  const currentTeacher = teachers?.find((t) => t.userId === user?.id);
  
  const myBatchAssignments = batchTeachers?.filter(
    (bt) => bt.teacherId === currentTeacher?.id
  );

  const myBatches: BatchWithDetails[] = myBatchAssignments?.map((assignment) => {
    const batch = batches?.find((b) => b.id === assignment.batchId);
    const subject = subjects?.find((s) => s.id === assignment.subjectId);
    return {
      ...batch!,
      subject,
    };
  }).filter(Boolean) || [];

  const isLoading = batchesLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">My Batches</h1>
        <p className="text-muted-foreground">Batches assigned to you</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : !myBatches?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No batches assigned to you yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myBatches.map((batch) => (
            <Card key={batch.id} className="group" data-testid={`card-batch-${batch.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl">{batch.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {batch.subject?.name || "General"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" size="sm">
                    {categoryLabels[batch.academicCategory] || batch.academicCategory}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {batch.startTime || "TBD"} - {batch.endTime || "TBD"}
                    </span>
                  </div>
                  {batch.room && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{batch.room}</span>
                    </div>
                  )}
                  {batch.days && batch.days.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <div className="flex gap-1 flex-wrap">
                        {batch.days.map((day) => (
                          <Badge key={day} variant="secondary" size="sm" className="text-xs">
                            {dayLabels[day] || day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{batch.capacity || 30} students max</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/attendance?batch=${batch.id}`}>
                        <ClipboardCheck className="h-4 w-4 mr-1" />
                        Attendance
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/homework?batch=${batch.id}`}>
                        <FileText className="h-4 w-4 mr-1" />
                        Homework
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/logbook?batch=${batch.id}`}>
                        <BookOpen className="h-4 w-4 mr-1" />
                        Logbook
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tests?batch=${batch.id}`}>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Tests
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

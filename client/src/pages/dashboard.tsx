import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  ClipboardCheck,
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const attendanceData = [
  { month: "Jan", attendance: 92 },
  { month: "Feb", attendance: 88 },
  { month: "Mar", attendance: 95 },
  { month: "Apr", attendance: 90 },
  { month: "May", attendance: 87 },
  { month: "Jun", attendance: 93 },
];

const performanceData = [
  { subject: "Physics", average: 78 },
  { subject: "Chemistry", average: 82 },
  { subject: "Maths", average: 75 },
  { subject: "Biology", average: 88 },
  { subject: "English", average: 85 },
];

const feeStatusData = [
  { name: "Paid", value: 65, color: "hsl(var(--chart-2))" },
  { name: "Pending", value: 25, color: "hsl(var(--chart-4))" },
  { name: "Overdue", value: 10, color: "hsl(var(--chart-5))" },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  variant?: "default" | "success" | "warning" | "danger";
}

function MetricCard({ title, value, description, icon: Icon, trend, variant = "default" }: MetricCardProps) {
  const bgColors = {
    default: "bg-primary/10",
    success: "bg-green-500/10 dark:bg-green-500/20",
    warning: "bg-yellow-500/10 dark:bg-yellow-500/20",
    danger: "bg-red-500/10 dark:bg-red-500/20",
  };

  const iconColors = {
    default: "text-primary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-10 w-10 rounded-lg ${bgColors[variant]} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.value >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<{
    totalStudents: number;
    totalTeachers: number;
    totalBatches: number;
    pendingFees: number;
    todayAttendance: number;
    pendingComplaints: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
        />
        <MetricCard
          title="Active Teachers"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
          description="Currently teaching"
        />
        <MetricCard
          title="Active Batches"
          value={stats?.totalBatches || 0}
          icon={Calendar}
        />
        <MetricCard
          title="Pending Fees"
          value={stats?.pendingFees || 0}
          icon={CreditCard}
          variant={stats?.pendingFees && stats.pendingFees > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Present Today"
          value={stats?.todayAttendance || 0}
          icon={ClipboardCheck}
          description="Students present"
        />
        <MetricCard
          title="Open Complaints"
          value={stats?.pendingComplaints || 0}
          icon={AlertTriangle}
          variant={stats?.pendingComplaints && stats.pendingComplaints > 5 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Monthly attendance percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis domain={[70, 100]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average marks by subject</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="subject" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="average" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Status</CardTitle>
            <CardDescription>Current academic year</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-6 flex justify-center gap-6">
            {feeStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Students Requiring Attention</CardTitle>
              <CardDescription>Based on attendance and performance</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Rahul Sharma", issue: "Low Attendance", percentage: 62, tag: "at_risk" },
                { name: "Priya Patel", issue: "Declining Grades", percentage: 55, tag: "needs_mentoring" },
                { name: "Amit Kumar", issue: "Fee Overdue", percentage: 0, tag: "at_risk" },
                { name: "Sneha Reddy", issue: "Homework Pending", percentage: 45, tag: "needs_mentoring" },
              ].map((student, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{student.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.issue}</p>
                  </div>
                  <Badge variant={student.tag === "at_risk" ? "destructive" : "secondary"} size="sm">
                    {student.tag === "at_risk" ? "At Risk" : "Needs Mentoring"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="My Batches"
          value={4}
          icon={Calendar}
          description="Active batches assigned"
        />
        <MetricCard
          title="Today's Classes"
          value={3}
          icon={BookOpen}
        />
        <MetricCard
          title="Pending Homework"
          value={5}
          icon={FileText}
          variant="warning"
          description="To be uploaded"
        />
        <MetricCard
          title="Marks to Enter"
          value={2}
          icon={Award}
          variant="warning"
          description="Tests pending"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { batch: "JEE Batch A", subject: "Physics", time: "9:00 AM - 10:30 AM", room: "Room 101", status: "completed" },
                { batch: "NEET Batch B", subject: "Chemistry", time: "11:00 AM - 12:30 PM", room: "Room 102", status: "ongoing" },
                { batch: "Class 12 Science", subject: "Mathematics", time: "2:00 PM - 3:30 PM", room: "Room 201", status: "upcoming" },
              ].map((schedule, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{schedule.batch}</p>
                      <Badge variant="outline" size="sm">{schedule.subject}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{schedule.time} • {schedule.room}</p>
                  </div>
                  <Badge
                    variant={schedule.status === "completed" ? "secondary" : schedule.status === "ongoing" ? "default" : "outline"}
                    size="sm"
                  >
                    {schedule.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {schedule.status === "ongoing" && <Clock className="h-3 w-3 mr-1" />}
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <ClipboardCheck className="h-5 w-5" />
                <span>Mark Attendance</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Upload Homework</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Award className="h-5 w-5" />
                <span>Enter Marks</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Add Logbook</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students Below Threshold</CardTitle>
          <CardDescription>Students with attendance below 70%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Rahul Sharma", batch: "JEE Batch A", attendance: 62 },
              { name: "Amit Kumar", batch: "NEET Batch B", attendance: 68 },
              { name: "Priya Gupta", batch: "Class 12", attendance: 65 },
            ].map((student, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.batch}</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Attendance</span>
                    <span className="text-red-500 font-medium">{student.attendance}%</span>
                  </div>
                  <Progress value={student.attendance} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ParentDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Child's Overview</CardTitle>
          <CardDescription>Academic year 2024-25</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold">RS</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Rahul Sharma</h3>
                <p className="text-muted-foreground">JEE Batch A • Class 12</p>
                <Badge variant="secondary" size="sm" className="mt-1">Roll No: JEE-2024-042</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Attendance"
          value="87%"
          icon={ClipboardCheck}
          variant="success"
          description="This month"
        />
        <MetricCard
          title="Homework"
          value="12/15"
          icon={FileText}
          description="Completed this week"
        />
        <MetricCard
          title="Last Test Score"
          value="78%"
          icon={Award}
          description="Physics Unit Test"
        />
        <MetricCard
          title="Fee Due"
          value="₹15,000"
          icon={CreditCard}
          variant="warning"
          description="Due by Dec 31"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const status = index === 2 ? "absent" : index === 6 ? "holiday" : "present";
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        status === "present"
                          ? "bg-green-500/10 text-green-600"
                          : status === "absent"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status === "present" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === "absent" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Homework</CardTitle>
            <CardDescription>Assignments to complete</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { subject: "Physics", title: "Chapter 5 Problems", due: "Tomorrow" },
                { subject: "Chemistry", title: "Organic Reactions", due: "Dec 10" },
                { subject: "Maths", title: "Integration Practice", due: "Dec 12" },
              ].map((hw, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Badge variant="outline" size="sm" className="mb-1">{hw.subject}</Badge>
                    <p className="font-medium">{hw.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due: {hw.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Test scores over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { test: "Test 1", score: 72 },
                { test: "Test 2", score: 68 },
                { test: "Test 3", score: 75 },
                { test: "Test 4", score: 78 },
                { test: "Test 5", score: 82 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="test" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const role = user?.role || "parent";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Welcome back, {user?.firstName || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening at ILT Academy today.
        </p>
      </div>

      {role === "admin" && <AdminDashboard />}
      {role === "teacher" && <TeacherDashboard />}
      {(role === "parent" || role === "student") && <ParentDashboard />}
    </div>
  );
}

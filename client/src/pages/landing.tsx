import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Calendar, ClipboardCheck, CreditCard, BarChart3, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Track enrollment, academic progress, and parent details"
  },
  {
    icon: GraduationCap,
    title: "Teacher Management",
    description: "Manage faculty assignments, workload, and performance"
  },
  {
    icon: ClipboardCheck,
    title: "Attendance Tracking",
    description: "Daily batch-wise and subject-wise attendance with analytics"
  },
  {
    icon: BookOpen,
    title: "Homework & Assignments",
    description: "Upload, track, and manage homework completion"
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    description: "Track payments, installments, and generate receipts"
  },
  {
    icon: Calendar,
    title: "Timetable & Batches",
    description: "Schedule management with conflict detection"
  },
  {
    icon: BarChart3,
    title: "Test Analytics",
    description: "Comprehensive performance tracking and reporting"
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure access for admins, teachers, and parents"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" data-testid="text-brand-name">ILT Academy</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              Complete Academy Management
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
              Streamline your educational institution with our comprehensive management system. 
              Track students, manage teachers, monitor attendance, handle fees, and analyze performance - all in one place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/login">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-3" data-testid="text-features-title">Everything You Need</h3>
              <p className="text-muted-foreground">Comprehensive tools for modern educational management</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div data-testid="stat-students">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Students Managed</div>
              </div>
              <div data-testid="stat-teachers">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Expert Teachers</div>
              </div>
              <div data-testid="stat-batches">
                <div className="text-4xl font-bold text-primary mb-2">30+</div>
                <div className="text-muted-foreground">Active Batches</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to Transform Your Academy?</h3>
            <p className="mb-8 opacity-90">Sign in now to access your dashboard and start managing your institution effectively.</p>
            <Button size="lg" variant="secondary" asChild data-testid="button-cta-signin">
              <a href="/login">Sign In to Dashboard</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">ILT Academy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Internal Management System - For Authorized Users Only
          </p>
        </div>
      </footer>
    </div>
  );
}

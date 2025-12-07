import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    registrationNumber: "",
    password: "",
  });
  
  const [otpForm, setOtpForm] = useState({
    registrationNumber: "",
    otp: "",
  });

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", loginForm);
      const user = await response.json();
      
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.firstName} ${user.lastName}`,
      });
      setLocation("/");
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!otpForm.registrationNumber) {
      toast({
        title: "Error",
        description: "Please enter your registration number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/request-otp", {
        registrationNumber: otpForm.registrationNumber,
      });
      
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the login code",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/verify-otp", otpForm);
      const user = await response.json();
      
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.firstName} ${user.lastName}`,
      });
      setLocation("/");
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ILT Academy</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex items-center justify-center py-12 px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Access your ILT Academy dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password" data-testid="tab-password">Password</TabsTrigger>
                <TabsTrigger value="otp" data-testid="tab-otp">OTP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="e.g., STU001 or STU001p for parent"
                      value={loginForm.registrationNumber}
                      onChange={(e) => setLoginForm({ ...loginForm, registrationNumber: e.target.value })}
                      data-testid="input-registration-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      data-testid="input-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-password">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="otp">
                <form onSubmit={handleOtpLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="otpRegistrationNumber">Registration Number</Label>
                    <Input
                      id="otpRegistrationNumber"
                      placeholder="e.g., STU001 or STU001p for parent"
                      value={otpForm.registrationNumber}
                      onChange={(e) => setOtpForm({ ...otpForm, registrationNumber: e.target.value })}
                      disabled={otpSent}
                      data-testid="input-otp-registration"
                    />
                  </div>
                  
                  {!otpSent ? (
                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={handleRequestOtp}
                      disabled={isLoading}
                      data-testid="button-request-otp"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send OTP to Email
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          placeholder="Enter 6-digit code"
                          value={otpForm.otp}
                          onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                          data-testid="input-otp-code"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-verify-otp">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify & Sign In
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setOtpSent(false)}
                        data-testid="button-resend-otp"
                      >
                        Resend OTP
                      </Button>
                    </>
                  )}
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Tip: Add 'p' to your registration number for parent login</p>
              <p className="mt-1">(e.g., STU001p)</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

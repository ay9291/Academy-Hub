import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Phone, IdCard, Shield, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  registrationNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profileImageUrl?: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
}

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    profileImageUrl: "",
  });

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/user"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; profileImageUrl: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const startEditing = () => {
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      profileImageUrl: user?.profileImageUrl || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6" data-testid="loading-profile">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    );
  }

  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "teacher":
        return "secondary";
      case "student":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-profile-title">My Profile</h1>
        <p className="text-muted-foreground">View and manage your account details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={isEditing ? editForm.profileImageUrl : user.profileImageUrl} alt="Profile" />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl" data-testid="text-user-name">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)} data-testid="badge-role">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {user.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                      Inactive
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={startEditing} data-testid="button-edit-profile">
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileImageUrl">Profile Picture URL</Label>
                <Input
                  id="profileImageUrl"
                  placeholder="https://example.com/your-photo.jpg"
                  value={editForm.profileImageUrl}
                  onChange={(e) => setEditForm({ ...editForm, profileImageUrl: e.target.value })}
                  data-testid="input-profile-image"
                />
                <p className="text-xs text-muted-foreground">Enter the URL of your profile picture</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-profile">
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending} data-testid="button-cancel-edit">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <IdCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-medium" data-testid="text-registration-number">{user.registrationNumber || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium" data-testid="text-full-name">{user.firstName} {user.lastName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="text-email">{user.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium" data-testid="text-phone">{user.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize" data-testid="text-role">{user.role}</p>
                </div>
              </div>

              {user.createdAt && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium" data-testid="text-created-at">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

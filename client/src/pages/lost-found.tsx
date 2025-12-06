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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Search, MapPin, Calendar, CheckCircle, AlertCircle, Hand } from "lucide-react";
import type { LostAndFound } from "@shared/schema";

const itemFormSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["lost", "found"]),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

const statusConfig: Record<string, { icon: typeof AlertCircle; variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  lost: { icon: AlertCircle, variant: "destructive", label: "Lost" },
  found: { icon: CheckCircle, variant: "default", label: "Found" },
  claimed: { icon: Hand, variant: "secondary", label: "Claimed" },
  unclaimed: { icon: Search, variant: "outline", label: "Unclaimed" },
};

function ItemForm({ onSuccess, type }: { onSuccess: () => void; type: "lost" | "found" }) {
  const { toast } = useToast();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      itemName: "",
      description: "",
      location: "",
      status: type,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ItemFormData) => await apiRequest("POST", "/api/lost-found", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      toast({ 
        title: type === "lost" ? "Lost item reported" : "Found item reported",
        description: "The item has been recorded."
      });
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
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Blue water bottle" data-testid="input-item-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the item..." rows={3} data-testid="input-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location {type === "lost" ? "Last Seen" : "Found"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Physics Lab" data-testid="input-location" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-item">
            {mutation.isPending ? "Reporting..." : "Report Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ItemCard({ item }: { item: LostAndFound }) {
  const { toast } = useToast();
  const config = statusConfig[item.status] || statusConfig.lost;
  const StatusIcon = config.icon;

  const claimMutation = useMutation({
    mutationFn: async () => 
      await apiRequest("PATCH", `/api/lost-found/${item.id}`, { status: "claimed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      toast({ title: "Item marked as claimed" });
    },
  });

  return (
    <Card data-testid={`card-item-${item.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={config.variant} size="sm">
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <CardTitle className="text-lg">{item.itemName}</CardTitle>
            {item.description && (
              <CardDescription className="mt-1">{item.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {item.location}
            </span>
          )}
          {item.reportedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {item.reportedDate}
            </span>
          )}
        </div>
        {item.status === "found" && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            data-testid={`button-claim-${item.id}`}
          >
            <Hand className="h-4 w-4 mr-1" />
            Mark as Claimed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function LostFound() {
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false);
  const [isFoundDialogOpen, setIsFoundDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items, isLoading } = useQuery<LostAndFound[]>({
    queryKey: ["/api/lost-found"],
  });

  const filteredItems = items?.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lostItems = filteredItems?.filter((i) => i.status === "lost");
  const foundItems = filteredItems?.filter((i) => i.status === "found" || i.status === "unclaimed");
  const claimedItems = filteredItems?.filter((i) => i.status === "claimed");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Lost & Found</h1>
          <p className="text-muted-foreground">Report and track lost or found items</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isLostDialogOpen} onOpenChange={setIsLostDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-report-lost">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Lost
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report Lost Item</DialogTitle>
                <DialogDescription>Describe the item you've lost.</DialogDescription>
              </DialogHeader>
              <ItemForm onSuccess={() => setIsLostDialogOpen(false)} type="lost" />
            </DialogContent>
          </Dialog>
          <Dialog open={isFoundDialogOpen} onOpenChange={setIsFoundDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-report-found">
                <Plus className="h-4 w-4 mr-2" />
                Report Found
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report Found Item</DialogTitle>
                <DialogDescription>Describe the item you've found.</DialogDescription>
              </DialogHeader>
              <ItemForm onSuccess={() => setIsFoundDialogOpen(false)} type="found" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <Tabs defaultValue="found" className="space-y-6">
        <TabsList>
          <TabsTrigger value="found" data-testid="tab-found">
            Found Items ({foundItems?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="lost" data-testid="tab-lost">
            Lost Items ({lostItems?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="claimed" data-testid="tab-claimed">
            Claimed ({claimedItems?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="found">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : !foundItems?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No found items waiting to be claimed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lost">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : !lostItems?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No lost items reported</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : !claimedItems?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hand className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items have been claimed yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

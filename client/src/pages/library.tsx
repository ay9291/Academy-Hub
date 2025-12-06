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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Search, BookOpen, BookX, RotateCcw, Library as LibraryIcon } from "lucide-react";
import type { LibraryBook, BookIssue, Student } from "@shared/schema";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  totalCopies: z.coerce.number().min(1).optional(),
});

const issueFormSchema = z.object({
  bookId: z.string().min(1, "Book is required"),
  studentId: z.string().min(1, "Student is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type BookFormData = z.infer<typeof bookFormSchema>;
type IssueFormData = z.infer<typeof issueFormSchema>;

const bookCategories = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Reference",
  "General",
  "Fiction",
  "Non-Fiction",
];

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
  available: { variant: "default" },
  issued: { variant: "secondary" },
  lost: { variant: "destructive" },
  damaged: { variant: "outline" },
};

function BookForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      category: "",
      location: "",
      totalCopies: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BookFormData) => await apiRequest("POST", "/api/library/books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library/books"] });
      toast({ title: "Book added", description: "Book has been added to library." });
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
              <FormLabel>Book Title *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter book title" data-testid="input-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Author name" data-testid="input-author" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isbn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ISBN number" data-testid="input-isbn" />
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
                    {bookCategories.map((cat) => (
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shelf Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., A-12" data-testid="input-location" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalCopies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Copies</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} data-testid="input-copies" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-book">
            {mutation.isPending ? "Adding..." : "Add Book"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function IssueBookForm({ onSuccess, books, students }: { 
  onSuccess: () => void; 
  books: LibraryBook[]; 
  students: Student[];
}) {
  const { toast } = useToast();
  const availableBooks = books.filter((b) => (b.availableCopies || 0) > 0);

  const form = useForm<IssueFormData>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      bookId: "",
      studentId: "",
      dueDate: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: IssueFormData) => await apiRequest("POST", "/api/library/issues", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library/issues"] });
      toast({ title: "Book issued", description: "Book has been issued to student." });
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
          name="bookId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-book">
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} ({book.availableCopies} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.enrollmentNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date *</FormLabel>
              <FormControl>
                <Input {...field} type="date" data-testid="input-due-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-issue-book">
            {mutation.isPending ? "Issuing..." : "Issue Book"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Library() {
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: books, isLoading: booksLoading } = useQuery<LibraryBook[]>({
    queryKey: ["/api/library/books"],
  });

  const { data: issues, isLoading: issuesLoading } = useQuery<BookIssue[]>({
    queryKey: ["/api/library/issues"],
  });

  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const returnMutation = useMutation({
    mutationFn: async (issueId: string) => 
      await apiRequest("PATCH", `/api/library/issues/${issueId}/return`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library/issues"] });
      toast({ title: "Book returned" });
    },
  });

  const filteredBooks = books?.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBookTitle = (id: string) => books?.find((b) => b.id === id)?.title || "Unknown";
  const getStudentName = (id: string) => {
    const s = students?.find((s) => s.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown";
  };

  const activeIssues = issues?.filter((i) => i.status === "issued");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Library</h1>
          <p className="text-muted-foreground">Manage books and lending</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-issue-book">
                <BookOpen className="h-4 w-4 mr-2" />
                Issue Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Issue Book</DialogTitle>
                <DialogDescription>Lend a book to a student.</DialogDescription>
              </DialogHeader>
              <IssueBookForm 
                onSuccess={() => setIsIssueDialogOpen(false)} 
                books={books || []}
                students={students || []}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-book">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>Add a book to the library catalog.</DialogDescription>
              </DialogHeader>
              <BookForm onSuccess={() => setIsBookDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog" data-testid="tab-catalog">Book Catalog</TabsTrigger>
          <TabsTrigger value="issued" data-testid="tab-issued">Currently Issued</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <Card>
            <CardHeader className="pb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </CardHeader>
            <CardContent>
              {booksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : !filteredBooks?.length ? (
                <div className="text-center py-12">
                  <LibraryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No books in catalog</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id} data-testid={`row-book-${book.id}`}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author || "-"}</TableCell>
                        <TableCell>
                          {book.category && <Badge variant="outline" size="sm">{book.category}</Badge>}
                        </TableCell>
                        <TableCell>{book.location || "-"}</TableCell>
                        <TableCell>
                          {book.availableCopies} / {book.totalCopies}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[book.status]?.variant || "outline"} size="sm">
                            {book.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issued">
          <Card>
            <CardHeader>
              <CardTitle>Currently Issued Books</CardTitle>
              <CardDescription>Books currently with students</CardDescription>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : !activeIssues?.length ? (
                <div className="text-center py-12">
                  <BookX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No books currently issued</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeIssues.map((issue) => {
                      const isOverdue = new Date(issue.dueDate) < new Date();
                      return (
                        <TableRow key={issue.id} data-testid={`row-issue-${issue.id}`}>
                          <TableCell className="font-medium">{getBookTitle(issue.bookId)}</TableCell>
                          <TableCell>{getStudentName(issue.studentId)}</TableCell>
                          <TableCell>{issue.issueDate}</TableCell>
                          <TableCell>
                            <span className={isOverdue ? "text-destructive font-medium" : ""}>
                              {issue.dueDate}
                              {isOverdue && " (Overdue)"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => returnMutation.mutate(issue.id)}
                              disabled={returnMutation.isPending}
                              data-testid={`button-return-${issue.id}`}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Return
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

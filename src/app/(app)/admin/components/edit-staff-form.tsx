"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";
import { updateUser } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { User, Permission } from "@/lib/types";
import { availablePermissions } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

const staffFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().min(1, "Username is required."),
  password: z.string().optional(),
  permissions: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one permission.",
  }),
});

export function EditStaffForm({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      permissions: user.permissions || [],
    },
  });

  async function onSubmit(values: z.infer<typeof staffFormSchema>) {
    try {
      const result = await updateUser(values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Staff account has been updated.",
        });
        setOpen(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Account</DialogTitle>
          <DialogDescription>
            Update the details for the staff member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="Leave blank to keep current password"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Permissions</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Select the tabs this user can access.
                    </p>
                  </div>
                  {availablePermissions.map((permission) => (
                    <FormField
                      key={permission.id}
                      control={form.control}
                      name="permissions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={permission.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, permission.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== permission.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {permission.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

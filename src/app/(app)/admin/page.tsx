import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CreateStaffForm } from "./components/create-staff-form";
import { getUsers } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditStaffForm } from "./components/edit-staff-form";
import { DeleteUserDialog } from "./components/delete-user-dialog";

export default async function AdminPage() {
  const user = await auth();
  if (!user || !user.permissions.includes("admin")) {
    redirect("/customers");
  }

  const users = getUsers();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Admin Control"
          description="Manage staff accounts and permissions."
        />
        <CreateStaffForm />
      </div>

      <div className="space-y-4">
        <h2 className="font-headline text-2xl font-semibold">Current Users</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                    {user.permissions.map(permission => (
                         <Badge
                          key={permission}
                          variant={
                            permission === "admin"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {permission}
                        </Badge>
                    ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                      <EditStaffForm user={user} />
                      {!user.permissions.includes('admin') && <DeleteUserDialog userId={user.id} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

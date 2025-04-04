import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { deleteUser, getAllUsers } from "@/Api_Requests/Api_Requests";
import { Input } from "../ui/input";

const UserManagement = () => {
  // Sample user data
  const [users, setUsers] = useState([]);

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Add pagination to the user table by adding this state after the searchTerm state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const allUsers = async () => {
      try {
        const users = await getAllUsers();
        console.log(users);
        setUsers(users.data);
      } catch (error) {
        console.log("error fetching users", error);
      }
    };
    allUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (userToDelete !== null) {
      try {
        await deleteUser(userToDelete); // Pass the user ID
        setUsers(users.filter((user) => user._id !== userToDelete)); // Remove from state
        setUserToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (err) {
        console.log("Error deleting user:", err);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="dark">
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription className="pt-2">
              Manage your users and their permissions
            </CardDescription>
            <Input
              className="mt-3"
              placeholder="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className=" rounded-[6px] border border-gray-800 p-3 pt-1">
            <Table>
              <TableHeader>
                <TableRow className="border-b-gray-800">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  {/* <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead> */}
                  <TableHead>Joined On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:border-y-gray-800 border-none"
                    >
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      {/* <TableCell>{"N/A"}</TableCell> */}
                      {/* <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 pb-1 text-xs font-medium ${
                            user.status !== "Active"
                              ? "bg-green-800 text-green-100"
                              : "bg-gray-600 text-gray-100"
                          }`}
                        >
                          {"active"}
                        </span>
                      </TableCell> */}
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                        })}
                        ,{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={isDeleteDialogOpen && userToDelete === user._id}
                          onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open);
                            if (!open) setUserToDelete(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="rounded-[0.4rem]"
                              variant="destructive"
                              size="sm"
                              onClick={() => setUserToDelete(user._id)}
                            >
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {user.username}?
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                className="rounded-[0.4rem]"
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="rounded-[0.4rem]"
                                variant="destructive"
                                onClick={handleDeleteUser}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  className="rounded-[0.4rem]"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  className="rounded-[0.4rem]"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

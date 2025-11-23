"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "../schemas/user.schema";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useRouter } from "next/navigation";
import type { User } from "../types";

interface UserFormProps {
  user?: User;
  mode?: "create" | "edit";
}

export function UserForm({ user, mode = "create" }: UserFormProps) {
  const router = useRouter();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isEdit = mode === "edit" && user;
  const schema = isEdit ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      : {
          email: "",
          password: "",
          name: "",
          role: "user",
          status: "active",
        },
  });

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (isEdit && user) {
        await updateUser.mutateAsync({
          id: user.id,
          data: data as UpdateUserFormData,
        });
      } else {
        await createUser.mutateAsync(data as CreateUserFormData);
      }
      router.push("/users");
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const isLoading = isSubmitting || createUser.isPending || updateUser.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit User" : "Create New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                {...register("name")}
                disabled={isLoading}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            )}

            {isEdit && (
              <Field>
                <FieldLabel htmlFor="password">New Password (optional)</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  placeholder="Leave empty to keep current password"
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <select
                id="role"
                {...register("role")}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="receptionist">Receptionist</option>
                <option value="cashier">Cashier</option>
              </select>
              {errors.role && <FieldError>{errors.role.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <select
                id="status"
                {...register("status")}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <FieldError>{errors.status.message}</FieldError>}
            </Field>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEdit ? "Update User" : "Create User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}


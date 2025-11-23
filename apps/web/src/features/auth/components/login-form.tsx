"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "../stores/useAuthStore";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";
import type { AuthError } from "../types/errors";

export function LoginForm() {
  const { isAuthenticated } = useAuthStore();
  const { handleLogin, isLoading, error, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect handled by useLogin hook
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setError("root", {
        message: error,
      });
      clearError();
    }
  }, [error, setError, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await handleLogin(data);
    } catch (err) {
      const error = err as AuthError;
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Login failed. Please try again.";
      setError("root", {
        message: errorMessage,
      });
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border border-border shadow-lg">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              H
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
          </div>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  disabled={isFormLoading}
                  aria-invalid={!!errors.email}
                  className="h-11"
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  disabled={isFormLoading}
                  aria-invalid={!!errors.password}
                  className="h-11"
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>

              {errors.root && (
                <Field>
                  <FieldError>{errors.root.message}</FieldError>
                </Field>
              )}

              <Field>
                <Button
                  type="submit"
                  disabled={isFormLoading}
                  className="w-full h-11 text-base font-medium"
                >
                  {isFormLoading ? "Signing in..." : "Sign in"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

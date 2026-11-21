import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to CityFix as a citizen, department staff member or city administrator.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold">Welcome back 👋</h1>
        <p className="mt-2 text-muted-foreground">Log in to your account</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[560px] w-full rounded-2xl" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to CityFix?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create a citizen account
        </Link>
      </p>
    </>
  );
}

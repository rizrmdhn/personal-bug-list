import { getCurrentSession } from "@/lib/jwt-auth";
import { redirect } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const { user } = await getCurrentSession();

  if (user) {
    redirect("/dashboard");
  }

  return children;
}

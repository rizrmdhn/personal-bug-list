import { getCurrentSession } from "@/lib/sessions";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  redirect("/dashboard");
}

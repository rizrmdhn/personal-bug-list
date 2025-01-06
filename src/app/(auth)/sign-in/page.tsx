import { LoginForm } from "@/components/login-form";
import generateMetadata from "@/lib/generate-metadata";

export const metadata = generateMetadata({
  title: "Sign In",
});

export default async function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
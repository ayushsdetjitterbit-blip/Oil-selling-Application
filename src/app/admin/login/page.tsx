import { redirect } from "next/navigation";
import { adminPasswordProblem, isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/logo";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const problem = adminPasswordProblem();
  return (
    <div className="hero-bg grain relative grid min-h-screen place-items-center px-4">
      <div className="rise relative z-10 w-full max-w-sm rounded-3xl bg-cream p-8 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="font-serif text-xl font-bold text-leaf-dark">Natural Oil</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-bark/50">Shop admin</p>
          </div>
        </div>
        {problem ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{problem}</p>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}

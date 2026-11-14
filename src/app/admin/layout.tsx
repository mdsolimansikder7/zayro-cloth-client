import { forbidden, redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getServerSession();

  if (!session) redirect("/sign-in?callbackUrl=%2Fadmin");
  if (session.user.role !== "admin") forbidden();

  return children;
}

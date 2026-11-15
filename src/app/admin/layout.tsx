import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession();
  return {
    title: session?.user.role === "admin" ? "Store Admin | Zayro" : "Zayro",
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getServerSession();

  if (!session) redirect("/sign-in?callbackUrl=%2Fadmin");
  // Do not reveal the existence of the admin area to a signed-in non-admin.
  if (session.user.role !== "admin") notFound();

  return children;
}

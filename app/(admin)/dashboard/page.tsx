import { redirect } from "next/navigation";

/** Legacy path — the operations dashboard lives at the admin root. */
export default function DashboardPage() {
  redirect("/");
}

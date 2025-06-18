import { redirect } from "next/navigation";

export default function Home() {
  // Redirect zur login page
  redirect("/login");
}

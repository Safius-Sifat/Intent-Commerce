import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Sign in | Intent Commerce",
  description: "Sign in to continue shopping, view your cart, and track orders",
};

export default function LoginRoute() {
  return <LoginPage />;
}

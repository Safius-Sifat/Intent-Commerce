import type { Metadata } from "next";
import { RegisterPage } from "@/components/auth/register-page";

export const metadata: Metadata = {
  title: "Create account | Intent Commerce",
  description: "Create a shopper account to save your cart and track orders",
};

export default function RegisterRoute() {
  return <RegisterPage />;
}

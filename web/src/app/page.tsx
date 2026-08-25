import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import HomePage from "./HomePage";

export const metadata: Metadata = canonicalMetadata("/");

export default function Page() {
  return <HomePage />;
}

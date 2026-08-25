import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import TaskMatchPage from "./TaskMatchPage";

export const metadata: Metadata = canonicalMetadata("/taskmatch");

export default function Page() {
  return <TaskMatchPage />;
}

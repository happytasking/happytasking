import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { loadPublicTaskMatch } from "@/lib/publicPages";
import TaskMatchPage from "./TaskMatchPage";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "TaskMatch",
  description:
    "Find where your AI skills fit best. TaskMatch estimates role fit and, separately, whether an opportunity looks worth pursuing using independent Happy Tasking intelligence.",
  ...canonicalMetadata("/taskmatch"),
};

export default async function Page() {
  const initial = await loadPublicTaskMatch();
  return <TaskMatchPage initial={initial} />;
}

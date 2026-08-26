import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { loadPublicTaskMatch } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import TaskMatchPage from "./TaskMatchPage";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/taskmatch",
  title: "TaskMatch",
  description:
    "Find where your AI skills fit best. TaskMatch estimates role fit and, separately, whether an opportunity looks worth pursuing using independent Happy Tasking intelligence.",
});

export default async function Page() {
  const initial = await loadPublicTaskMatch();
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "TaskMatch", path: "/taskmatch" },
          ]}
        />
      </div>
      <TaskMatchPage initial={initial} />
    </>
  );
}

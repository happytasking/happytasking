import type { Metadata } from "next";
import { loadPublicTaskMatch } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { taskmatchPageMetadata } from "@/lib/taskmatchLanding";
import TaskMatchPage from "./TaskMatchPage";

export const revalidate = 120;

export const metadata: Metadata = taskmatchPageMetadata();

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

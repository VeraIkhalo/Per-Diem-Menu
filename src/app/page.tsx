import { Suspense } from "react";
import { MenuBrowser } from "@/components/MenuBrowser";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <MenuBrowser />
      </Suspense>
    </div>
  );
}

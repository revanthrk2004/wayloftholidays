"use client";

import "@/app/lib/builder-server"; // init Builder key on client
import { useEffect } from "react";
import { BuilderComponent } from "@builder.io/react";

export default function BuilderRender({ urlPath }: { urlPath: string }) {
  // ensure registry is loaded (so components appear in Builder editor)
  useEffect(() => {
    import("@/app/lib/builder-registry");
  }, []);

  return (
    <BuilderComponent
      model="page"
      options={{ url: urlPath }}
    />
  );
}

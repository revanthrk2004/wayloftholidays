"use client";

import { useEffect, useMemo, useState } from "react";
import { Builder, BuilderComponent, builder } from "@builder.io/react";
import "@/app/lib/builder-registry"; // IMPORTANT: registers your components

type Props = {
  path: string; // like "/builder" or "/builder/about"
};

export default function BuilderPageClient({ path }: Props) {
  const [content, setContent] = useState<any>(null);

  // Ensure Builder is initialised on client
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
    if (key) builder.init(key);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Fetch Builder content for this URL
      const res = await builder
        .get("page", {
          userAttributes: { urlPath: path.replace("/builder", "") || "/" },
        })
        .toPromise();

      if (!cancelled) setContent(res);
    })();

    return () => {
      cancelled = true;
    };
  }, [path]);

  // Optional: show nothing if not found (Builder editor still works)
  if (!content) return null;

  return <BuilderComponent model="page" content={content} />;
}

import { builder } from "@builder.io/sdk";
import BuilderRenderer from "./renderer";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function BuilderCatchAllPage({ params }: Props) {
  const { path } = await params;

  // ✅ /builder should preview the home page "/"
  const urlPath = "/" + (path?.join("/") ?? "");
  const normalizedPath = urlPath === "/" ? "/" : urlPath.replace(/\/+$/, "");

  const content = await builder
    .get("page", {
      userAttributes: { urlPath: normalizedPath },
      // Helps in the visual editor
      cachebust: true,
    })
    .toPromise();

  // ✅ Instead of returning 404, show a helpful screen
  if (!content) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Builder preview is connected ✅</h1>
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          But Builder has no published <b>page</b> content for:
          <code style={{ marginLeft: 6 }}>{normalizedPath}</code>
        </p>

        <ol style={{ marginTop: 14, lineHeight: 1.7, opacity: 0.85 }}>
          <li>Open Builder dashboard</li>
          <li>Create a <b>Page</b> model called <b>page</b> (if not already)</li>
          <li>Create a new page with URL = <b>{normalizedPath}</b></li>
          <li>Publish it</li>
        </ol>

        <p style={{ marginTop: 14, opacity: 0.8 }}>
          Also confirm <code>NEXT_PUBLIC_BUILDER_API_KEY</code> exists in <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return <BuilderRenderer content={content} />;
}

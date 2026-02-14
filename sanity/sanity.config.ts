import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "wayloftholidays",
  title: "WayLoft Holidays CMS",
  projectId: "aqiqmuco",
  dataset: "production",
  plugins: [deskTool()],
  schema: { types: schemaTypes },
  basePath: "/studio",

});

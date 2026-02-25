import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "legalPage",
  title: "Legal Page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      description: "Use exactly: cookies, privacy, terms, disclaimer",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),

    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "slug",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Legal Page",
        subtitle: `Slug: ${subtitle || "missing"}`,
      };
    },
  },
});
import { defineType, defineField } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    // HERO
    defineField({ name: "heroTitle", title: "Hero Title", type: "string" }),
    defineField({ name: "heroSubtitle", title: "Hero Subtitle", type: "text" }),

    defineField({
      name: "heroVideo",
      title: "Hero Video (mp4)",
      type: "file",
      options: {
        accept: "video/mp4",
      },
    }),

    defineField({
      name: "heroPoster",
      title: "Hero Poster Image",
      type: "image",
      options: { hotspot: true },
    }),

    // TRIPS
    defineField({
      name: "tripsHeading",
      title: "Trips Heading",
      type: "string",
      initialValue: "Trips",
    }),

    defineField({ name: "tripsSubtitle", title: "Trips Subtitle", type: "text" }),

    defineField({
      name: "trips",
      title: "Trips List",
      type: "array",
      of: [
        defineType({
          type: "object",
          name: "tripItem",
          title: "Trip",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),

            // ✅ change from string → slug (auto)
            defineField({
              name: "slug",
              title: "Slug",
              type: "slug",
              options: { source: "title", maxLength: 96 },
              validation: (Rule) => Rule.required(),
            }),

            defineField({ name: "subtitle", title: "Subtitle", type: "text" }),

            defineField({
              name: "image",
              title: "Background Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "title", media: "image" },
          },
        }),
      ],
    }),

    // EXPERIENCES
    defineField({
      name: "experiencesHeading",
      title: "Experiences Heading",
      type: "string",
      initialValue: "Experiences",
    }),

    defineField({
      name: "experiencesSubtitle",
      title: "Experiences Subtitle",
      type: "text",
    }),

    defineField({
      name: "experiences",
      title: "Experience Cards",
      type: "array",
      of: [
        defineType({
          type: "object",
          name: "experienceItem",
          title: "Experience",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "text" }),
          ],
          preview: {
            select: { title: "title" },
          },
        }),
      ],
    }),

    // ABOUT
    defineField({ name: "aboutHeading", title: "About Heading", type: "string" }),
    defineField({
      name: "aboutBody",
      title: "About Body",
      type: "array",
      of: [{ type: "block" }],
    }),

    // CONTACT
    defineField({ name: "contactHeading", title: "Contact Heading", type: "string" }),
    defineField({ name: "contactEmail", title: "Contact Email", type: "string" }),
    defineField({ name: "contactWhatsapp", title: "WhatsApp Text", type: "string" }),
  ],
});

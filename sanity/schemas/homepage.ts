import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    // HERO
    defineField({ name: "heroTitle", title: "Hero Title", type: "string" }),
    defineField({ name: "heroSubtitle", title: "Hero Subtitle", type: "text" }),
    defineField({ name: "heroVideo", title: "Hero Video (mp4)", type: "file" }),
    defineField({ name: "heroPoster", title: "Hero Poster Image", type: "image" }),

    // ✅ HERO RIGHT BOX (NEW)
    defineField({
      name: "heroRightEyebrow",
      title: "Hero Right Eyebrow",
      type: "string",
      initialValue: "Why WayLoft",
    }),
    defineField({
      name: "heroRightTitle",
      title: "Hero Right Title",
      type: "string",
      initialValue: "Designed for people who care how they travel",
    }),
    defineField({
      name: "heroRightItems",
      title: "Hero Right Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "heroRightItem",
          title: "Hero Right Item",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "text" }),
          ],
        }),
      ],
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
        defineArrayMember({
          type: "object",
          name: "tripItem",
          title: "Trip",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "slug",
              title: "Slug",
              type: "string",
              description: "Example: morocco, albania (no spaces)",
            }),
            defineField({ name: "subtitle", title: "Subtitle", type: "text" }),
            defineField({ name: "image", title: "Background Image", type: "image" }),
            defineField({ name: "thumb", title: "Thumbnail (Square)", type: "image" }),
            defineField({ name: "about", title: "About", type: "text" }),

            defineField({
              name: "highlights",
              title: "Highlights",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "highlightItem",
                  title: "Highlight",
                  fields: [
                    defineField({ name: "name", title: "Name", type: "string" }),
                    defineField({ name: "image", title: "Image", type: "image" }),
                    defineField({ name: "description", title: "Description", type: "text" }),
                  ],
                }),
              ],
            }),
          ],
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
    defineField({ name: "experiencesSubtitle", title: "Experiences Subtitle", type: "text" }),
    defineField({
      name: "experiences",
      title: "Experience Cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "experienceItem",
          title: "Experience",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "desc", title: "Description", type: "text" }),
          ],
        }),
      ],
    }),

    // ABOUT
// ABOUT (✅ UPGRADED + EDITABLE)
defineField({
  name: "aboutHeading",
  title: "About Heading",
  type: "string",
  initialValue: "About WayLoft",
}),
defineField({
  name: "aboutBody",
  title: "About Body",
  type: "array",
  of: [defineArrayMember({ type: "block" })],
}),

defineField({
  name: "aboutImage",
  title: "About Image",
  type: "image",
  options: { hotspot: true },
}),
defineField({
  name: "aboutImageAlt",
  title: "About Image Alt Text",
  type: "string",
}),

defineField({
  name: "aboutCards",
  title: "About Feature Cards",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      name: "aboutCard",
      title: "Card",
      fields: [
        defineField({ name: "tag", title: "Tag (small label)", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "desc", title: "Description", type: "text" }),
        defineField({
          name: "emoji",
          title: "Emoji (optional)",
          type: "string",
          description: "Example: ✨ 🗺️ ⚡",
        }),
      ],
    }),
  ],
}),

defineField({
  name: "aboutStats",
  title: "About Stats",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      name: "aboutStat",
      title: "Stat",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "value", title: "Value", type: "string" }),
      ],
    }),
  ],
}),

defineField({ name: "aboutCtaText", title: "About CTA Text", type: "string" }),
defineField({ name: "aboutCtaHref", title: "About CTA Link", type: "string" }),


    // CONTACT
    defineField({ name: "contactHeading", title: "Contact Heading", type: "string" }),
    defineField({ name: "contactEmail", title: "Contact Email", type: "string" }),
    defineField({ name: "contactWhatsapp", title: "WhatsApp Text", type: "string" }),
  ],
});

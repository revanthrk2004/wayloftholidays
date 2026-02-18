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

 // ABOUT (FULLY EDITABLE)
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

// Watermark logo image + opacity (editable)
defineField({
  name: "aboutWatermarkImage",
  title: "About Watermark Logo",
  type: "image",
  options: { hotspot: true },
}),


// Cards (editable)
defineField({
  name: "aboutCards",
  title: "About Cards",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      name: "aboutCard",
      title: "Card",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          description: "Example: Personal, Premium, Fast",
        }),
        defineField({
          name: "icon",
          title: "Icon",
          type: "string",
          description: "Choose icon style for this card",
          options: {
            list: [
              { title: "Sparkles", value: "sparkles" },
              { title: "Gem", value: "gem" },
              { title: "Timer", value: "timer" },
            ],
            layout: "radio",
          },
          initialValue: "sparkles",
        }),
        defineField({
          name: "text",
          title: "Text",
          type: "text",
          description: "Card description text",
        }),
      ],
    }),
  ],
}),

// Bottom small line text (editable)
defineField({
  name: "aboutFootnote",
  title: "About Footnote Text",
  type: "string",
  initialValue: "WayLoft Holidays",
}),

    // CONTACT
    defineField({ name: "contactHeading", title: "Contact Heading", type: "string" }),
    defineField({ name: "contactEmail", title: "Contact Email", type: "string" }),
    defineField({ name: "contactWhatsapp", title: "WhatsApp Text", type: "string" }),
  ],
});

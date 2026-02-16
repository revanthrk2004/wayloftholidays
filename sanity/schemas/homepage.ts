import { defineType, defineField, defineArrayMember } from "sanity";

export default {
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    // HERO
    { name: "heroTitle", title: "Hero Title", type: "string" },
    { name: "heroSubtitle", title: "Hero Subtitle", type: "text" },
    { name: "heroVideo", title: "Hero Video (mp4)", type: "file" },
    { name: "heroPoster", title: "Hero Poster Image", type: "image" },

    // TRIPS
    {
      name: "tripsHeading",
      title: "Trips Heading",
      type: "string",
      initialValue: "Trips",
    },
    { name: "tripsSubtitle", title: "Trips Subtitle", type: "text" },
    {
      name: "trips",
      title: "Trips List",
      type: "array",
      of: [
        {
          type: "object",
          name: "tripItem",
          title: "Trip",
          fields: [
            { name: "title", title: "Title", type: "string" },
            {
              name: "slug",
              title: "Slug",
              type: "string",
              description: "Example: morocco, albania (no spaces)",
            },
            { name: "subtitle", title: "Subtitle", type: "text" },

            // ✅ big background image used in Trips section
            { name: "image", title: "Background Image", type: "image" },

            // ✅ NEW: small square image for details page
            { name: "thumb", title: "Thumbnail (Square)", type: "image" },

            // ✅ NEW: About text for the trip details page
            { name: "about", title: "About", type: "text" },

            // ✅ NEW: Highlights list for the trip details page
            {
              name: "highlights",
              title: "Highlights",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "highlightItem",
                  title: "Highlight",
                  fields: [
                    { name: "name", title: "Name", type: "string" },
                    { name: "image", title: "Image", type: "image" },
                    { name: "description", title: "Description", type: "text" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // EXPERIENCES
    {
      name: "experiencesHeading",
      title: "Experiences Heading",
      type: "string",
      initialValue: "Experiences",
    },
    { name: "experiencesSubtitle", title: "Experiences Subtitle", type: "text" },
    {
      name: "experiences",
      title: "Experience Cards",
      type: "array",
      of: [
        {
          type: "object",
          name: "experienceItem",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "desc", title: "Description", type: "text" },
          ],
        },
      ],
    },

    // ABOUT
    { name: "aboutHeading", title: "About Heading", type: "string" },
    { name: "aboutBody", title: "About Body", type: "array", of: [{ type: "block" }] },

    // CONTACT
    { name: "contactHeading", title: "Contact Heading", type: "string" },
    { name: "contactEmail", title: "Contact Email", type: "string" },
    { name: "contactWhatsapp", title: "WhatsApp Text", type: "string" },
  ],
};

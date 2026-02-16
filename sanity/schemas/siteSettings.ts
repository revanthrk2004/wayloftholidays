export default {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    { name: "brandName", title: "Brand Name", type: "string" },
    { name: "brandTagline", title: "Brand Tagline", type: "string" },
    { name: "logo", title: "Logo", type: "image" },

    // Header
    { name: "planButtonText", title: "Plan Button Text", type: "string" },

    // Footer
    { name: "footerText", title: "Footer Text", type: "text" },
    { name: "hashtag", title: "Hashtag", type: "string" },

    // Links
    { name: "email", title: "Email", type: "string" },
    { name: "whatsappLink", title: "WhatsApp Link", type: "url" },
    { name: "instagramLink", title: "Instagram Link", type: "url" },
  ],
};

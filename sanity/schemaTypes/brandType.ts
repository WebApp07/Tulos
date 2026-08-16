import { defineField, defineType } from "sanity";

export const brandType = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Brand Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description:
        "Short brand description shown on the brand hub page and used in search results.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description:
        "Overrides the <title> tag for the brand hub page. Defaults to the brand name.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      description:
        "Overrides the meta description for the brand hub page. Defaults to the description.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "altText",
          title: "Alt Text",
          type: "string",
          description:
            "Accessible alternative text for the logo image. Defaults to the brand name.",
        }),
      ],
    }),
    defineField({
      name: "officialPartner",
      title: "Official Partner",
      type: "boolean",
      initialValue: false,
      description:
        "Whether Licendi is an officially authorized partner for this brand. Never set this for a brand you are not actually partnered with.",
    }),
    defineField({
      name: "showPosts",
      title: "Show Blog Posts",
      type: "boolean",
      initialValue: true,
      description:
        "Whether blog posts linked to this brand are shown on the brand hub page. Turn off to keep the brand page focused on products and categories.",
    }),
    defineField({
      name: "relatedCategories",
      title: "Related Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
      description:
        "Categories that belong to this brand. Only include categories that actually exist with real products.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "logo",
    },
  },
});
// import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  // icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "intro",
      title: "Product Intro",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
    }),
    defineField({
      name: "brandRef",
      title: "Brand (document)",
      type: "reference",
      to: [{ type: "brand" }],
      description:
        "Optional link to a brand document. Powers the brand hub page, brand breadcrumb, and brand JSON-LD.",
    }),
    defineField({
      name: "sku",
      title: "Manufacturer SKU",
      type: "string",
    }),
    defineField({
      name: "gender",
      title: "Gender",
      type: "string",
    }),
    defineField({
      name: "nickname",
      title: "Nickname",
      type: "string",
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "string",
    }),
    defineField({
      name: "variants",
      title: "Product Variants",
      type: "array",
      of: [
        {
          type: "object",
          name: "variant",
          fields: [
            { name: "color", type: "string", title: "Color" },
            { name: "size", type: "string", title: "Size" },
            { name: "variantSku", type: "string", title: "Variant SKU" },
            { name: "stock", type: "number", title: "Stock", validation: (Rule: any) => Rule.min(0) },
            { name: "price", type: "number", title: "Price", validation: (Rule: any) => Rule.min(0) },
            { name: "variantImage", type: "image", title: "Variant Image", options: { hotspot: true } },
          ],
          preview: {
            select: {
              color: "color",
              size: "size",
              stock: "stock",
              price: "price",
              media: "variantImage",
            },
            prepare(selection: any) {
              const { color, size, stock, price, media } = selection;
              return {
                title: `${color || "No Color"} / ${size || "No Size"}`,
                subtitle: `$${price || 0} - Stock: ${stock || 0}`,
                media: media,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "price",
      title: "Product Price",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "discount",
      title: "Discount Percentage",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "status",
      title: "Product Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },
          { title: "Sale", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "productType",
      title: "Product Type",
      type: "string",
      options: {
        list: [
          { title: "Tshirt", value: "tshirt" },
          { title: "Jacket", value: "jacket" },
          { title: "Pants", value: "pants" },
          { title: "Hoodie", value: "hoodie" },
          { title: "Short", value: "short" },
          { title: "Others", value: "others" },
        ],
      },
    }),
    defineField({
      name: "osType",
      title: "Type",
      type: "string",
      description: "e.g. Operating System",
    }),
    defineField({
      name: "operatingSystemsSupported",
      title: "Operating Systems Supported",
      type: "string",
      description: "e.g. Windows",
    }),
    defineField({
      name: "versionType",
      title: "Version Type",
      type: "string",
      description: "e.g. Internet",
    }),
    defineField({
      name: "productStatus",
      title: "Product Status",
      type: "string",
      description: "e.g. Stock",
    }),
    defineField({
      name: "placeOfOrigin",
      title: "Place of Origin",
      type: "string",
      description: "e.g. USA",
    }),
    defineField({
      name: "brandName",
      title: "Brand Name",
      type: "string",
      description: "e.g. MS",
    }),
    defineField({
      name: "activation",
      title: "Activation",
      type: "string",
      description: "e.g. 100% Activation Online",
    }),
    defineField({
      name: "shippingMethod",
      title: "Shipping Method",
      type: "string",
      description: "e.g. Email Online Delivery",
    }),
    defineField({
      name: "packageInclude",
      title: "Package Include",
      type: "string",
      description: "e.g. Digital Key",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      description: "e.g. Multi-language",
    }),
    defineField({
      name: "warranty",
      title: "Warranty",
      type: "string",
      description: "e.g. 6 Months",
    }),
    defineField({
      name: "deliveryTime",
      title: "Delivery Time",
      type: "string",
      description: "e.g. Within 24 Hours",
    }),
    defineField({
      name: "support",
      title: "Support",
      type: "string",
      description: "e.g. 1 User / 1 PC",
    }),
    defineField({
      name: "function",
      title: "Function",
      type: "string",
      description: "e.g. 100% Working",
    }),
    defineField({
      name: "paymentMethods",
      title: "Payment Methods",
      type: "string",
      description: "e.g. TT, Western Union, Paypal, Payoneer",
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images",
      subtitle: "price",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      const image = media && media[0];
      return {
        title: title,
        subtitle: `$${subtitle}`,
        media: image,
      };
    },
  },
});

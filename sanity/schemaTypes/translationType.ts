import { defineField, defineType } from "sanity";

const locales = [
  { title: "English", value: "en" },
  { title: "Français", value: "fr" },
  { title: "Deutsch", value: "de" },
  { title: "Español", value: "es" },
  { title: "Italiano", value: "it" },
  { title: "Suomi", value: "fi" },
  { title: "Svenska", value: "sv" },
];

export const translationType = defineType({
  name: "translation",
  title: "Translation",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description:
        "Dotted path used by the frontend, e.g. common.addToCart or footer.quickLinks. Structured keys (arrays/objects) use lowercase dot paths too, e.g. about.paragraphs.",
      validation: (Rule) =>
        Rule.required().custom(async (key, context) => {
          const { document, getClient } = context;
          if (!key || !document?.locale) return true;
          const client = getClient({ apiVersion: "2024-12-15" });
          const dupes = await client.fetch(
            `count(*[_type == "translation" && locale == $locale && key == $key && _id != $id])`,
            {
              locale: document.locale,
              key,
              id: document._id,
            },
          );
          return dupes > 0
            ? `A translation for "${key}" (${document.locale}) already exists.`
            : true;
        }),
    }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: { list: locales },
      validation: (Rule) => Rule.required(),
      initialValue: "en",
    }),
    defineField({
      name: "structured",
      title: "Structured Value",
      type: "boolean",
      description:
        "Enable when the value is an array or object (e.g. about.paragraphs, faqs.items, terms.sections, privacy.sections). The value field must contain valid JSON.",
      initialValue: false,
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      key: "key",
      locale: "locale",
      value: "value",
      structured: "structured",
    },
    prepare(selection) {
      const { key, locale, value, structured } = selection;
      return {
        title: `${key} [${locale}]`,
        subtitle: structured ? `{structured} ${value}` : value,
      };
    },
  },
});
import type { StructureResolver } from "sanity/structure";

const locales = [
  { id: "en", title: "English" },
  { id: "fr", title: "Français" },
  { id: "de", title: "Deutsch" },
  { id: "es", title: "Español" },
];

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) => {
  const notIncluded = ["category", "translation"];
  return (
    S.list()
      .title("Tulos Backend")
      .items([
        S.documentTypeListItem("category").title("Categories"),
        S.divider(),
        S.listItem()
          .title("Translations")
          .child(
            S.list()
              .title("Translations")
              .items([
                S.listItem()
                  .title("All Translations")
                  .child(
                    S.documentTypeList("translation")
                      .title("All Translations")
                      .initialValueTemplates([
                        S.initialValueTemplateItem("translation", { locale: "en" }),
                      ]),
                  ),
                ...locales.map((locale) =>
                  S.listItem()
                    .id(`translation-${locale.id}`)
                    .title(`Translations — ${locale.title}`)
                    .child(
                      S.documentTypeList("translation")
                        .title(`Translations — ${locale.title}`)
                        .filter("_type == 'translation' && locale == $locale")
                        .params({ locale: locale.id })
                        .initialValueTemplates([
                          S.initialValueTemplateItem("translation", {
                            locale: locale.id,
                          }),
                        ]),
                    ),
                ),
              ]),
          ),
        S.divider(),
        ...S.documentTypeListItems().filter(
          (item) => item.getId() && !notIncluded.includes(item.getId()!),
        ),
      ])
  );
};
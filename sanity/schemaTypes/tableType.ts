import { defineField, defineType } from "sanity";

export const tableRowType = defineType({
  name: "tableRow",
  title: "Table Row",
  type: "object",
  fields: [
    defineField({
      name: "cells",
      title: "Cells",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});

export const tableType = defineType({
  name: "table",
  title: "Comparison Table",
  type: "object",
  fields: [
    defineField({
      name: "headers",
      title: "Headers",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [{ type: "tableRow" }],
    }),
  ],
});
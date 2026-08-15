import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { orderType } from "./orderTypes";
import { translationType } from "./translationType";
import { authorType } from "./authorType";
import { postType } from "./postType";
import { brandType } from "./brandType";
import { tableType, tableRowType } from "./tableType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    productType,
    orderType,
    translationType,
    authorType,
    postType,
    brandType,
    tableRowType,
    tableType,
  ],
};

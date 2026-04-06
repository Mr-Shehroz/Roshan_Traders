// sanity/schemas/stockTransaction.ts
export default {
  name: "stockTransaction",
  title: "Stock Transaction",
  type: "document",
  fields: [
    {
      name: "productType",
      title: "Product Type",
      type: "string",
      options: { list: ["beverage", "dryGood"] },
      validation: (R: any) => R.required(),
    },
    {
      name: "productRef",
      title: "Product (Beverage)",
      type: "reference",
      to: [{ type: "beverage" }],
      hidden: ({ document }: any) => document?.productType !== "beverage",
    },
    {
      name: "dryGoodRef",
      title: "Product (Dry Good)",
      type: "reference",
      to: [{ type: "dryGood" }],
      hidden: ({ document }: any) => document?.productType !== "dryGood",
    },
    {
      name: "variantLabel",
      title: "Variant (size/weight)",
      type: "string",
      description: "e.g. 500ml, 1kg",
    },
    {
      name: "transactionType",
      title: "Transaction Type",
      type: "string",
      options: { list: ["IN", "OUT"] },
      validation: (R: any) => R.required(),
    },
    {
      name: "quantity",
      title: "Quantity",
      type: "number",
      validation: (R: any) => R.required().positive(),
    },
    {
      name: "pricePerUnit",
      title: "Price Per Unit (PKR)",
      type: "number",
      validation: (R: any) => R.required().positive(),
    },
    {
      name: "totalAmount",
      title: "Total Amount (PKR)",
      type: "number",
    },
    {
      name: "date",
      title: "Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
    {
      name: "notes",
      title: "Notes",
      type: "string",
    },
  ],
  preview: {
    select: {
      title: "variantLabel",
      subtitle: "transactionType",
      date: "date",
    },
    prepare({ title, subtitle, date }: any) {
      return {
        title: `${subtitle} — ${title}`,
        subtitle: new Date(date).toLocaleDateString("en-PK"),
      };
    },
  },
  orderings: [
    {
      title: "Date, Newest",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
};
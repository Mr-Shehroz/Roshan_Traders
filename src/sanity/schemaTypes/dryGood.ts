// sanity/schemas/dryGood.ts
export default {
  name: "dryGood",
  title: "Dry Good",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (R: any) => R.required(),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["Daal", "Rice", "Spices", "Flour", "Sugar", "Salt", "Oil", "Other"],
      },
    },
    {
      name: "unit",
      title: "Unit",
      type: "string",
      options: { list: ["kg", "g", "packet"] },
      initialValue: "kg",
    },
    {
      name: "variants",
      title: "Weight Variants",
      type: "array",
      of: [
        {
          type: "object",
          name: "weightVariant",
          fields: [
            { name: "weight", title: "Weight (e.g. 1kg, 5kg, 500g)", type: "string" },
            { name: "buyPrice", title: "Buy Price (PKR)", type: "number" },
            { name: "sellPrice", title: "Sell Price (PKR)", type: "number" },
            { name: "stock", title: "Current Stock (units)", type: "number" },
          ],
          preview: {
            select: { title: "weight", subtitle: "sellPrice" },
            prepare({ title, subtitle }: any) {
              return { title, subtitle: `Sell: PKR ${subtitle}` };
            },
          },
        },
      ],
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 2,
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
};
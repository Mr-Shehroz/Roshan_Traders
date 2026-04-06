// sanity/schemas/beverage.ts
export default {
  name: "beverage",
  title: "Beverage",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (R: any) => R.required(),
    },
    {
      name: "brand",
      title: "Brand",
      type: "string",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["Water", "Juice", "Soda", "Energy Drink", "Milk", "Tea", "Coffee", "Other"],
      },
    },
    {
      name: "variants",
      title: "Size Variants",
      type: "array",
      of: [
        {
          type: "object",
          name: "sizeVariant",
          fields: [
            { name: "size", title: "Size (e.g. 250ml, 500ml, 1L)", type: "string" },
            { name: "buyPrice", title: "Buy Price (PKR)", type: "number" },
            { name: "sellPrice", title: "Sell Price (PKR)", type: "number" },
            { name: "stock", title: "Current Stock (units)", type: "number" },
          ],
          preview: {
            select: { title: "size", subtitle: "sellPrice" },
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
    select: { title: "name", subtitle: "brand" },
  },
};
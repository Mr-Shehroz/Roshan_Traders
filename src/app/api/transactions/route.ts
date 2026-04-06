// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/sanity/lib/auth";
import { sanityClient } from "@/sanity/lib/client";

// GET transactions with optional filters
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type"); // IN | OUT
  const productType = req.nextUrl.searchParams.get("productType"); // beverage | dryGood

  let filter = `*[_type == "stockTransaction"`;
  const params: Record<string, string> = {};

  if (type) {
    filter += ` && transactionType == $type`;
    params.type = type;
  }
  if (productType) {
    filter += ` && productType == $productType`;
    params.productType = productType;
  }

  filter += `] | order(date desc) [0..99] {
    _id, productType, variantLabel, transactionType,
    quantity, pricePerUnit, totalAmount, date, notes,
    "productName": select(
      productType == "beverage" => productRef->name,
      productType == "dryGood" => dryGoodRef->name
    )
  }`;

  const transactions = await sanityClient.fetch(filter, params);
  return NextResponse.json(transactions);
}

// POST create a new stock transaction and update product stock
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    productType,
    productId,
    variantLabel,
    transactionType,
    quantity,
    pricePerUnit,
    notes,
  } = body;

  if (!productId || !variantLabel || !transactionType || !quantity || !pricePerUnit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const totalAmount = quantity * pricePerUnit;

  // Build transaction doc
  const txDoc: any = {
    _type: "stockTransaction",
    productType,
    variantLabel,
    transactionType,
    quantity,
    pricePerUnit,
    totalAmount,
    notes: notes || "",
    date: new Date().toISOString(),
  };

  if (productType === "beverage") {
    txDoc.productRef = { _type: "reference", _ref: productId };
  } else {
    txDoc.dryGoodRef = { _type: "reference", _ref: productId };
  }

  // Create transaction record
  const tx = await sanityClient.create(txDoc);

  // Update stock on the product variant
  const product = await sanityClient.getDocument(productId) as any;
  if (product) {
    const updatedVariants = product.variants.map((v: any) => {
      if (v.weight === variantLabel || v.size === variantLabel) {
        const currentStock = v.stock || 0;
        const newStock =
          transactionType === "IN"
            ? currentStock + quantity
            : Math.max(0, currentStock - quantity);
        return { ...v, stock: newStock };
      }
      return v;
    });
    await sanityClient.patch(productId).set({ variants: updatedVariants }).commit();
  }

  return NextResponse.json(tx, { status: 201 });
}
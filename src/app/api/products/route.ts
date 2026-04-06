// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/sanity/lib/auth";
import { sanityClient } from "@/sanity/lib/client";

// GET all products of a type
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") || "beverage";
  const validTypes = ["beverage", "dryGood"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const products = await sanityClient.fetch(
    `*[_type == $type && isActive != false] | order(_createdAt desc) {
      _id, name, category, variants, unit, isActive, notes, brand
    }`,
    { type }
  );

  return NextResponse.json(products);
}

// POST create a new product
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, ...data } = body;

  const validTypes = ["beverage", "dryGood"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const doc = await sanityClient.create({ _type: type, ...data });
  return NextResponse.json(doc, { status: 201 });
}

// PATCH update a product
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const doc = await sanityClient.patch(id).set(updates).commit();
  return NextResponse.json(doc);
}

// DELETE (soft delete — set isActive = false)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const doc = await sanityClient.patch(id).set({ isActive: false }).commit();
  return NextResponse.json(doc);
}
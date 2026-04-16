import { NextRequest, NextResponse } from "next/server";
import { clickhouse } from "@/app/lib/clickhouse";
import { randomUUID } from "crypto";

// =======================
// GET → Fetch latest active employees
// =======================
export async function GET() {
  try {
    const result = await clickhouse.query({
      query: `
        SELECT *
        FROM employees
        WHERE deleted = 0
        ORDER BY created_at DESC
        LIMIT 1 BY id
      `,
      format: "JSONEachRow",
    });

    return NextResponse.json(await result.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// =======================
// POST → Create employee
// =======================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const id = randomUUID();

    await clickhouse.insert({
      table: "employees",
      values: [
        {
          id,
          name: body.name,
          email: body.email,
          salary: Number(body.salary),
          deleted: 0, // ✅ IMPORTANT
          created_at: new Date().toISOString(),
        },
      ],
      format: "JSONEachRow",
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// =======================
// PUT → Update employee (append-only)
// =======================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // 🔹 Fetch latest record
    const result = await clickhouse.query({
      query: `
        SELECT *
        FROM employees
        WHERE id = '${body.id}'
        ORDER BY created_at DESC
        LIMIT 1
      `,
      format: "JSONEachRow",
    });

    const [old] = await result.json();

    if (!old) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // 🔹 Insert updated version
    await clickhouse.insert({
      table: "employees",
      values: [
        {
          ...old,
          name: body.name ?? old.name,
          email: body.email ?? old.email,
          salary: Number(body.salary ?? old.salary),
          deleted: 0,
          created_at: new Date().toISOString(),
        },
      ],
      format: "JSONEachRow",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// =======================
// DELETE → Soft delete
// =======================
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await clickhouse.command({
      query: `
        ALTER TABLE employees
        DELETE WHERE id = '${body.id}'
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

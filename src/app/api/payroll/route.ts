import { NextRequest, NextResponse } from "next/server";
import { clickhouse } from "@/app/lib/clickhouse";
import { randomUUID } from "crypto";

// =======================
// GET → List payroll (latest records)
// =======================
export async function GET() {
  try {
    const result = await clickhouse.query({
      query: `
        SELECT *
        FROM payroll
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
// POST → Create payroll
// =======================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.employee_id) {
      return NextResponse.json(
        { error: "employee_id required" },
        { status: 400 },
      );
    }

    const base = Number(body.base_salary);
    const bonus = Number(body.bonus);
    const deductions = Number(body.deductions);

    const net = base + bonus - deductions;

    await clickhouse.insert({
      table: "payroll",
      values: [
        {
          id: randomUUID(),
          employee_id: body.employee_id,
          month: body.month,
          base_salary: base,
          bonus,
          deductions,
          net_salary: net,
          created_at: new Date().toISOString(),
        },
      ],
      format: "JSONEachRow",
    });

    return NextResponse.json({ success: true, net });
  } catch (error: any) {
    console.error("PAYROLL CREATE ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}

// =======================
// PUT → Update payroll (append-only)
// =======================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // 🔹 Get existing record
    const result = await clickhouse.query({
      query: `SELECT * FROM payroll WHERE id = '${body.id}' LIMIT 1`,
      format: "JSONEachRow",
    });

    const [old] = await result.json();

    if (!old) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }

    // 🔹 Update only allowed fields
    const bonus = body.bonus !== undefined ? Number(body.bonus) : old.bonus;
    const deductions =
      body.deductions !== undefined ? Number(body.deductions) : old.deductions;

    const net = old.base_salary + bonus - deductions;

    // 🔹 Insert updated record (append-only)
    await clickhouse.insert({
      table: "payroll",
      values: [
        {
          ...old,
          bonus,
          deductions,
          net_salary: net,
          created_at: new Date().toISOString(),
        },
      ],
      format: "JSONEachRow",
    });

    return NextResponse.json({ success: true, net });
  } catch (error: any) {
    console.error("PAYROLL UPDATE ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}

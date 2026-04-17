import { NextRequest, NextResponse } from "next/server";
import { clickhouse } from "@/app/lib/clickhouse";
import { randomUUID } from "crypto";
import config from "../../config/query.config.json";

const { format }: { format: any } = config;

export async function GET() {
  try {
    const result = await clickhouse.query({
      query: `SELECT * FROM payroll ORDER BY created_at DESC LIMIT 1 BY id`,
      format,
    });
    return NextResponse.json(await result.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, base_salary, month } = body;

    if (!employee_id) {
      return NextResponse.json(
        { error: "employee_id required" },
        { status: 400 },
      );
    }

    const [base, bonus, deductions] = [
      Number(base_salary),
      Number(body.bonus),
      Number(body.deductions),
    ];
    const net = base + bonus - deductions;

    await clickhouse.insert({
      table: "payroll",
      values: [
        {
          id: randomUUID(),
          employee_id,
          month,
          base_salary: base,
          bonus,
          deductions,
          net_salary: net,
          created_at: new Date().toISOString(),
        },
      ],
      format,
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, base_salary } = body;

    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = await clickhouse.query({
      query: `SELECT * FROM payroll WHERE id = '${id}' LIMIT 1`,
      format,
    });

    const [old]: any = await result.json();

    if (!old) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }

    const bonus = body.bonus !== undefined ? Number(body.bonus) : old.bonus;
    const deductions =
      body.deductions !== undefined ? Number(body.deductions) : old.deductions;

    const net = base_salary + bonus - deductions;

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
      format,
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

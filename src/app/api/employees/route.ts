import { NextRequest, NextResponse } from "next/server";
import { clickhouse } from "@/app/lib/clickhouse";
import { randomUUID } from "crypto";
import config from "../../config/query.config.json";

const { format }: { format: any } = config;

export async function GET() {
  try {
    const result = await clickhouse.query({
      query: `SELECT * FROM employees WHERE deleted = 0 ORDER BY created_at DESC LIMIT 1 BY id`,
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
    const id = randomUUID();
    const { name, email, salary } = body;

    await clickhouse.insert({
      table: "employees",
      values: [
        {
          id,
          name,
          email,
          salary: Number(salary),
          deleted: 0,
          created_at: new Date().toISOString(),
        },
      ],
      format,
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, salary, id } = body;

    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const result = await clickhouse.query({
      query: `ALTER TABLE employees UPDATE name = '${name}', email = '${email}', salary = '${salary}' WHERE id = '${id}'`,
      format,
    });

    await result.json();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    await clickhouse.command({
      query: `ALTER TABLE employees DELETE WHERE id = '${id}'`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

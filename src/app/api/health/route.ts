import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      version: process.env.APP_RELEASE ?? 'dev',
      uptime: Math.round(process.uptime()),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

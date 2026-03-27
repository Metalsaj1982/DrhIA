import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    return NextResponse.json({ success: true, count: user ? 1 : 0 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}

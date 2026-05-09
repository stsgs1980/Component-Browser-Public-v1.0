import { NextResponse } from 'next/server';
import { performFullScan } from '@/lib/scanner';

export async function POST() {
  try {
    const result = performFullScan();
    return NextResponse.json({
      success: true,
      stats: result.stats,
      scannedAt: result.scannedAt,
    });
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform scan' },
      { status: 500 }
    );
  }
}

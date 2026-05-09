import { NextRequest, NextResponse } from 'next/server';
import { performFullScan, getScanResult } from '@/lib/scanner';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const favorites = searchParams.get('favorites');
  const file = searchParams.get('file');

  try {
    // Use cached scan or perform new one
    let scanResult = getScanResult();
    if (!scanResult) {
      scanResult = performFullScan();
    }

    let components = scanResult.components;

    // Filter by single file
    if (file) {
      components = components.filter((c) => c.path === file);
      if (components.length === 0) {
        return NextResponse.json({ error: 'Component not found' }, { status: 404 });
      }
      return NextResponse.json({
        component: components[0],
        stats: scanResult.stats,
        scannedAt: scanResult.scannedAt,
      });
    }

    // Filter by category
    if (category) {
      components = components.filter((c) => c.category === category);
    }

    // Filter by favorites
    if (favorites) {
      const favSet = new Set(favorites.split(',').filter(Boolean));
      components = components.filter((c) => favSet.has(c.path));
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      components = components.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.file.toLowerCase().includes(q) ||
          c.source.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      components,
      stats: scanResult.stats,
      scannedAt: scanResult.scannedAt,
    });
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json(
      { error: 'Failed to scan components' },
      { status: 500 }
    );
  }
}

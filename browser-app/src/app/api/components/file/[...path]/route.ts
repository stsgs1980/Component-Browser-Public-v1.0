import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join('/');

    if (!filePath) {
      return NextResponse.json(
        { error: 'path parameter is required' },
        { status: 400 }
      );
    }

    const fullPath = path.join(
      process.cwd(),
      'download',
      'reusable_components',
      filePath
    );

    // Security check
    const componentsDir = path.join(
      process.cwd(),
      'download',
      'reusable_components'
    );
    if (!fullPath.startsWith(componentsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').length;

    return NextResponse.json({ content, lines, path: filePath });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

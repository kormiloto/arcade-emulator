import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch ROM: ${response.statusText}`, { status: response.status });
    }

    const headers = new Headers();
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    // Подолг кеш за да не се презема истата игра повеќе пати
    headers.set('Cache-Control', 'public, max-age=86400, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Error proxying ROM:', error);
    return new NextResponse('Error fetching ROM', { status: 500 });
  }
}

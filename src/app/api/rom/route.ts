import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch ROM: ${response.statusText}`, { status: response.status });
    }

    // Forward the content type and other headers
    const headers = new Headers();
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    // Set cache control for performance
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Error proxying ROM:', error);
    return new NextResponse('Error fetching ROM', { status: 500 });
  }
}

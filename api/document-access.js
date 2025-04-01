export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('id');
  const userToken = request.headers.get('authorization');

  if (!documentId || !userToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Mock document access check
  const mockDocuments = {
    'agm-2024': { name: 'AGM Minutes 2024', access: ['owner', 'committee'] },
    'financials-q1': { name: 'Q1 Financial Report', access: ['committee'] },
    'bylaws': { name: 'Building Bylaws', access: ['owner', 'committee', 'tenant'] }
  };

  const document = mockDocuments[documentId];
  if (!document) {
    return new Response('Document not found', { status: 404 });
  }

  // Mock token validation (in real app, would verify JWT)
  const userRole = userToken.split(' ')[1] || 'guest';
  
  if (!document.access.includes(userRole)) {
    return new Response('Access denied', { status: 403 });
  }

  return new Response(JSON.stringify({
    document,
    accessGranted: true,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, no-cache'
    }
  });
}

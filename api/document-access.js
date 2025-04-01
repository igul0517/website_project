export const config = {
  runtime: 'edge',
  api: {
    bodyParser: false
  }
};

// Mock document database
const mockDocuments = {
  'agm-2024': {
    id: 'agm-2024',
    name: 'AGM Minutes 2024',
    access: ['owner', 'committee'],
    type: 'minutes',
    size: 245678,
    created: '2024-03-15T10:00:00Z',
    modified: '2024-03-15T10:00:00Z',
    tags: ['meeting', 'agm', '2024']
  },
  'financials-q1': {
    id: 'financials-q1',
    name: 'Q1 Financial Report',
    access: ['committee'],
    type: 'financial',
    size: 567890,
    created: '2024-04-01T09:00:00Z',
    modified: '2024-04-01T09:00:00Z',
    tags: ['financial', 'quarterly', '2024', 'q1']
  },
  'bylaws': {
    id: 'bylaws',
    name: 'Building Bylaws',
    access: ['owner', 'committee', 'tenant'],
    type: 'legal',
    size: 123456,
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    tags: ['legal', 'bylaws', 'rules']
  }
};

// Role hierarchy for access control
const roleHierarchy = {
  admin: ['admin', 'committee', 'owner', 'tenant', 'guest'],
  committee: ['committee', 'owner', 'tenant', 'guest'],
  owner: ['owner', 'tenant', 'guest'],
  tenant: ['tenant', 'guest'],
  guest: ['guest']
};

// Validate JWT token and extract role
const validateToken = (token) => {
  if (!token) return null;
  
  // Remove 'Bearer ' prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  try {
    // In a real app, verify JWT signature here
    // For demo, we'll just parse the role from the token
    const [role] = cleanToken.split('.');
    return roleHierarchy[role] ? role : null;
  } catch {
    return null;
  }
};

// Check if user has access to document
const hasAccess = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles || !requiredRoles.length) return false;
  const allowedRoles = roleHierarchy[userRole] || [];
  return requiredRoles.some(role => allowedRoles.includes(role));
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const userToken = request.headers.get('authorization');

    // Validate request
    if (!documentId) {
      return new Response(JSON.stringify({
        error: 'Document ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const userRole = validateToken(userToken);
    if (!userRole) {
      return new Response(JSON.stringify({
        error: 'Invalid or missing authorization token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get document
    const document = mockDocuments[documentId];
    if (!document) {
      return new Response(JSON.stringify({
        error: 'Document not found',
        documentId
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check access
    if (!hasAccess(userRole, document.access)) {
      return new Response(JSON.stringify({
        error: 'Access denied',
        requiredRoles: document.access,
        userRole
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Success response
    return new Response(JSON.stringify({
      document: {
        ...document,
        content: `Mock content for ${document.name}` // In real app, fetch from storage
      },
      accessGranted: true,
      userRole,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Document access error:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

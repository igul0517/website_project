export const config = {
  runtime: 'edge',
  api: {
    bodyParser: false
  }
};

// Mock database of maintenance providers
const mockProviders = [
  {
    id: 'sp001',
    name: 'Sydney Plumbers',
    location: 'Sydney',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    services: ['plumbing', 'drainage', 'gas'],
    rating: 4.8,
    reviews: 156,
    availability: '24/7',
    emergencyResponse: true,
    contactInfo: {
      phone: '1300 123 456',
      email: 'service@sydneyplumbers.com.au'
    },
    certifications: ['Licensed Plumber', 'Gas Fitter']
  },
  {
    id: 'mm001',
    name: 'Melbourne Maintenance',
    location: 'Melbourne',
    coordinates: { lat: -37.8136, lng: 144.9631 },
    services: ['electrical', 'plumbing', 'general'],
    rating: 4.6,
    reviews: 98,
    availability: 'Mon-Sun 6am-10pm',
    emergencyResponse: true,
    contactInfo: {
      phone: '1300 234 567',
      email: 'help@melbmaintenance.com.au'
    },
    certifications: ['Licensed Electrician', 'Licensed Plumber']
  },
  {
    id: 'bs001',
    name: 'Brisbane Services',
    location: 'Brisbane',
    coordinates: { lat: -27.4698, lng: 153.0251 },
    services: ['general', 'carpentry', 'painting'],
    rating: 4.7,
    reviews: 72,
    availability: 'Mon-Sat 7am-6pm',
    emergencyResponse: false,
    contactInfo: {
      phone: '1300 345 678',
      email: 'bookings@brisbaneservices.com.au'
    },
    certifications: ['Licensed Builder']
  },
  {
    id: 'gm001',
    name: 'Gold Coast Maintenance',
    location: 'Gold Coast',
    coordinates: { lat: -28.0167, lng: 153.4000 },
    services: ['electrical', 'air-conditioning', 'general'],
    rating: 4.5,
    reviews: 45,
    availability: 'Mon-Fri 8am-5pm',
    emergencyResponse: true,
    contactInfo: {
      phone: '1300 456 789',
      email: 'service@gcmaintenance.com.au'
    },
    certifications: ['Licensed Electrician', 'HVAC Certified']
  }
];

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
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

    // Get parameters from URL
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const emergency = searchParams.get('emergency') === 'true';
    const userLat = parseFloat(searchParams.get('lat'));
    const userLng = parseFloat(searchParams.get('lng'));

    // Get user's location from request headers if coordinates not provided
    const userLocation = request.headers.get('x-vercel-ip-city') || 'Sydney';
    
    // Filter and sort providers
    let providers = [...mockProviders];

    // Filter by service if specified
    if (service) {
      providers = providers.filter(p => p.services.includes(service));
    }

    // Filter by emergency availability if required
    if (emergency) {
      providers = providers.filter(p => p.emergencyResponse);
    }

    // Calculate distances if coordinates provided
    if (!isNaN(userLat) && !isNaN(userLng)) {
      providers = providers.map(p => ({
        ...p,
        distance: calculateDistance(
          userLat,
          userLng,
          p.coordinates.lat,
          p.coordinates.lng
        )
      }));
    }

    // Sort by distance or rating
    providers.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return b.rating - a.rating;
    });

    // Take top 3 providers
    const nearestProviders = providers.slice(0, 3).map(p => ({
      ...p,
      distance: p.distance ? Math.round(p.distance * 10) / 10 : null
    }));

    return new Response(JSON.stringify({
      success: true,
      userLocation,
      coordinates: !isNaN(userLat) && !isNaN(userLng) ? { lat: userLat, lng: userLng } : null,
      filters: {
        service,
        emergency
      },
      providers: nearestProviders,
      totalProviders: providers.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Maintenance provider error:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

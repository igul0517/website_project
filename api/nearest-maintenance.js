export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  // Get user's location from request headers
  const userLocation = request.headers.get('x-vercel-ip-city') || 'Sydney';
  
  // Mock database of maintenance providers
  const providers = [
    { name: 'Sydney Plumbers', location: 'Sydney', distance: 0 },
    { name: 'Melbourne Maintenance', location: 'Melbourne', distance: 880 },
    { name: 'Brisbane Services', location: 'Brisbane', distance: 920 }
  ];
  
  // Find nearest providers
  const nearestProviders = providers
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return new Response(JSON.stringify({
    userLocation,
    providers: nearestProviders
  }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}

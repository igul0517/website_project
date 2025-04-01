export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const data = await request.json();
  const { unitSize, buildingAge, facilities } = data;

  // Quick calculation based on unit size and building age
  const baseLevy = unitSize * 2.5;
  const ageMultiplier = Math.max(1, buildingAge / 10);
  const facilitiesMultiplier = facilities ? facilities.length * 0.1 : 0;

  const quarterlyLevy = baseLevy * ageMultiplier * (1 + facilitiesMultiplier);

  return new Response(JSON.stringify({
    quarterlyLevy: Math.round(quarterlyLevy * 100) / 100,
    breakdown: {
      base: baseLevy,
      ageAdjustment: ageMultiplier,
      facilitiesAdjustment: facilitiesMultiplier
    }
  }), {
    headers: {
      'content-type': 'application/json'
    }
  });
}

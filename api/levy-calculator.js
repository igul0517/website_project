export const config = {
  runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '16kb'
    }
  }
};

// Constants for levy calculation
const RATES = {
  BASE_RATE: 2.5, // Base rate per square meter
  MIN_LEVY: 500, // Minimum quarterly levy
  MAX_LEVY: 5000, // Maximum quarterly levy
  FACILITY_RATES: {
    pool: 0.15,
    gym: 0.12,
    sauna: 0.08,
    tennis: 0.10,
    bbq: 0.05,
    garden: 0.07,
    parking: 0.06,
    security: 0.08,
    elevator: 0.10,
    storage: 0.04
  }
};

// Validation helpers
const validateInput = (data) => {
  const errors = [];
  
  // Validate unit size
  if (!data.unitSize) {
    errors.push('Unit size is required');
  } else if (typeof data.unitSize !== 'number' || data.unitSize <= 0 || data.unitSize > 1000) {
    errors.push('Unit size must be a positive number between 1 and 1000 square meters');
  }

  // Validate building age
  if (!data.buildingAge && data.buildingAge !== 0) {
    errors.push('Building age is required');
  } else if (typeof data.buildingAge !== 'number' || data.buildingAge < 0 || data.buildingAge > 200) {
    errors.push('Building age must be a number between 0 and 200 years');
  }

  // Validate facilities
  if (data.facilities) {
    if (!Array.isArray(data.facilities)) {
      errors.push('Facilities must be an array');
    } else {
      const validFacilities = Object.keys(RATES.FACILITY_RATES);
      const invalidFacilities = data.facilities.filter(f => !validFacilities.includes(f));
      if (invalidFacilities.length > 0) {
        errors.push(`Invalid facilities: ${invalidFacilities.join(', ')}`);
      }
    }
  }

  return errors;
};

// Calculate age multiplier with depreciation curve
const calculateAgeMultiplier = (age) => {
  // Exponential depreciation curve that increases maintenance costs with age
  const baseMultiplier = 1 + Math.log10(age + 1) * 0.5;
  return Math.max(1, Math.min(2.5, baseMultiplier));
};

// Calculate facilities impact
const calculateFacilitiesMultiplier = (facilities = []) => {
  return facilities.reduce((total, facility) => {
    return total + (RATES.FACILITY_RATES[facility] || 0);
  }, 1);
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const data = await request.json();
    
    // Validate input
    const validationErrors = validateInput(data);
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        errors: validationErrors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { unitSize, buildingAge, facilities = [] } = data;

    // Calculate components
    const baseLevy = unitSize * RATES.BASE_RATE;
    const ageMultiplier = calculateAgeMultiplier(buildingAge);
    const facilitiesMultiplier = calculateFacilitiesMultiplier(facilities);

    // Calculate final levy
    let quarterlyLevy = baseLevy * ageMultiplier * facilitiesMultiplier;

    // Apply min/max bounds
    quarterlyLevy = Math.max(RATES.MIN_LEVY, Math.min(RATES.MAX_LEVY, quarterlyLevy));

    // Calculate individual facility costs
    const facilityCosts = facilities.reduce((costs, facility) => {
      costs[facility] = baseLevy * RATES.FACILITY_RATES[facility];
      return costs;
    }, {});

    return new Response(JSON.stringify({
      success: true,
      quarterlyLevy: Math.round(quarterlyLevy * 100) / 100,
      annualLevy: Math.round(quarterlyLevy * 4 * 100) / 100,
      breakdown: {
        baseLevy: Math.round(baseLevy * 100) / 100,
        ageMultiplier: Math.round(ageMultiplier * 1000) / 1000,
        facilitiesMultiplier: Math.round(facilitiesMultiplier * 1000) / 1000,
        facilityCosts,
        appliedRates: {
          baseRate: RATES.BASE_RATE,
          selectedFacilities: facilities.map(f => ({
            name: f,
            rate: RATES.FACILITY_RATES[f]
          }))
        }
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        minLevy: RATES.MIN_LEVY,
        maxLevy: RATES.MAX_LEVY
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Levy calculation error:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

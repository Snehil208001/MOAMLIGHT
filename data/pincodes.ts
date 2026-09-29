export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  daysToDeliver: string;
  codAvailable: boolean;
  freeExpressEligible: boolean;
}

export const PINCODE_DIRECTORY: Record<string, PincodeInfo> = {
  // Bengaluru (Local fulfillment hub - Fastest)
  '560001': { pincode: '560001', city: 'Bengaluru (Central)', state: 'Karnataka', daysToDeliver: '1–2 days', codAvailable: true, freeExpressEligible: true },
  '560038': { pincode: '560038', city: 'Bengaluru (Indiranagar)', state: 'Karnataka', daysToDeliver: '1–2 days', codAvailable: true, freeExpressEligible: true },
  '560034': { pincode: '560034', city: 'Bengaluru (Koramangala)', state: 'Karnataka', daysToDeliver: '1–2 days', codAvailable: true, freeExpressEligible: true },
  '560100': { pincode: '560100', city: 'Bengaluru (Electronic City)', state: 'Karnataka', daysToDeliver: '1–2 days', codAvailable: true, freeExpressEligible: true },
  '560068': { pincode: '560068', city: 'Bengaluru (BTM/HSR)', state: 'Karnataka', daysToDeliver: '1–2 days', codAvailable: true, freeExpressEligible: true },

  // Mumbai & MMR
  '400001': { pincode: '400001', city: 'Mumbai (Fort)', state: 'Maharashtra', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '400050': { pincode: '400050', city: 'Mumbai (Bandra)', state: 'Maharashtra', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '400076': { pincode: '400076', city: 'Mumbai (Powai)', state: 'Maharashtra', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '400053': { pincode: '400053', city: 'Mumbai (Andheri West)', state: 'Maharashtra', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },

  // Delhi NCR
  '110001': { pincode: '110001', city: 'New Delhi (Connaught Place)', state: 'Delhi', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '110016': { pincode: '110016', city: 'New Delhi (Hauz Khas)', state: 'Delhi', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '122001': { pincode: '122001', city: 'Gurugram', state: 'Haryana', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '201301': { pincode: '201301', city: 'Noida', state: 'Uttar Pradesh', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },

  // Pune
  '411001': { pincode: '411001', city: 'Pune (Camp)', state: 'Maharashtra', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '411038': { pincode: '411038', city: 'Pune (Kothrud)', state: 'Maharashtra', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },

  // Hyderabad
  '500001': { pincode: '500001', city: 'Hyderabad (Abids)', state: 'Telangana', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '500081': { pincode: '500081', city: 'Hyderabad (Hitec City)', state: 'Telangana', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },

  // Chennai
  '600001': { pincode: '600001', city: 'Chennai (George Town)', state: 'Tamil Nadu', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },
  '600028': { pincode: '600028', city: 'Chennai (R.A. Puram)', state: 'Tamil Nadu', daysToDeliver: '2–3 days', codAvailable: true, freeExpressEligible: true },

  // Kolkata
  '700001': { pincode: '700001', city: 'Kolkata (BBD Bagh)', state: 'West Bengal', daysToDeliver: '3–4 days', codAvailable: true, freeExpressEligible: true },
  '700029': { pincode: '700029', city: 'Kolkata (Ballygunge)', state: 'West Bengal', daysToDeliver: '3–4 days', codAvailable: true, freeExpressEligible: true },
};

/**
 * Checks serviceability for an Indian 6-digit postal pincode.
 */
export function estimatePincodeDelivery(pincode: string): PincodeInfo | null {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return null;
  }

  // Exact match
  if (PINCODE_DIRECTORY[cleanPin]) {
    return PINCODE_DIRECTORY[cleanPin];
  }

  // Prefix matching for Indian postal circles
  const firstDigit = cleanPin[0];
  let estimatedRegion = 'India';
  let days = '3–5 days';

  if (firstDigit === '5') {
    estimatedRegion = 'Southern Region (KA, AP, TS)';
    days = '2–3 days';
  } else if (firstDigit === '4') {
    estimatedRegion = 'Western Region (MH, GA)';
    days = '2–4 days';
  } else if (firstDigit === '1' || firstDigit === '2') {
    estimatedRegion = 'Northern Region (DL, HR, UP, PB)';
    days = '3–4 days';
  } else if (firstDigit === '6') {
    estimatedRegion = 'Southern Region (TN, KL)';
    days = '2–3 days';
  } else if (firstDigit === '7' || firstDigit === '8') {
    estimatedRegion = 'Eastern & North-East Region';
    days = '4–5 days';
  } else if (firstDigit === '3') {
    estimatedRegion = 'Western Region (GJ, RJ)';
    days = '3–4 days';
  }

  return {
    pincode: cleanPin,
    city: estimatedRegion,
    state: 'India',
    daysToDeliver: days,
    codAvailable: true,
    freeExpressEligible: true,
  };
}

// =============================================================================
// UtsavOps AI — Vendor Quote & Comparison Defaults
// =============================================================================

import type { VendorQuote, QuoteComparisonResult } from '../types/event';

export const DEFAULT_VENDOR_QUOTES: VendorQuote[] = [
  {
    id: 'q1',
    vendorName: 'Spice Garden Caterers',
    category: 'Catering',
    rawText: `Dear Client,\n\nThank you for inquiring. We are pleased to offer the following:\n- North Indian + South Indian buffet\n- Rate: ₹1,150 per plate\n- Minimum guarantee: 150 pax\n- Setup & cleanup included\n- Serving staff: 15 persons\n\nNote: Gas & generator charges extra. Dessert counter @ ₹150/head additional.\n\nRegards,\nSpice Garden Caterers`,
    extractedPrice: 172500,
    guestsCovered: 150,
    hiddenCharges: [
      'Gas & generator charges (unspecified amount)',
      'Dessert counter: ₹150/head extra (₹22,500 additional for 150 guests)',
    ],
    missingInfo: [
      'Service tax / GST percentage',
      'Exact rate for guests above 150',
      'Cancellation policy and refund terms',
      'Food tasting session included?',
    ],
    questionsToAsk: [
      'What are the exact generator and gas charges?',
      'Is the ₹1,150 per head rate valid for all 200 of our guests?',
      'What is your cancellation and refund policy?',
      'Can we schedule a food tasting session before finalising?',
      'Do you provide hygiene certificates for your food handlers?',
    ],
  },
];

export const SAMPLE_CATERING_QUOTES = [
  {
    id: 'sample-quote-1',
    vendorName: 'Royal Rasoi Banquets & Catering',
    rawText: `QUOTATION FOR WEDDING RECEPTION
From: Royal Rasoi Banquets & Outdoor Catering
Date: 12-Nov-2026
Client: Sharma-Mehta Wedding (200 Expected Guests)

Package: Premium North Indian & Marwari Vegetarian Spread
- Rate: ₹1,150 per plate (Minimum Guarantee: 200 Guests)
- Total Base Estimate: ₹2,30,000

Included Menu Items:
- Welcome Drinks: 2 Fresh Mocktails + Spiced Thandai
- Starters: Paneer Tikka, Dahi ke Kebab, Hara Bhara Kebab, Crispy Corn
- Live Counter: Chaat Bazaar (Pani Puri, Papdi Chaat, Sev Puri)
- Main Course: Dal Makhani, Paneer Lababdar, Dum Aloo Kashmiri, Pulao, Assorted Breads
- Desserts: Gulab Jamun, Moong Dal Halwa, Kulfi Falooda

Commercial Terms & Exclusions:
1. Gas cylinder & tandoor coal charges extra @ ₹4,500 total.
2. Mineral water 250ml bottles and ice cubes billed on actual consumption.
3. Uniformed serving staff: 14 boys included. Extra boys @ ₹800/shift.
4. Overtime fee applies @ ₹350/boy/hr beyond 11:30 PM.
5. GST 18% extra if formal GST invoice is required.
6. Advance: 40% on booking, 50% one week prior, 10% after function.
7. Food tasting session provided for up to 3 persons at our commercial kitchen.`,
  },
  {
    id: 'sample-quote-2',
    vendorName: 'Grand Annapurna Gourmet Caterers',
    rawText: `GRAND ANNAPURNA CATERING ESTIMATE
Prepared for: Sharma-Mehta Wedding (Headcount: 200 Pax)
Event Date: February 2027

Package: Multi-Cuisine Deluxe Wedding Banquet
- Tariff: ₹1,350 per head
- Base Calculation: 200 Guests x ₹1,350 = ₹2,70,000

Menu Highlights:
- 4 Welcome Beverages & Fresh Fruit Mocktail Station
- 5 Appetizers (Including Tandoori Soya Chaap & Chinese Spring Rolls)
- 2 Live Thematic Counters: Street Chaat Counter + Wood-Fired Live Pizza Counter
- Extensive Main Course: 3 Paneer & Vegetable Specialties, 2 Dals, Biryani, Jeera Rice, Roti basket
- Dessert Extravaganza: 4 Desserts including Live Jalebi-Rabdi & Ice Cream Parlour

Important Notes & Extra Levies:
- Mandatory Generator Backup for live heating counters: ₹8,000 additional.
- Bone china premium crockery & imported cutlery handling charge: ₹40 per guest (₹8,000 total).
- 5% service charge added to final billing.
- Outstation transport & logistical haulage: ₹6,500.
- Tasting session charged at ₹2,500 (adjusted against final billing if confirmed).
- Payment terms: 50% non-refundable advance to block wedding dates.`,
  },
];

export const DEFAULT_QUOTE_COMPARISON: QuoteComparisonResult = {
  category: 'Catering & Food',
  allocatedBudget: 240000,
  recommendation: 'Royal Rasoi is strongly recommended over Grand Annapurna. At ₹2,30,000, it stays ₹10,000 within your ₹2,40,000 budget, offers 14 dedicated servers, and includes complimentary food tasting. However, you must negotiate a cap on ice/water charges and clarify the 18% GST clause before signing.',
  quotes: [
    {
      id: 'sample-quote-1',
      vendorName: 'Royal Rasoi Banquets & Catering',
      category: 'Catering',
      baseCost: 230000,
      perUnitCost: 1150,
      unitLabel: 'per plate',
      guestsCovered: 200,
      hiddenCharges: [
        'Gas cylinder & tandoor charcoal surcharge: ₹4,500 flat extra',
        'Mineral water bottles & ice cubes billed on actual consumption (unspecified rate)',
        'GST 18% extra if formal tax invoice is required (potential +₹41,400 liability)',
        'Staff overtime penalty @ ₹350/boy/hr beyond 11:30 PM',
      ],
      exclusions: [
        'Extra serving boys beyond 14 charged at ₹800/shift',
        'Food tasting limited to 3 persons only',
      ],
      budgetAlignment: {
        allocatedBudget: 240000,
        difference: -10000,
        status: 'within-budget',
        summary: 'Within allocated budget by ₹10,000 (Base: ₹2.30L vs Allocated: ₹2.40L). Buffer will absorb gas & water costs.',
      },
      whatsappQuestions: [
        'Can you bundle the ₹4,500 gas and charcoal charges into the ₹1,150 per-plate rate without extra billing?',
        'What is your exact per-case price for sealed mineral water and food-grade ice cubes to prevent billing surprises?',
        'Will you include full GST in the ₹1,150 quoted price, or will 18% be levied on the final settlement?',
        'Can we lock the overtime cutoff time to 12:30 AM midnight instead of 11:30 PM given late night baraat muhurats?',
      ],
      rawText: SAMPLE_CATERING_QUOTES[0].rawText,
    },
    {
      id: 'sample-quote-2',
      vendorName: 'Grand Annapurna Gourmet Caterers',
      category: 'Catering',
      baseCost: 270000,
      perUnitCost: 1350,
      unitLabel: 'per plate',
      guestsCovered: 200,
      hiddenCharges: [
        'Mandatory generator backup fuel fee: ₹8,000 extra',
        'Bone china crockery & cutlery fee @ ₹40/guest (₹8,000 total)',
        'Mandatory 5% service charge added on final invoice (+₹13,500)',
        'Logistical transport surcharge: ₹6,500',
      ],
      exclusions: [
        'Tasting session requires ₹2,500 upfront payment',
        '50% booking advance is strictly non-refundable with zero cancellation tolerance',
      ],
      budgetAlignment: {
        allocatedBudget: 240000,
        difference: 30000,
        status: 'over-budget',
        summary: 'Exceeds allocated budget by ₹30,000 (+12.5%). Hidden levies (generator, crockery, 5% fee) will push true total past ₹3,06,000.',
      },
      whatsappQuestions: [
        'Your base estimate is ₹30,000 over our ₹2.40L budget — can you match ₹1,200/plate if we drop the live pizza counter?',
        'Why are generator fuel (₹8,000) and cutlery (₹8,000) billed separately instead of being included in standard catering operations?',
        'Can the mandatory 5% service charge be waived completely for an upfront 50% commitment?',
        'What happens to our 50% advance if event dates need rescheduling due to family or venue conflicts?',
      ],
      rawText: SAMPLE_CATERING_QUOTES[1].rawText,
    },
  ],
};

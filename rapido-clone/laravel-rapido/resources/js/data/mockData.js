export const VEHICLES = [
  {
    id: 'bike',
    name: 'Sawaari Bike',
    tagline: 'Beat the traffic, fastest ride in the city',
    basePrice: 25,
    perKmRate: 7,
    eta: '2 mins away',
    icon: 'Bike',
    capacity: 1,
    tag: 'Fastest & Pocket Friendly',
    color: '#F9C933'
  },
  {
    id: 'auto',
    name: 'Sawaari Auto',
    tagline: 'Doorstep pickup with zero haggling & meter charges',
    basePrice: 40,
    perKmRate: 11,
    eta: '4 mins away',
    icon: 'Zap',
    capacity: 3,
    tag: 'Guaranteed Pickup',
    color: '#10B981'
  },
  {
    id: 'cab_economy',
    name: 'Sawaari Cab Economy',
    tagline: 'Affordable AC hatchback rides for daily commute',
    basePrice: 70,
    perKmRate: 14,
    eta: '6 mins away',
    icon: 'Car',
    capacity: 4,
    tag: 'Best for Small Groups',
    color: '#3B82F6'
  },
  {
    id: 'cab_premium',
    name: 'Sawaari Comfort Sedan',
    tagline: 'Top-rated captains, spacious cars, extra legroom',
    basePrice: 110,
    perKmRate: 18,
    eta: '8 mins away',
    icon: 'ShieldCheck',
    capacity: 4,
    tag: 'Premium Ride',
    color: '#8B5CF6'
  },
  {
    id: 'parcel',
    name: 'Sawaari Parcel / Express',
    tagline: 'Send packages, food, medicines & keys safely across town',
    basePrice: 35,
    perKmRate: 8,
    eta: '3 mins away',
    icon: 'Package',
    capacity: 'Up to 5kg',
    tag: 'Door-to-Door Delivery',
    color: '#EC4899'
  }
];

export const POPULAR_LOCATIONS = [
  'Indiranagar Metro Station, Bangalore',
  'Koramangala 5th Block, Bangalore',
  'MG Road, Trinity Metro, Bangalore',
  'HSR Layout Sector 2, Bangalore',
  'Whitefield ITPL Main Gate, Bangalore',
  'Electronic City Phase 1, Bangalore',
  'Kempegowda International Airport (BLR)'
];

export const IMPACT_STATS = [
  { value: '100M+', label: 'Happy Commuters', description: 'Across 100+ cities in Bharat' },
  { value: '1.5M+', label: 'Captains Onboarded', description: 'Earning with dignity and freedom' },
  { value: '150+', label: 'Tier 1, 2 & 3 Cities', description: 'Connecting remote corners to metros' },
  { value: '4.8 ★', label: 'Average User Rating', description: 'On Play Store & App Store' }
];

export const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    role: 'Product Manager, Bangalore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    comment: 'Sawaari Bike has cut my daily commute from 1 hour to just 22 minutes! It saves me huge money and headache in Bangalore traffic.',
    rating: 5,
    rideType: 'Sawaari Bike'
  },
  {
    name: 'Pooja Verma',
    role: 'Digital Marketer, Pune',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    comment: 'Zero bargaining for autos! Booking on the website or app gives transparent meter fares and door-to-door safety. Truly a game changer.',
    rating: 5,
    rideType: 'Sawaari Auto'
  },
  {
    name: 'Amit Patel',
    role: 'Sawaari Captain, Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    comment: 'Being a Sawaari Captain helped me pay off my bike loan while having full flexibility over my work hours. Daily instant payouts are awesome.',
    rating: 5,
    rideType: 'Captain Partner'
  }
];

export const FAQS = [
  {
    q: 'How does booking a ride through Sawaari work?',
    a: 'Simply enter your pickup and destination, pick your ride preference (Bike, Auto, or Cab), review the guaranteed fare, and click "Book Now". We will instantly match you with the nearest captain within 2 minutes.'
  },
  {
    q: 'How does Sawaari calculate trip fares?',
    a: 'Fares are calculated based on base fare, total travel distance, and estimated travel time. We maintain upfront, transparent pricing without hidden surge surprises.'
  },
  {
    q: 'What safety features are provided for women riders?',
    a: 'We have 24/7 dedicated safety support, SOS emergency button linking straight to local authorities & your emergency contacts, dual-masked phone calls, live trip tracking shareable via WhatsApp, and thoroughly background-checked captains.'
  },
  {
    q: 'How can I register as a Sawaari Captain / Driver?',
    a: 'Go to our Sign Up page, select "Captain (Driver)", fill in your vehicle and license details, and complete document verification. You can start taking rides and earning within 24 hours.'
  },
  {
    q: 'What payment modes are accepted?',
    a: 'We accept Cash, UPI (Google Pay, PhonePe, Paytm), Net Banking, Debit/Credit Cards, and Sawaari Wallet.'
  }
];

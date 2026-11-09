// Structured data (JSON-LD) for Google's review stars under each page's search result.
// Google doesn't show stars for a business reviewing itself (LocalBusiness/Organization), but it
// does for a Product with prices, so each page describes its own service as a Product with the
// Google rating and a few of the reviews shown on the page. Keep prices in step with the pages.
import { REVIEWS, REVIEW_COUNT } from './reviews.js';
import { SITE, SOCIALS } from '../site.js';

const SERVICES = {
  home: { name: 'FordFit Personal Training', description: 'Personal training in Long Stratton and Wymondham, at home with a mobile gym, or online through the FordFit app.', low: 20, high: 280, offers: 6 },
  inPerson: { name: 'FordFit In-Person Personal Training', description: '1-to-1 personal training at Long Stratton Leisure Centre and NR Fitness in Wymondham: £45 pay as you go, or monthly packages from £160.', low: 45, high: 280, offers: 3 },
  longStratton: { name: 'FordFit Personal Training – Long Stratton', description: '1-to-1 personal training at Long Stratton Leisure Centre: £45 pay as you go, or monthly packages from £160.', low: 45, high: 280, offers: 3 },
  wymondham: { name: 'FordFit Personal Training – Wymondham', description: '1-to-1 personal training at NR Fitness in Wymondham: £45 pay as you go, or monthly packages from £160.', low: 45, high: 280, offers: 3 },
  homeMobile: { name: 'FordFit Home & Mobile Personal Training', description: 'Personal training at your home with a fully equipped mobile gym, from £50 a session.', low: 50, offers: 1 },
  online: { name: 'FordFit Online Coaching', description: 'Online coaching through the FordFit app: Basic £20 a month with no set-up fee, Elite £120 a month.', low: 20, high: 120, offers: 2 },
};

// Home page only: who the business is. No review markup here (Google treats a business rating
// itself as self-serving). No street address: Toby trains clients at the two gyms, at home and
// online, so the business is described by the areas it serves.
export function businessSchema(site) {
  const id = new URL('/#business', site).href;
  return [
    {
      '@type': ['ProfessionalService', 'LocalBusiness'],
      '@id': id,
      name: SITE.name,
      legalName: 'Fordfit Personal Training Ltd',
      url: new URL('/', site).href,
      logo: new URL('/assets/img/fordfit-icon-600.png', site).href,
      image: new URL('/assets/img/og-default.jpg', site).href,
      description: SERVICES.home.description,
      telephone: '+447495141804',
      email: SITE.email,
      priceRange: '££',
      areaServed: ['Long Stratton', 'Wymondham', 'Norwich', 'Norfolk'].map((name) => ({ '@type': 'Place', name })),
      founder: { '@type': 'Person', name: 'Toby Forder', jobTitle: 'Founder and Personal Trainer' },
      sameAs: SOCIALS.map((s) => s.href),
    },
    {
      '@type': 'WebSite',
      '@id': new URL('/#website', site).href,
      url: new URL('/', site).href,
      name: SITE.name,
      publisher: { '@id': id },
      inLanguage: 'en-GB',
    },
  ];
}

export function breadcrumbSchema(crumbs, site) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: new URL(c.href, site).href })),
  };
}

export function productSchema(key, url) {
  const s = SERVICES[key] ?? SERVICES.home;
  const offer = s.high
    ? { '@type': 'AggregateOffer', priceCurrency: 'GBP', lowPrice: s.low, highPrice: s.high, offerCount: s.offers }
    : { '@type': 'Offer', priceCurrency: 'GBP', price: s.low };
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.name,
    description: s.description,
    image: new URL('/assets/img/toby-forder.webp', url).href,
    url: url.href,
    brand: { '@type': 'Brand', name: SITE.name },
    offers: { ...offer, availability: 'https://schema.org/InStock', url: url.href },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: 5, bestRating: 5, worstRating: 1, reviewCount: REVIEW_COUNT },
    review: REVIEWS.slice(0, 3).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
    })),
  };
}

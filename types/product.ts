export type ScentCategory = 
  | 'Woody & Meditative'
  | 'Floral & Nocturnal'
  | 'Spiced & Gourmand'
  | 'Fresh & Earthy';

export interface ScentPyramid {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  description: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  weightGrams: number;
  burnTimeHours: number;
  wicksCount: number;
  price: number;
  mrp: number;
  inStock: boolean;
  sku: string;
}

export interface CandleSpecs {
  waxType: string;
  wickType: string;
  vessel: string;
  dimensions: string;
  burnTime: string;
  origin: string;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
}

export interface ProductVideoSource {
  url: string;
  mimeType: string;
  format?: string;
  height?: number;
  width?: number;
}

export interface ProductVideo {
  id: string;
  previewUrl?: string;
  sources: ProductVideoSource[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: ScentCategory;
  mood: string;
  intensity: 'Subtle' | 'Moderate' | 'Intense';
  defaultPrice: number;
  defaultMrp: number;
  images: string[];
  videos?: ProductVideo[];
  rating: number;
  reviewsCount: number;
  bestseller: boolean;
  featured: boolean;
  scentPyramid: ScentPyramid;
  variants: ProductVariant[];
  specs: CandleSpecs;
  story: string;
  ritualGuide: {
    firstBurn: string;
    maintenance: string;
    safety: string;
    vesselReuse: string;
  };
  reviews: ProductReview[];
  pairsWithSlugs: string[];
}

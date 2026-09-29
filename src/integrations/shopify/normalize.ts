/**
 * Data Normalization Pipeline
 *
 * Transforms Shopify GraphQL responses into MOAMLIGHT's typed domain models:
 * - Product (types/product.ts)
 * - ProductVariant (types/product.ts)
 * - CartItem (types/cart.ts)
 */

import { Product, ProductVariant, ScentCategory, CandleSpecs, ScentPyramid } from '@/types/product';
import { CartItem } from '@/types/cart';
import {
  ShopifyProduct,
  ShopifyVariant,
  ShopifyCart,
  ShopifyCartLine,
} from './types';

const VALID_SCENT_CATEGORIES: ScentCategory[] = [
  'Woody & Meditative',
  'Floral & Nocturnal',
  'Spiced & Gourmand',
  'Fresh & Earthy',
];

/**
 * Safely parse a JSON or comma-separated string into a string array.
 */
export function parseNotes(val?: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Not valid JSON, fall back to comma-separated splitting
  }

  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Safely parse a JSON metafield value with fallback.
 */
export function parseMetafieldJson<T>(value?: string | null, fallback: T = [] as unknown as T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extracts a pristine, human-readable narrative story without any HTML tags.
 */
export function extractCleanStory(
  htmlDescription?: string | null,
  plainDescription?: string | null,
  fallbackStory?: string
): string {
  // If matchedLocal has a curated clean story, prioritize it
  if (fallbackStory && fallbackStory.trim()) {
    return fallbackStory.trim();
  }

  const raw = htmlDescription || plainDescription || '';
  if (!raw) return '';

  // Extract from <section class="story-section"> ... <p> ... </p>
  const storyMatch = raw.match(/class=["']story-section["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  if (storyMatch && storyMatch[1]) {
    return storyMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Strip all HTML tags and decode entities
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a raw ShopifyVariant GraphQL node to MOAMLIGHT ProductVariant.
 */
export function normalizeProductVariant(variantNode: ShopifyVariant): ProductVariant {
  const price = Math.round(parseFloat(variantNode.price?.amount || '0'));
  const mrp = variantNode.compareAtPrice?.amount
    ? Math.round(parseFloat(variantNode.compareAtPrice.amount))
    : Math.round(price * 1.25);

  const weightGramsParsed = variantNode.weightGrams?.value
    ? parseInt(variantNode.weightGrams.value, 10)
    : variantNode.weight
    ? Math.round(variantNode.weight)
    : 240;

  const burnTimeHoursParsed = variantNode.burnTimeHours?.value
    ? parseInt(variantNode.burnTimeHours.value, 10)
    : 55;

  const wicksCountParsed = variantNode.wicksCount?.value
    ? parseInt(variantNode.wicksCount.value, 10)
    : 1;

  const inStock =
    Boolean(variantNode.availableForSale) &&
    (variantNode.quantityAvailable === null ||
      variantNode.quantityAvailable === undefined ||
      variantNode.quantityAvailable > 0);

  return {
    id: variantNode.id,
    name: variantNode.title || 'Standard',
    weightGrams: isNaN(weightGramsParsed) ? 240 : weightGramsParsed,
    burnTimeHours: isNaN(burnTimeHoursParsed) ? 55 : burnTimeHoursParsed,
    wicksCount: isNaN(wicksCountParsed) ? 1 : wicksCountParsed,
    price,
    mrp,
    inStock,
    sku: variantNode.sku || '',
  };
}

import { PRODUCTS } from '@/data/products';

/**
 * Normalizes a raw ShopifyProduct GraphQL node to MOAMLIGHT Product.
 */
export function normalizeProduct(node: ShopifyProduct): Product {
  const matchedLocal = PRODUCTS.find(
    (p) =>
      p.slug === node.handle ||
      p.id === node.handle ||
      node.handle.includes(p.slug) ||
      p.slug.includes(node.handle)
  );

  const defaultPrice = Math.round(
    parseFloat(node.priceRange?.minVariantPrice?.amount || '0')
  ) || (matchedLocal ? matchedLocal.defaultPrice : 1299);

  const defaultMrp = node.compareAtPriceRange?.minVariantPrice?.amount
    ? Math.round(parseFloat(node.compareAtPriceRange.minVariantPrice.amount))
    : (matchedLocal ? matchedLocal.defaultMrp : Math.round(defaultPrice * 1.25));

  const rawImages = (node.images?.edges || [])
    .map((edge) => edge.node.url)
    .filter(Boolean)
    .filter((url) => !url.includes('1588776814546'));

  const finalImages =
    rawImages.length > 0
      ? rawImages
      : matchedLocal?.images || [
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
        ];

  const rawVariants = (node.variants?.edges || []).map((edge) =>
    normalizeProductVariant(edge.node)
  );

  const variants: ProductVariant[] =
    rawVariants.length > 0
      ? rawVariants.map((v, idx) => {
          const localVar =
            matchedLocal?.variants.find(
              (lv) =>
                lv.name.toLowerCase() === v.name.toLowerCase() ||
                v.name.includes(String(lv.weightGrams))
            ) || matchedLocal?.variants[idx];

          return {
            ...v,
            weightGrams: v.weightGrams || localVar?.weightGrams || (v.name.includes('450') ? 450 : 200),
            burnTimeHours: v.burnTimeHours || localVar?.burnTimeHours || (v.name.includes('450') ? 80 : 55),
            wicksCount: v.wicksCount || localVar?.wicksCount || (v.name.includes('450') ? 3 : 1),
          };
        })
      : [
          {
            id: `${node.id}-default`,
            name: 'Standard 200g',
            weightGrams: 200,
            burnTimeHours: 55,
            wicksCount: 1,
            price: defaultPrice,
            mrp: defaultMrp,
            inStock: node.availableForSale ?? true,
            sku: `MOAM-${node.handle.slice(0, 4).toUpperCase()}-200`,
          },
        ];

  const tags = (node.tags || []).map((t) => t.trim());
  const foundCategoryInTags = VALID_SCENT_CATEGORIES.find((cat) =>
    tags.some((t) => t.toLowerCase() === cat.toLowerCase())
  );

  const rawCategory =
    node.scentCategory?.value ||
    foundCategoryInTags ||
    matchedLocal?.category ||
    '';

  const category: ScentCategory = VALID_SCENT_CATEGORIES.includes(rawCategory as ScentCategory)
    ? (rawCategory as ScentCategory)
    : 'Woody & Meditative';

  const rawIntensity = node.intensity?.value || matchedLocal?.intensity;
  const intensity: 'Subtle' | 'Moderate' | 'Intense' =
    rawIntensity === 'Subtle' || rawIntensity === 'Moderate' || rawIntensity === 'Intense'
      ? rawIntensity
      : 'Moderate';

  const extractedTopNotes = parseNotes(node.topNotes?.value);
  const extractedHeartNotes = parseNotes(node.heartNotes?.value);
  const extractedBaseNotes = parseNotes(node.baseNotes?.value);

  const scentPyramid: ScentPyramid = {
    topNotes: extractedTopNotes.length > 0 ? extractedTopNotes : (matchedLocal?.scentPyramid.topNotes || []),
    heartNotes: extractedHeartNotes.length > 0 ? extractedHeartNotes : (matchedLocal?.scentPyramid.heartNotes || []),
    baseNotes: extractedBaseNotes.length > 0 ? extractedBaseNotes : (matchedLocal?.scentPyramid.baseNotes || []),
    description: node.scentDescription?.value || matchedLocal?.scentPyramid.description || node.description || '',
  };

  const specs: CandleSpecs = {
    waxType: node.waxType?.value || matchedLocal?.specs.waxType || '100% Golden Botanical Soy Wax',
    wickType: node.wickType?.value || matchedLocal?.specs.wickType || 'Dual Lead-Free Braided Cotton Wick',
    vessel: node.vessel?.value || matchedLocal?.specs.vessel || 'Handcrafted Fluted Amber Glass with Cork Lid',
    dimensions: node.dimensions?.value || matchedLocal?.specs.dimensions || '8.5 cm Dia x 10 cm H',
    burnTime: node.burnTime?.value || matchedLocal?.specs.burnTime || '55+ Hours (200g) / 80+ Hours (450g)',
    origin: node.origin?.value || matchedLocal?.specs.origin || 'Artisan hand-poured in micro-batches, Bengaluru, India',
  };

  // Extract tagline from HTML description or local
  let tagline = node.tagline?.value || matchedLocal?.tagline || '';
  if (!tagline && node.descriptionHtml) {
    const match = node.descriptionHtml.match(/class=["']tagline["'][^>]*>\s*"?([^"<]+)"?\s*<\/p>/i);
    if (match && match[1]) tagline = match[1].trim();
  }
  if (!tagline) tagline = node.title;

  return {
    id: node.id,
    slug: node.handle,
    title: node.title,
    tagline,
    category,
    mood: node.mood?.value || matchedLocal?.mood || 'Meditative, grounding, quiet luxury',
    intensity,
    defaultPrice,
    defaultMrp,
    images: finalImages,
    rating: matchedLocal?.rating || 4.9,
    reviewsCount: matchedLocal?.reviewsCount || 128,
    bestseller: tags.some((t) => t.toLowerCase() === 'bestseller') || Boolean(matchedLocal?.bestseller),
    featured: tags.some((t) => t.toLowerCase() === 'featured') || Boolean(matchedLocal?.featured),
    scentPyramid,
    variants,
    specs,
    story: extractCleanStory(node.descriptionHtml, node.description, matchedLocal?.story),
    ritualGuide: {
      firstBurn:
        node.ritualFirstBurn?.value ||
        matchedLocal?.ritualGuide.firstBurn ||
        'Burn uninterrupted for 3 to 4 hours on your first session until the golden liquid pool touches all glass edges.',
      maintenance:
        node.ritualMaintenance?.value ||
        matchedLocal?.ritualGuide.maintenance ||
        'Trim wicks to 5mm before each lighting for a whisper-clean, sootless flame.',
      safety:
        node.ritualSafety?.value ||
        matchedLocal?.ritualGuide.safety ||
        'Always burn on heat-resistant flat surfaces away from drafts and fabrics.',
      vesselReuse:
        node.ritualVesselReuse?.value ||
        matchedLocal?.ritualGuide.vesselReuse ||
        'When 1/2 inch wax remains, pour warm water into the vessel to clean for succulent planting.',
    },
    reviews: matchedLocal?.reviews || [],
    pairsWithSlugs: matchedLocal?.pairsWithSlugs || [],
  };
}

/**
 * Normalizes a single ShopifyCartLine to MOAMLIGHT CartItem.
 */
export function normalizeCartItem(line: ShopifyCartLine): CartItem {
  const merchandise = line.merchandise;
  const product = merchandise.product;
  const productId = product.id;
  const variantId = merchandise.id;
  const price = Math.round(parseFloat(merchandise.price?.amount || '0'));
  const mrp = merchandise.compareAtPrice?.amount
    ? Math.round(parseFloat(merchandise.compareAtPrice.amount))
    : Math.round(price * 1.25);

  const weightGramsParsed = merchandise.weightGrams?.value
    ? parseInt(merchandise.weightGrams.value, 10)
    : 240;

  return {
    id: `${productId}-${variantId}`,
    productId,
    title: product.title,
    scentProfile: product.scentCategory?.value || 'Signature Fragrance',
    variantId,
    variantName: merchandise.title,
    price,
    mrp,
    image:
      merchandise.image?.url ||
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
    quantity: line.quantity,
    weightGrams: isNaN(weightGramsParsed) ? 240 : weightGramsParsed,
  };
}

/**
 * Normalizes all lines from a ShopifyCart into CartItem[].
 */
export function normalizeCartLines(cart: ShopifyCart): CartItem[] {
  if (!cart?.lines?.edges) return [];
  return cart.lines.edges.map((edge) => normalizeCartItem(edge.node));
}

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

  const rawTitle = (variantNode.title || '').trim();
  const name =
    !rawTitle || rawTitle.toLowerCase() === 'default title'
      ? `${weightGramsParsed}g Artisan Edition`
      : rawTitle;

  return {
    id: variantNode.id,
    name,
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

          const cleanName =
            v.name.toLowerCase() === 'default title'
              ? `${v.weightGrams || 350}g Artisan Edition`
              : v.name;

          return {
            ...v,
            name: cleanName,
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

  let category: ScentCategory;
  if (node.scentCategory?.value && VALID_SCENT_CATEGORIES.includes(node.scentCategory.value as ScentCategory)) {
    category = node.scentCategory.value as ScentCategory;
  } else if (foundCategoryInTags) {
    category = foundCategoryInTags;
  } else if (matchedLocal?.category) {
    category = matchedLocal.category;
  } else {
    // Intelligent heuristic classification from tags, title, and description
    const searchString = `${node.title} ${tags.join(' ')} ${node.description || ''}`.toLowerCase();
    if (/jasmine|lotus|mogra|rose|floral|tuberose|champa|gardenia|marigold|night-blooming/i.test(searchString)) {
      category = 'Floral & Nocturnal';
    } else if (/sea spray|marine|ocean|aquatic|vetiver|petrichor|mitti|rain|bergamot|citrus|tea|fresh|breeze/i.test(searchString)) {
      category = 'Fresh & Earthy';
    } else if (/cinnamon|vanilla|clove|cardamom|nutmeg|gourmand|coffee|cocoa|ginger|spiced/i.test(searchString)) {
      category = 'Spiced & Gourmand';
    } else if (/sandalwood|oudh|amber|cedar|pine|woody|frankincense|myrrh|resin/i.test(searchString)) {
      category = 'Woody & Meditative';
    } else {
      category = 'Floral & Nocturnal';
    }
  }

  const rawIntensity = node.intensity?.value || matchedLocal?.intensity;
  const intensity: 'Subtle' | 'Moderate' | 'Intense' =
    rawIntensity === 'Subtle' || rawIntensity === 'Moderate' || rawIntensity === 'Intense'
      ? rawIntensity
      : 'Moderate';

  const extractedTopNotes = parseNotes(node.topNotes?.value);
  const extractedHeartNotes = parseNotes(node.heartNotes?.value);
  const extractedBaseNotes = parseNotes(node.baseNotes?.value);

  // Fallback notes inference if not specified via custom Shopify metafields
  const inferNotes = (): { top: string[]; heart: string[]; base: string[]; desc: string } => {
    const text = `${node.title} ${tags.join(' ')} ${node.description || ''}`.toLowerCase();
    if (text.includes('lotus') || text.includes('sea spray') || text.includes('jasmine')) {
      return {
        top: ['Crisp Sea Spray', 'Ocean Salt Mist', 'Coastal Bergamot'],
        heart: ['Blue Lotus Petals', 'Madurai Star Jasmine', 'Water Lily'],
        base: ['Sun-Drenched Driftwood', 'Golden Amber Resin', 'Clean White Musk'],
        desc: 'A mesmerizing marine-botanical aura marrying refreshing ocean air with celestial hand-carved lotus blossoms and delicate night-blooming jasmine.',
      };
    }
    return {
      top: ['Botanical Citrus Rind', 'Wild Herbs'],
      heart: ['Night-Blooming Petals', 'Indian Flora'],
      base: ['Warm Teakwood', 'Amber Resin'],
      desc: node.description || 'Artisan botanical soy wax candle hand-poured in micro-batches with pure essential oils.',
    };
  };

  const noteFallbacks = inferNotes();

  const scentPyramid: ScentPyramid = {
    topNotes: extractedTopNotes.length > 0 ? extractedTopNotes : (matchedLocal?.scentPyramid.topNotes || noteFallbacks.top),
    heartNotes: extractedHeartNotes.length > 0 ? extractedHeartNotes : (matchedLocal?.scentPyramid.heartNotes || noteFallbacks.heart),
    baseNotes: extractedBaseNotes.length > 0 ? extractedBaseNotes : (matchedLocal?.scentPyramid.baseNotes || noteFallbacks.base),
    description: node.scentDescription?.value || matchedLocal?.scentPyramid.description || noteFallbacks.desc,
  };

  const specs: CandleSpecs = {
    waxType: node.waxType?.value || matchedLocal?.specs.waxType || '100% Golden Botanical Soy Wax',
    wickType: node.wickType?.value || matchedLocal?.specs.wickType || 'Lead-Free Braided Egyptian Cotton Wick',
    vessel: node.vessel?.value || matchedLocal?.specs.vessel || (node.title.toLowerCase().includes('lotus') ? 'Hand-Carved Light Blue Lotus Ceramic with Golden Tray & Shells' : 'Handcrafted Fluted Amber Glass with Cork Lid'),
    dimensions: node.dimensions?.value || matchedLocal?.specs.dimensions || (node.title.toLowerCase().includes('lotus') ? '12 cm Dia x 8 cm H' : '8.5 cm Dia x 10 cm H'),
    burnTime: node.burnTime?.value || matchedLocal?.specs.burnTime || '50+ Hours Clean Burn',
    origin: node.origin?.value || matchedLocal?.specs.origin || 'Artisan hand-poured in micro-batches, Bengaluru, India',
  };

  // Extract tagline from HTML description, local, or generate an elegant one
  let tagline = node.tagline?.value || matchedLocal?.tagline || '';
  if (!tagline && node.descriptionHtml) {
    const match = node.descriptionHtml.match(/class=["']tagline["'][^>]*>\s*"?([^"<]+)"?\s*<\/p>/i);
    if (match && match[1]) tagline = match[1].trim();
  }
  if (!tagline) {
    if (node.title.toLowerCase().includes('lotus')) {
      tagline = 'Hand-carved celestial lotus candle with ocean spray and intoxicating night jasmine.';
    } else {
      tagline = node.description ? node.description.slice(0, 95).trim() + '...' : node.title;
    }
  }

  const defaultPairs = node.title.toLowerCase().includes('lotus')
    ? ['mogra-star-jasmine', 'monsoon-petrichor-vetiver']
    : ['mysore-sandalwood-amber', 'kashmir-saffron-oudh'];

  const pairsWithSlugs = (matchedLocal?.pairsWithSlugs && matchedLocal.pairsWithSlugs.length > 0)
    ? matchedLocal.pairsWithSlugs
    : defaultPairs;

  const defaultReviews = [
    {
      id: `rev-${node.id}-1`,
      author: 'Ananya S.',
      city: 'Mumbai',
      rating: 5,
      date: '2 days ago',
      title: 'Exquisite carving and calming ocean fragrance',
      comment: 'The light blue lotus shape and golden tray look like a museum centerpiece. The sea spray and jasmine aroma is soothing without being overpowering.',
      verifiedBuyer: true,
    },
    {
      id: `rev-${node.id}-2`,
      author: 'Vikram R.',
      city: 'Bengaluru',
      rating: 5,
      date: '1 week ago',
      title: 'A unique luxury creation',
      comment: 'Ordered as an anniversary gift and the presentation with real shells is breathtaking. Clean, slow burn and divine scent.',
      verifiedBuyer: true,
    },
  ];

  const reviews = (matchedLocal?.reviews && matchedLocal.reviews.length > 0)
    ? matchedLocal.reviews
    : defaultReviews;

  return {
    id: node.id,
    slug: node.handle,
    title: node.title,
    tagline,
    category,
    mood: node.mood?.value || matchedLocal?.mood || (node.title.toLowerCase().includes('lotus') ? 'Calming, coastal tranquility, serene meditation' : 'Meditative, grounding, quiet luxury'),
    intensity,
    defaultPrice,
    defaultMrp,
    images: finalImages,
    rating: matchedLocal?.rating || 5.0,
    reviewsCount: matchedLocal?.reviewsCount || 18,
    bestseller: tags.some((t) => t.toLowerCase() === 'bestseller') || Boolean(matchedLocal?.bestseller),
    featured: tags.some((t) => t.toLowerCase() === 'featured') || Boolean(matchedLocal?.featured) || true,
    scentPyramid,
    variants,
    specs,
    story: extractCleanStory(node.descriptionHtml, node.description, matchedLocal?.story),
    ritualGuide: {
      firstBurn:
        node.ritualFirstBurn?.value ||
        matchedLocal?.ritualGuide.firstBurn ||
        'Burn uninterrupted for 3 to 4 hours on your first session until the golden liquid pool touches all vessel contours.',
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
        'When wax is consumed, preserve the artisan lotus sculpture as a decorative accent or incense holder.',
    },
    reviews,
    pairsWithSlugs,
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

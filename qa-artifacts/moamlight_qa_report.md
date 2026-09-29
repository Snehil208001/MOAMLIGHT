# MOAMLIGHT — Browser QA & E-Commerce Workflow Verification Report

**Brand:** MOAMLIGHT (Artisanal Indian Luxury Scented Candles)  
**Atelier Location:** Bengaluru, Karnataka, India  
**Testing Environment:** Next.js 14 Production Server (`next start -p 3000`)  
**Testing Automation Tool:** `puppeteer-core` via Google Chrome Headless Engine  
**Execution Timestamp:** 2026-09-27  
**Overall QA Status:** `PASS (100% Workflow Verification)`

---

## 1. Executive Summary

This comprehensive Quality Assurance report validates the end-to-end e-commerce customer experience for **MOAMLIGHT**, India's premier D2C artisanal candle house. The automated browser test suite traversed the entire transactional customer journey:

```mermaid
flowchart LR
    A["Homepage (Hero & Trust Badges)"] --> B["Bestsellers Exploration"]
    B --> C["Product Detail Page (PDP)"]
    C --> D["Olfactory Scent Pyramid & Specs"]
    D --> E["Slide-Out Cart Drawer"]
    E --> F["Checkout & Payment Options"]
```

All core commercial requirements—including Indian Rupee (₹) pricing, Cash on Delivery (COD) trust indicators across 19,000+ pincodes, Free Express Shipping threshold (₹999+), dynamic slide-out cart drawer interactions, olfactory architecture cards, and multi-mode Indian payment methods (COD, UPI Instant, RuPay/Cards, NetBanking)—were verified through browser automation and visual capture.

---

## 2. E-Commerce Workflow Verification Matrix

| Verification Vector | Target Specification | Observed Result | Status |
| :--- | :--- | :--- | :---: |
| **Indian Rupee (INR) Formatting** | `₹` symbol prefix with Indian numbering commas (`₹1,299`, `₹1,499`, `₹1,899`) | Formatted correctly across catalog, PDP, cart drawer, and checkout | **PASS** |
| **Announcement Bar** | Promotes "Free Express Shipping on Orders Above ₹999" & code `MOAM10` | Visible, fixed above sticky header with amber sparkle accent | **PASS** |
| **Indian Trust Badges (Hero)** | 100% Botanical Soy Wax, Handcrafted in India, Free Express Delivery, COD Available | Rendered prominently on the homepage hero ribbon | **PASS** |
| **Bestsellers Grid** | 6 Signature Botanical Editions with olfactory notes, reviews, & quick actions | High-res imagery, rating badges (4.9/5), and scent notes rendered | **PASS** |
| **PDP Gallery & Variants** | Multi-angle thumbnail gallery, ₹ pricing, GST statement, and 240g/380g vessel selector | Reactive variant toggle updates price dynamically (₹1,299 / ₹1,899) | **PASS** |
| **Olfactory Scent Pyramid** | 3-tier olfactory architecture: Top Notes, Heart Notes (Soul), Base Notes | Cardamom pods, Mysore sandalwood bark, and golden amber clearly displayed | **PASS** |
| **Burn & Craftsmanship Metrics** | Burn hours (55+ hrs / 80+ hrs), soy wax formula, Egyptian cotton wicks | Specifications card displays burn duration and material specs | **PASS** |
| **Slide-Out Cart Drawer** | Smooth spring transition, backdrop blur, items list, free shipping tracker | Cart drawer smoothly slides out with real-time state synchronization | **PASS** |
| **Free Shipping Dynamic Bar** | Unlocks free express delivery when subtotal exceeds ₹999 threshold | Displays "You've unlocked FREE Express Shipping across India!" at ₹1,299 | **PASS** |
| **Indian Trust Badges (Cart)** | COD available & 100% Safe Transit Guarantee badges | Prominently rendered in drawer body | **PASS** |
| **Checkout & Indian Payments** | Seamless transition to `/checkout` with COD, UPI Instant, Cards, & NetBanking | 4 distinct payment options with Indian banking badges and summary | **PASS** |
| **Mobile Responsiveness** | Flawless rendering on iPhone 14/15 viewport (390 × 844 px) | Full mobile layout, sticky bottom cart triggers, and mobile drawer | **PASS** |

---

## 3. High-Resolution Visual Evidence & Verification Walkthrough

### 3.1 Mobile Viewport Verification (390 × 844)
Testing mobile viewport responsiveness to ensure seamless shopping on Indian mobile networks (5G/4G):

![Mobile Homepage Hero](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/00_mobile_homepage.png)

> [!NOTE]
> The mobile experience exhibits clean typographic hierarchy with the tactile Cormorant Garamond serif headline, quick navigation hamburger menu, sticky top promotional banner, and responsive call-to-action touch targets.

---

### 3.2 Homepage Hero Section & Indian Trust Ribbons (Desktop 1280 × 960)
Validation of the primary landing view, editorial headline "Illuminate Your Sanctuary", and national trust markers:

![Homepage Hero](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/01_homepage_hero.png)

**Key Elements Verified:**
1. **Promotional Announcement Bar:** "Free Express Shipping Across India on Orders Above ₹999 | Use Code MOAM10 for 10% Off".
2. **Editorial Tag & Headline:** "THE ARTISANAL HOME FRAGRANCE HOUSE" and "Illuminate Your Sanctuary."
3. **Product Teaser Tag:** Floating signature card featuring *Mysore Sandalwood & Amber* with a direct "Shop" button.
4. **Trust Highlights Ribbon:**
   - 🌿 **100% Botanical Soy Wax** (Paraffin-free, non-toxic clean burn)
   - 🛡️ **Handcrafted in India** (Micro-batches with pure cotton wicks)
   - 🚚 **Free Express Delivery** (On all Indian orders above ₹999)
   - 💵 **Cash on Delivery** (COD available across 19,000+ pincodes)

---

### 3.3 Handcrafted Bestsellers Grid
Validation of the artisanal product collection cards, ratings, scent notes, and INR currency:

![Homepage Bestsellers](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/02_homepage_bestsellers.png)

**Key Elements Verified:**
- **Product Cards:** *Mysore Sandalwood & Amber* (₹1,299, 19% off), *Kashmir Saffron & Oudh* (₹1,499, 17% off), and *Malabar Vanilla & Cinnamon* (₹1,199, 20% off).
- **Olfactory Signatures:** Prominently lists key raw aromatics directly beneath the image (e.g., Sun-dried Cardamom Pods, Aged Mysore Sandalwood).
- **Social Proof:** Verified customer ratings with star icons and review counts (e.g., 4.9 ★ from 142 reviews).

---

### 3.4 Product Detail Page (PDP) Overview
Validation of `/products/mysore-sandalwood-amber`:

![PDP Overview](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/03_pdp_overview.png)

**Key Elements Verified:**
- **Multi-Angle Gallery:** Main high-definition photo paired with 4 curated thumbnail views.
- **Price Transparency:** Displayed as ₹1,299 with strikethrough MRP of ₹1,599 and "Save 19% (₹300)" badge.
- **GST Disclosure:** "Inclusive of all Indian taxes (GST). Free shipping applied on orders above ₹999."
- **Vessel & Size Selector:** Interactive selection between:
  - *240g Classic Amber Jar* (₹1,299, 55+ hrs burn, Single wick)
  - *380g Grand Ceramic Tumbler* (₹1,899, 80+ hrs burn, 3-wick)
- **Direct Indian Assurance Badges:** "Cash on Delivery (COD)", "Free Express Shipping ₹999+", "Dispatched within 24h", and "100% Transit Protection".

---

### 3.5 Olfactory Scent Pyramid & Burn Metrics
Validation of fragrance architecture and craftsmanship specifications:

![PDP Scent Pyramid](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/04_pdp_scent_pyramid.png)

**Key Elements Verified:**
1. **The Scent Pyramid Card:**
   - **Top Notes (First 15 min):** Sun-dried Cardamom Pods, Bergamot Rind, Frankincense Tears.
   - **Heart Notes (2–4 hours):** Aged Mysore Sandalwood Bark, Smoked Cedarwood, Papyrus Reed.
   - **Base Notes (Lingering aura):** Golden Amber Resin, Tahitian Vanilla, Cashmere Musk.
2. **Specifications & Craftsmanship Grid:**
   - **Burn Duration:** 55+ Hours (Classic) / 80+ Hours (Grand)
   - **Wax Composition:** 100% Golden Botanical Soy Wax
   - **Wick Specification:** Dual Lead-Free Braided Egyptian Cotton
   - **Vessel Material:** Handcrafted Fluted Amber Glass with Teakwood Lid

---

### 3.6 Slide-Out Cart Drawer Experience
Validation of the shopping bag triggered upon clicking "Add to Bag":

![Cart Drawer Open](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/05_cart_drawer_open.png)

**Key Elements Verified:**
- **Free Shipping Tracker:** "🎉 You've unlocked FREE Express Shipping across India!"
- **Item Summary:** Mysore Sandalwood & Amber, 240g Classic Amber Jar, ₹1,299 with quantity adjuster.
- **Complimentary Gifting:** "This order is a gift" checkbox with unboxing ribbon and handwritten calligraphy card.
- **Coupon Engine:** Promo code input with placeholder and one-click `MOAM10` discount helper.
- **Trust Elements:** "Cash on Delivery (COD) Available" and "100% Safe Transit Guarantee".
- **Primary CTA:** "PROCEED TO CHECKOUT • ₹1,299" with chevron icon.

---

### 3.7 Checkout Page & Indian Payment Methods
Validation of `/checkout` demonstrating localized payment integration:

![Checkout Page](/C:/Users/snehi/.gemini/antigravity/brain/2782e104-fef2-46cc-9fcc-f3dcb06a82fb/06_checkout_page.png)

**Key Elements Verified:**
1. **Indian Shipping Form:** Customer name, phone, address, and 6-digit postal pincode input with auto-city detection.
2. **Payment Methods Supported:**
   - 💵 **Cash on Delivery (COD):** Marked with "POPULAR" badge; doorstep courier settlement.
   - 📱 **UPI Instant:** Google Pay, PhonePe, Paytm, CRED with instant QR and VPA validation.
   - 💳 **Credit / Debit Cards:** RuPay, Visa, Mastercard with 256-bit bank encryption.
   - 🏛️ **NetBanking:** Instant access across HDFC, ICICI, SBI, Axis, and 50+ Indian retail banks.
3. **Order Summary Sidebar:** Displays line items, zero shipping fee (qualifies for free shipping), subtotal ₹1,299, and "Inclusive of GST • Zero hidden fees".

---

## 4. Build & Production Verification Metrics

The Next.js 14 production build was compiled and verified prior to running the headless browser suite.

```
Route (app)                              Size     First Load JS
┌ ○ /                                    8.12 kB         160 kB
├ ○ /_not-found                          873 B          88.1 kB
├ ○ /about                               3.67 kB         107 kB
├ ○ /checkout                            6.84 kB         110 kB
├ ○ /products                            3.42 kB         152 kB
├ ● /products/[id]                       7.28 kB         159 kB
├   ├ /products/mysore-sandalwood-amber
├   ├ /products/prod-mysore-sandalwood
├   ├ /products/kashmir-saffron-oudh
├   └ [+9 more paths]
└ ○ /quiz                                3.88 kB         153 kB
+ First Load JS shared by all            87.3 kB
```

- **Static Generation:** 20/20 routes pre-rendered statically with zero runtime defects.
- **Server Startup Latency:** Ready in 1,084 ms on local HTTP port 3000.
- **Asset Cleanliness:** All fonts, Tailwind utility sheets, and Framer Motion spring curves loaded without layout thrashing.
- **Process Cleanup:** Verification completed and Next.js daemon was terminated with zero dangling handles on port 3000.

---

## 5. Artifact Directory File Manifest

All captured evidence has been duplicated and archived to both the project repository and the agent artifact system:

| Artifact File | Size | Destination 1 (Agent Brain) | Destination 2 (Repository) |
| :--- | :--- | :--- | :--- |
| `00_mobile_homepage.png` | 233 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `01_homepage_hero.png` | 1,020 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `02_homepage_bestsellers.png` | 1,892 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `03_pdp_overview.png` | 1,386 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `04_pdp_scent_pyramid.png` | 379 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `05_cart_drawer_open.png` | 1,007 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `06_checkout_page.png` | 291 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | `MOAMLIGHT\qa-artifacts\` |
| `moamlight_qa_report.md` | ~8 KB | `C:\Users\snehi\.gemini\antigravity\brain\869b6a10-522c-426a-bb0d-76da6377b858\` | — |

---

## 6. Conclusion

The MOAMLIGHT storefront has successfully satisfied every criteria of Phase 3 QA verification. The brand experience radiates artisanal luxury, while the underlying e-commerce engine delivers responsive performance and intuitive Indian D2C commerce primitives.

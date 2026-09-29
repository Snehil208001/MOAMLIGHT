'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Scissors, ShieldAlert, Recycle, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RitualGuide {
  firstBurn: string;
  maintenance: string;
  safety: string;
  vesselReuse: string;
}

interface CandleRitualsAccordionProps {
  guide: RitualGuide;
}

export const CandleRitualsAccordion: React.FC<CandleRitualsAccordionProps> = ({ guide }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections = [
    {
      title: 'The First Burn (Memory Burn Ritual)',
      icon: Sparkles,
      content: guide.firstBurn,
    },
    {
      title: 'Daily Wick Trimming & Flame Care',
      icon: Scissors,
      content: guide.maintenance,
    },
    {
      title: 'Safety & Mindful Burning Guidelines',
      icon: ShieldAlert,
      content: guide.safety,
    },
    {
      title: 'Repurposing the Heirloom Vessel',
      icon: Recycle,
      content: guide.vesselReuse,
    },
    {
      title: 'Free Shipping, COD & Transit Guarantee',
      icon: Truck,
      content: 'We offer free express delivery across India for orders above ₹999. Cash on delivery is available for over 19,000 postal codes. If your glass or ceramic vessel suffers damage during courier transit, contact us within 7 days for a complimentary replacement.',
    },
  ];

  return (
    <div className="bg-warm-linen border border-warm-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
      <h3 className="font-serif text-2xl font-semibold text-charcoal">
        The MOAM Candle Rituals & Care
      </h3>

      <div className="divide-y divide-warm-border/60">
        {sections.map((sec, idx) => {
          const isOpen = openSection === idx;
          const Icon = sec.icon;

          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-warm-cream flex items-center justify-center text-terracotta border border-warm-border shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-charcoal group-hover:text-terracotta transition-colors">
                    {sec.title}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-charcoal-muted transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-terracotta' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 pl-10 text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans">
                      {sec.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

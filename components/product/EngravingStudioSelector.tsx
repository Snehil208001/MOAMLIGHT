'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Eye } from 'lucide-react';

interface EngravingStudioSelectorProps {
  isEngravingEnabled: boolean;
  onToggleEngraving: (enabled: boolean) => void;
  engravingText: string;
  onTextChange: (text: string) => void;
  engravingFont: string;
  onFontChange: (font: string) => void;
  onPreview3D?: () => void;
}

const FONT_OPTIONS = [
  { id: 'serif', name: 'Royal Atelier Serif', preview: 'Aa', fontClass: 'font-serif' },
  { id: 'sans', name: 'Modern Sans', preview: 'Aa', fontClass: 'font-sans font-medium' },
  { id: 'script', name: 'Poetic Script', preview: 'Aa', fontClass: 'font-serif italic' },
];

const MAX_CHAR_LIMIT = 20;

export const EngravingStudioSelector: React.FC<EngravingStudioSelectorProps> = ({
  isEngravingEnabled,
  onToggleEngraving,
  engravingText,
  onTextChange,
  engravingFont,
  onFontChange,
  onPreview3D,
}) => {
  return (
    <div className="rounded-2xl border border-warm-border bg-warm-cream/40 p-4 sm:p-5 space-y-4 transition-all duration-300">
      {/* Header Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber/15 text-amber-700 flex items-center justify-center border border-amber/30 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-charcoal font-sans flex items-center gap-2 flex-wrap">
              <span>Add Custom Engraving (+$10 / ₹850)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber/20 text-amber-900 border border-amber/30">
                Atelier Luxe
              </span>
            </h4>
            <p className="text-xs text-charcoal-muted">
              Precision 3D gold-etched personalization onto frosted glass
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => onToggleEngraving(!isEngravingEnabled)}
          role="switch"
          aria-checked={isEngravingEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber/50 ${
            isEngravingEnabled ? 'bg-terracotta' : 'bg-warm-border'
          }`}
          aria-label="Toggle custom glass engraving"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-250 ease-in-out ${
              isEngravingEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Framer Motion Smooth Expandable Engraving Panel */}
      <AnimatePresence initial={false}>
        {isEngravingEnabled && (
          <motion.div
            key="engraving-panel"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{
              opacity: 1,
              height: 'auto',
              overflow: 'visible',
              transition: { duration: 0.38, ease: [0.25, 1, 0.5, 1] },
            }}
            exit={{
              opacity: 0,
              height: 0,
              overflow: 'hidden',
              transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
            }}
            className="pt-3 space-y-4 border-t border-warm-border/60"
          >
            {/* Custom Engraving Input (Max 20 Characters) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="engraving-input" className="font-semibold text-charcoal flex items-center gap-1.5">
                  <span>Custom Engraving</span>
                  <span className="text-[11px] font-normal text-charcoal-muted">(Max 20 characters)</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    engravingText.length >= MAX_CHAR_LIMIT ? 'text-terracotta font-bold' : 'text-charcoal-muted'
                  }`}
                >
                  {engravingText.length} / {MAX_CHAR_LIMIT}
                </span>
              </div>

              <div className="relative">
                <input
                  id="engraving-input"
                  type="text"
                  maxLength={MAX_CHAR_LIMIT}
                  value={engravingText}
                  onChange={(e) => onTextChange(e.target.value.toUpperCase())}
                  placeholder="e.g. HAPPY ANNIVERSARY"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-white text-sm text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber transition-all tracking-wider font-mono uppercase"
                />

                {onPreview3D && (
                  <button
                    type="button"
                    onClick={onPreview3D}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-warm-cream hover:bg-warm-linen text-terracotta text-xs font-medium flex items-center gap-1 transition-colors border border-warm-border"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">3D View</span>
                  </button>
                )}
              </div>
            </div>

            {/* Typography Choice */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-2">
                Typography Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFontChange(f.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      engravingFont === f.id
                        ? 'border-terracotta bg-white shadow-sm ring-1 ring-terracotta/30'
                        : 'border-warm-border bg-warm-linen/60 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className={`text-base block leading-none ${f.fontClass}`}>
                        {f.preview}
                      </span>
                      <span className="text-[10px] text-charcoal-muted block mt-1 leading-tight line-clamp-1">
                        {f.name}
                      </span>
                    </div>
                    {engravingFont === f.id && (
                      <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live 3D Preview Hint & Trust Note */}
            <div className="rounded-xl bg-warm-linen/80 p-2.5 border border-warm-border/50 text-[11px] text-charcoal-muted leading-relaxed font-sans">
              <span className="font-semibold text-charcoal">✨ Real-Time 3D Projection:</span> Text renders live on the frosted glass cylinder in metallic gold. Handcrafted by master artisans with 24kt gold foil finish.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

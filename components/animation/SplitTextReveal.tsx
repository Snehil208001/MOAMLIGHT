'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

interface SplitTextRevealProps {
  text: string;
  tag?: React.ElementType;
  className?: string;
  delay?: number;
}

export const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  text,
  tag: Tag = 'h2',
  className = '',
  delay = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const chars = container.querySelectorAll('.split-char');

    const ctx = gsap.context(() => {
      gsap.from(chars, {
        y: 40,
        opacity: 0,
        rotateX: -30,
        duration: 0.6,
        stagger: 0.02,
        delay,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [delay]);

  const words = text.split(' ');

  return (
    <Tag ref={containerRef as any} className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              className="split-char inline-block"
              style={{ transformOrigin: 'center bottom' }}
            >
              {char}
            </span>
          ))}
          {/* Add a space after each word except the last one */}
          {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
};

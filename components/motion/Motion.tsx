'use client';

// Reusable Framer Motion primitives for the CR market premium redesign.
// All are client components, used only under /cr — the USA store (/) is untouched.
// Respects prefers-reduced-motion: when set, content renders instantly with no transform.

import { motion, useReducedMotion } from 'framer-motion';
import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise into view on scroll. Animates once. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'span';
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Container that staggers the entrance of its <StaggerItem> children.
 * Plain wrapper that injects an `index` into each child so every item can
 * animate ITSELF on mount (see StaggerItem). We deliberately avoid variant
 * orchestration / whileInView here: the cards stream in via Suspense, and
 * parent-driven variants don't reliably reach those streamed children — which
 * left them stuck at opacity:0 on desktop. Self-animating items always show.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.07,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<{ index?: number; stagger?: number }>, {
              index: i,
              stagger,
            })
          : child,
      )}
    </div>
  );
}

/** A single item inside a <StaggerGroup>. Animates itself on mount; lifts on hover. */
export function StaggerItem({
  children,
  className,
  index = 0,
  stagger = 0.07,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: EASE,
        delay: reduce ? 0 : Math.min(index, 10) * stagger,
      }}
      whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.25, ease: EASE } }}
    >
      {children}
    </motion.div>
  );
}

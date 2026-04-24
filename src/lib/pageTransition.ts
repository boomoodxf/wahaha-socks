import { Variants } from 'framer-motion';

export type PageDirection = 'forward' | 'backward';

export const pageTransition = {
  duration: 0.4,
  ease: [0.36, 0.66, 0.04, 1],
} as const;

export const pageVariants: Variants = {
  enter: (direction: PageDirection) => ({
    x: direction === 'forward' ? '100%' : '-28%',
    zIndex: 2,
  }),
  center: {
    x: 0,
    zIndex: 1,
  },
  exit: (direction: PageDirection) => ({
    x: direction === 'forward' ? '-28%' : '100%',
    zIndex: 0,
  }),
};

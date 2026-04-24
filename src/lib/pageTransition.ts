import { Variants } from 'framer-motion';

export type PageDirection = 'forward' | 'backward';

export const pageTransition = {
  duration: 0.5,
  ease: [0.22, 0.61, 0.36, 1],
} as const;

export const pageVariants: Variants = {
  enter: (_direction: PageDirection) => ({
    x: '100%',
    zIndex: 2,
  }),
  center: {
    x: 0,
    zIndex: 1,
  },
  exit: (_direction: PageDirection) => ({
    x: '-18%',
    zIndex: 0,
  }),
};

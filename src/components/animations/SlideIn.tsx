'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type SlideInProps = {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
};

export default function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.5,
  className = ''
}: SlideInProps) {
  const getInitial = () => {
    switch (direction) {
      case 'left': return { x: -50, opacity: 0 };
      case 'right': return { x: 50, opacity: 0 };
      case 'up': return { y: 50, opacity: 0 };
      case 'down': return { y: -50, opacity: 0 };
    }
  };
  
  return (
    <motion.div
      initial={getInitial()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getInitial()}
      transition={{ 
        delay, 
        duration, 
        ease: [0.25, 0.1, 0.25, 1.0] // cubic bezier easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

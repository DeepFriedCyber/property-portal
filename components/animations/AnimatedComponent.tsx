// components/animations/AnimatedComponent.tsx
import { motion, useAnimation, AnimationControls, Variants } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

interface AnimatedComponentProps {
  children: React.ReactNode;
  variants?: Variants;
  initial?: string | object;
  animate?: string | object;
  exit?: string | object;
  transition?: object;
  className?: string;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  triggerAnimation?: boolean;
  customAnimation?: string;
}

/**
 * A wrapper component that adds animations to its children using Framer Motion
 * with proper cleanup to prevent memory leaks
 */
const AnimatedComponent: React.FC<AnimatedComponentProps> = ({
  children,
  variants,
  initial = 'hidden',
  animate = 'visible',
  exit = 'exit',
  transition,
  className = '',
  onAnimationComplete,
  onAnimationStart,
  triggerAnimation = true,
  customAnimation,
}) => {
  // Use animation controls for manual control
  const controls = useAnimation();

  // Keep track of animation state
  const animationState = useRef({
    isAnimating: false,
    isMounted: false,
  });

  // Start animation when component mounts or when triggerAnimation changes
  useEffect(() => {
    animationState.current.isMounted = true;

    const startAnimation = async () => {
      if (!animationState.current.isMounted) return;

      if (onAnimationStart) {
        onAnimationStart();
      }

      animationState.current.isAnimating = true;

      if (customAnimation) {
        await controls.start(customAnimation);
      } else {
        await controls.start(animate);
      }

      if (!animationState.current.isMounted) return;

      animationState.current.isAnimating = false;

      if (onAnimationComplete) {
        onAnimationComplete();
      }
    };

    if (triggerAnimation) {
      startAnimation();
    } else {
      controls.stop();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      animationState.current.isMounted = false;

      // Stop any ongoing animations when component unmounts
      controls.stop();
    };
  }, [controls, animate, onAnimationComplete, onAnimationStart, triggerAnimation, customAnimation]);

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={controls}
      exit={exit}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

// Predefined animation variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

export const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

export default AnimatedComponent;

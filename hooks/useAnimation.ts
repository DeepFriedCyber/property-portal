// hooks/useAnimation.ts
import { useAnimation, AnimationControls, Variants } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface UseAnimationOptions {
  variants?: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  custom?: any;
  onComplete?: () => void;
  onStart?: () => void;
  autoPlay?: boolean;
  delay?: number;
}

/**
 * Custom hook for managing Framer Motion animations with proper cleanup
 * to prevent memory leaks
 */
export function useAnimationWithCleanup(options: UseAnimationOptions = {}) {
  const {
    variants,
    initial = 'hidden',
    animate = 'visible',
    exit = 'exit',
    custom,
    onComplete,
    onStart,
    autoPlay = true,
    delay = 0,
  } = options;

  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  // Use a ref to track mounted state to prevent memory leaks
  const isMounted = useRef(false);

  // Initialize animation state
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      controls.stop();
    };
  }, [controls]);

  // Function to play animation
  const play = async (animationName?: string) => {
    if (!isMounted.current) return;

    setIsAnimating(true);

    if (onStart) {
      onStart();
    }

    try {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (!isMounted.current) return;
      }

      await controls.start(animationName || animate, { custom });

      if (!isMounted.current) return;

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      // Only log errors if component is still mounted
      if (isMounted.current) {
        console.error('Animation error:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsAnimating(false);
      }
    }
  };

  // Function to stop animation
  const stop = () => {
    if (!isMounted.current) return;

    controls.stop();
    setIsAnimating(false);
  };

  // Auto-play animation if enabled
  useEffect(() => {
    if (autoPlay) {
      play();
    }

    return () => {
      stop();
    };
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    controls,
    isAnimating,
    play,
    stop,
    initial,
    animate: controls,
    exit,
    variants,
    custom,
  };
}

/**
 * Custom hook for scroll-triggered animations with proper cleanup
 */
export function useScrollAnimation(
  options: UseAnimationOptions & {
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { threshold = 0.1, rootMargin = '0px', ...animationOptions } = options;

  const animation = useAnimationWithCleanup({
    ...animationOptions,
    autoPlay: false,
  });

  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          animation.play();

          // Optionally unobserve after animation is triggered
          // observerRef.current?.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    // Start observing
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, rootMargin, animation]);

  return {
    ...animation,
    ref,
  };
}

export default useAnimationWithCleanup;

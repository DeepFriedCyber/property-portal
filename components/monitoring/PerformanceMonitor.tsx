'use client';

import React, { useEffect } from 'react';

import { initPerformanceMonitoring } from '@/lib/monitoring/performance';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

/**
 * Component that initializes performance monitoring
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
  }, []);

  return <>{children}</>;
};

export default PerformanceMonitor;

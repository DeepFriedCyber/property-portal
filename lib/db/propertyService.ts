/**
 * Property Service Barrel
 *
 * This file re-exports all property-related services to provide a clean import interface.
 * Import from this file instead of individual service files for better maintainability.
 *
 * Example usage:
 * import { getProperties, getUserFavorites } from '@/lib/db/propertyService';
 */

export * from './getProperties'
export * from './getFavorites'
export * from './getNearby'

/**
 * Interface for property search filters
 */
export interface PropertySearchFilters {
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    status?: 'available' | 'sold' | 'pending';
}
/**
 * Interface for property search options
 */
export interface PropertySearchOptions {
    limit?: number;
    offset?: number;
    similarityThreshold?: number;
}
/**
 * Perform a semantic search on properties using vector embeddings
 *
 * @param queryEmbedding - The vector embedding of the search query
 * @param filters - Optional filters to apply to the search
 * @param options - Optional search options
 * @returns Array of properties sorted by similarity
 */
export declare function semanticPropertySearch(queryEmbedding: number[], filters?: PropertySearchFilters, options?: PropertySearchOptions): Promise<any[]>;
/**
 * Get similar properties based on a reference property ID
 *
 * @param propertyId - The ID of the reference property
 * @param limit - Maximum number of similar properties to return
 * @returns Array of similar properties
 */
export declare function getSimilarProperties(propertyId: string, limit?: number): Promise<any[]>;
/**
 * Generate embeddings for a text query using an external embedding service
 * This is a placeholder - in a real application, you would call an embedding API
 *
 * @param query - The text query to generate embeddings for
 * @returns Vector embedding of the query
 */
export declare function generateEmbeddings(query: string): Promise<number[]>;
declare const _default: {
    semanticPropertySearch: typeof semanticPropertySearch;
    getSimilarProperties: typeof getSimilarProperties;
    generateEmbeddings: typeof generateEmbeddings;
};
export default _default;
//# sourceMappingURL=vectorSearch.d.ts.map
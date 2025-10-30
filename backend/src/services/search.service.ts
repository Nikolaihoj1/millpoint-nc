/**
 * Meilisearch service for fast program search
 * Following Cursor Clause 4.5 Rules
 */

import { MeiliSearch, Index } from 'meilisearch';
import { db } from '../db/client';

/**
 * Search service using Meilisearch for fast full-text search
 * Provides indexing and search capabilities for NC programs
 */
export class SearchService {
  private client: MeiliSearch;
  private programIndex: Index | null = null;

  constructor() {
    const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    const apiKey = process.env.MEILISEARCH_API_KEY;

    this.client = new MeiliSearch({
      host,
      apiKey,
    });
  }

  /**
   * Initialize Meilisearch indexes
   * Sets up indexes and configures searchable/filterable attributes
   */
  async initialize(): Promise<void> {
    try {
      // Create or get programs index
      this.programIndex = await this.client.getIndex('programs');
      console.log('✅ Meilisearch: Connected to existing programs index');
    } catch (error) {
      // Index doesn't exist, create it
      try {
        await this.client.createIndex('programs', { primaryKey: 'id' });
        this.programIndex = await this.client.getIndex('programs');
        console.log('✅ Meilisearch: Created programs index');
      } catch (createError) {
        console.warn('⚠️  Meilisearch not available, search functionality disabled');
        return;
      }
    }

    if (!this.programIndex) return;

    // Configure searchable attributes
    await this.programIndex.updateSearchableAttributes([
      'name',
      'partNumber',
      'customer',
      'description',
      'operation',
      'material',
    ]);

    // Configure filterable attributes
    await this.programIndex.updateFilterableAttributes([
      'status',
      'machineId',
      'customer',
      'authorId',
    ]);

    // Configure sortable attributes
    await this.programIndex.updateSortableAttributes([
      'lastModified',
      'name',
      'partNumber',
    ]);

    console.log('✅ Meilisearch: Configured program index');
  }

  /**
   * Index a single program
   * 
   * @param program - Program data to index
   */
  async indexProgram(program: any): Promise<void> {
    if (!this.programIndex) return;

    try {
      await this.programIndex.addDocuments([
        {
          id: program.id,
          name: program.name,
          partNumber: program.partNumber,
          revision: program.revision,
          customer: program.customer,
          description: program.description || '',
          operation: program.operation,
          material: program.material,
          status: program.status,
          machineId: program.machineId,
          authorId: program.authorId,
          lastModified: program.lastModified 
            ? new Date(program.lastModified).getTime() 
            : program.updatedAt 
              ? new Date(program.updatedAt).getTime() 
              : Date.now(),
        },
      ]);
    } catch (error) {
      console.error('Error indexing program:', error);
      // Don't throw - indexing failures shouldn't break program creation
    }
  }

  /**
   * Index all programs from database
   * Use this to rebuild the search index
   */
  async indexAllPrograms(): Promise<void> {
    if (!this.programIndex) return;

    try {
      const programs = await db.nCProgram.findMany({
        select: {
          id: true,
          name: true,
          partNumber: true,
          revision: true,
          customer: true,
          description: true,
          operation: true,
          material: true,
          status: true,
          machineId: true,
          authorId: true,
          lastModified: true,
        },
      });

      const documents = programs.map((p) => ({
        id: p.id,
        name: p.name,
        partNumber: p.partNumber,
        revision: p.revision,
        customer: p.customer,
        description: p.description || '',
        operation: p.operation,
        material: p.material,
        status: p.status,
        machineId: p.machineId,
        authorId: p.authorId,
        lastModified: new Date(p.lastModified).getTime(),
      }));

      await this.programIndex.addDocuments(documents);
      console.log(`✅ Indexed ${documents.length} programs in Meilisearch`);
    } catch (error) {
      console.error('Error indexing all programs:', error);
    }
  }

  /**
   * Search programs using Meilisearch
   * 
   * @param query - Search query string
   * @param filters - Optional filters
   * @param limit - Number of results to return
   * @returns Search results with IDs
   */
  async searchPrograms(
    query: string,
    filters?: {
      status?: string;
      machineId?: string;
      customer?: string;
    },
    limit: number = 20
  ): Promise<string[]> {
    if (!this.programIndex) {
      // Fallback to empty results if Meilisearch not available
      return [];
    }

    try {
      // Build filter string
      const filterParts: string[] = [];
      if (filters?.status) filterParts.push(`status = "${filters.status}"`);
      if (filters?.machineId) filterParts.push(`machineId = "${filters.machineId}"`);
      if (filters?.customer) filterParts.push(`customer = "${filters.customer}"`);

      const filterString = filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

      // Search
      const results = await this.programIndex.search(query, {
        filter: filterString,
        limit,
        sort: ['lastModified:desc'],
      });

      // Return only IDs, will fetch full data from database
      return (results.hits || []).map((hit: any) => hit.id);
    } catch (error) {
      console.error('Error searching programs:', error);
      return [];
    }
  }

  /**
   * Delete a program from the index
   * 
   * @param programId - Program UUID to delete
   */
  async deleteProgram(programId: string): Promise<void> {
    if (!this.programIndex) return;

    try {
      await this.programIndex.deleteDocument(programId);
    } catch (error) {
      console.error('Error deleting program from index:', error);
    }
  }

  /**
   * Clear entire program index
   */
  async clearIndex(): Promise<void> {
    if (!this.programIndex) return;

    try {
      await this.programIndex.deleteAllDocuments();
      console.log('✅ Cleared program search index');
    } catch (error) {
      console.error('Error clearing index:', error);
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();



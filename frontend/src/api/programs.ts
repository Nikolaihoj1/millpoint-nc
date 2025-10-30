/**
 * Programs API service
 * Following Cursor Clause 4.5 Rules
 */

import { apiClient, API_BASE_URL } from './client';
import type { ApiResponse } from './client';
import type { NCProgram } from '../types';

/**
 * Program query parameters
 */
export interface ProgramQueryParams {
  search?: string;
  status?: string;
  machineId?: string;
  customer?: string;
  partNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'partNumber' | 'lastModified' | 'customer';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Program API service
 * Handles all program-related API calls
 */
export const programsApi = {
  /**
   * Get all programs with optional filtering
   */
  async getAll(params?: ProgramQueryParams): Promise<ApiResponse<NCProgram[]>> {
    return apiClient.get('/api/programs', params);
  },

  /**
   * Get a single program by ID
   */
  async getById(id: string): Promise<ApiResponse<NCProgram>> {
    return apiClient.get(`/api/programs/${id}`);
  },

  /**
   * Create a new program
   */
  async create(program: Partial<NCProgram>): Promise<ApiResponse<NCProgram>> {
    return apiClient.post('/api/programs', program);
  },

  /**
   * Update an existing program
   */
  async update(id: string, program: Partial<NCProgram>): Promise<ApiResponse<NCProgram>> {
    return apiClient.put(`/api/programs/${id}`, program);
  },

  /**
   * Delete a program
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/programs/${id}`);
  },

  /**
   * Approve or change program status
   */
  async updateStatus(id: string, status: string): Promise<ApiResponse<NCProgram>> {
    return apiClient.post(`/api/programs/${id}/approve`, { status });
  },

  /**
   * Get program version history
   */
  async getVersions(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/api/programs/${id}/versions`);
  },

  /**
   * Get the content of a specific program version
   */
  async getVersionContent(programId: string, versionId: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/api/programs/${programId}/versions/${versionId}/content`);
    if (!res.ok) throw new Error('Kunne ikke hente versionsindhold');
    return await res.text();
  },
};



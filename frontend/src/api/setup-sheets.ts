/**
 * Setup Sheets API service
 * Following Cursor Clause 4.5 Rules
 */

import { apiClient } from './client';
import type { ApiResponse } from './client';
import type { SetupSheet } from '../types';

/**
 * Setup Sheet API service
 * Handles all setup sheet-related API calls
 */
export const setupSheetsApi = {
  /**
   * Get all setup sheets for a program
   */
  async getByProgram(programId: string): Promise<ApiResponse<SetupSheet[]>> {
    return apiClient.get('/api/setup-sheets', { programId });
  },

  /**
   * Get a single setup sheet by ID
   */
  async getById(id: string): Promise<ApiResponse<SetupSheet>> {
    return apiClient.get(`/api/setup-sheets/${id}`);
  },

  /**
   * Create a new setup sheet
   */
  async create(setupSheet: Partial<SetupSheet>): Promise<ApiResponse<SetupSheet>> {
    return apiClient.post('/api/setup-sheets', setupSheet);
  },

  /**
   * Update an existing setup sheet
   */
  async update(id: string, setupSheet: Partial<SetupSheet>): Promise<ApiResponse<SetupSheet>> {
    return apiClient.put(`/api/setup-sheets/${id}`, setupSheet);
  },

  /**
   * Delete a setup sheet
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/setup-sheets/${id}`);
  },

  /**
   * Approve a setup sheet
   */
  async approve(id: string): Promise<ApiResponse<SetupSheet>> {
    return apiClient.post(`/api/setup-sheets/${id}/approve`, { approved: true });
  },

  /**
   * Upload media files for a setup sheet
   */
  async uploadMedia(setupSheetId: string, files: File[]): Promise<ApiResponse<Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    caption: string;
    filename: string;
    size: number;
    mimetype: string;
  }>>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiClient.postFormData(`/api/setup-sheets/${setupSheetId}/upload`, formData);
  },

  /**
   * Delete a media file from setup sheet
   */
  async deleteMedia(setupSheetId: string, mediaId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/setup-sheets/${setupSheetId}/media/${mediaId}`);
  },
};



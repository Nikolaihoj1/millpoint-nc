/**
 * Machines API service
 * Following Cursor Clause 4.5 Rules
 */

import { apiClient } from './client';
import type { ApiResponse } from './client';
import type { Machine } from '../types';

/**
 * Machine query parameters
 */
export interface MachineQueryParams {
  type?: string;
  status?: 'Online' | 'Offline' | 'Maintenance';
  search?: string;
}

/**
 * Machine API service
 * Handles all machine-related API calls
 */
export const machinesApi = {
  /**
   * Get all machines with optional filtering
   */
  async getAll(params?: MachineQueryParams): Promise<ApiResponse<Machine[]>> {
    return apiClient.get('/api/machines', params);
  },

  /**
   * Get a single machine by ID
   */
  async getById(id: string): Promise<ApiResponse<Machine>> {
    return apiClient.get(`/api/machines/${id}`);
  },

  /**
   * Create a new machine
   */
  async create(machine: Partial<Machine>): Promise<ApiResponse<Machine>> {
    return apiClient.post('/api/machines', machine);
  },

  /**
   * Update an existing machine
   */
  async update(id: string, machine: Partial<Machine>): Promise<ApiResponse<Machine>> {
    return apiClient.put(`/api/machines/${id}`, machine);
  },

  /**
   * Delete a machine
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/machines/${id}`);
  },

  /**
   * Update machine status
   */
  async updateStatus(id: string, status: string): Promise<ApiResponse<Machine>> {
    return apiClient.patch(`/api/machines/${id}/status`, { status });
  },
};



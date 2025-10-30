/**
 * Custom hook for machines data fetching
 * Following Cursor Clause 4.5 Rules
 */

import { useState, useEffect } from 'react';
import { machinesApi } from '../api';
import type { MachineQueryParams } from '../api';
import type { Machine } from '../types';

/**
 * Hook for fetching machines with optional filtering
 */
export function useMachines(params?: MachineQueryParams) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await machinesApi.getAll(params);
        
        if (response.success && response.data) {
          setMachines(response.data);
        } else {
          setError(response.error || 'Failed to fetch machines');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch machines');
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, [JSON.stringify(params)]);

  return { machines, loading, error };
}

/**
 * Hook for fetching a single machine by ID
 */
export function useMachine(id: string | null) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchMachine = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await machinesApi.getById(id);
        
        if (response.success && response.data) {
          setMachine(response.data);
        } else {
          setError(response.error || 'Failed to fetch machine');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch machine');
      } finally {
        setLoading(false);
      }
    };

    fetchMachine();
  }, [id]);

  return { machine, loading, error };
}



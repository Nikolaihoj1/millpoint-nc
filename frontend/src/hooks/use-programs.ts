/**
 * Custom hook for programs data fetching
 * Following Cursor Clause 4.5 Rules
 */

import { useState, useEffect } from 'react';
import { programsApi } from '../api';
import type { ProgramQueryParams } from '../api';
import type { NCProgram } from '../types';

/**
 * Hook for fetching programs with filtering and pagination
 */
export function usePrograms(params?: ProgramQueryParams) {
  const [programs, setPrograms] = useState<NCProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await programsApi.getAll(params);
        
        if (response.success && response.data) {
          setPrograms(response.data);
          setMeta(response.meta);
        } else {
          setError(response.error || 'Failed to fetch programs');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [JSON.stringify(params)]);

  return { programs, loading, error, meta };
}

/**
 * Hook for fetching a single program by ID
 */
export function useProgram(id: string | null) {
  const [program, setProgram] = useState<NCProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await programsApi.getById(id);
        
        if (response.success && response.data) {
          setProgram(response.data);
        } else {
          setError(response.error || 'Failed to fetch program');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch program');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  return { program, loading, error };
}



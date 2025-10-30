/**
 * Custom hook for setup sheets data fetching
 * Following Cursor Clause 4.5 Rules
 */

import { useState, useEffect } from 'react';
import { setupSheetsApi } from '../api';
import type { SetupSheet } from '../types';

/**
 * Hook for fetching setup sheets for a program
 */
export function useSetupSheets(programId: string | null) {
  const [setupSheets, setSetupSheets] = useState<SetupSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId) {
      setLoading(false);
      return;
    }

    const fetchSetupSheets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await setupSheetsApi.getByProgram(programId);
        
        if (response.success) {
          // Even if data is empty array, that's OK - just means no setup sheets exist
          setSetupSheets(response.data || []);
        } else {
          // If it's a 404 or empty, that's OK - just means no setup sheets
          if (response.error?.includes('404') || response.error?.includes('not found')) {
            setSetupSheets([]);
          } else {
            setError(response.error || 'Failed to fetch setup sheets');
          }
        }
      } catch (err: any) {
        // If it's a 404, that's OK - just means no setup sheets exist
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          setSetupSheets([]);
        } else {
          setError(err.message || 'Failed to fetch setup sheets');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSetupSheets();
  }, [programId]);

  return { setupSheets, loading, error };
}

/**
 * Hook for fetching a single setup sheet by ID
 */
export function useSetupSheet(id: string | null) {
  const [setupSheet, setSetupSheet] = useState<SetupSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchSetupSheet = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await setupSheetsApi.getById(id);
        
        if (response.success && response.data) {
          setSetupSheet(response.data);
        } else {
          setError(response.error || 'Failed to fetch setup sheet');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch setup sheet');
      } finally {
        setLoading(false);
      }
    };

    fetchSetupSheet();
  }, [id]);

  return { setupSheet, loading, error };
}


'use client';
import { useEffect, useState } from 'react';
export type PersonalState = {
  user: { username: string } | null;
  completed: string[];
  todos: { id: string; title: string; done: boolean }[];
};
const empty: PersonalState = { user: null, completed: [], todos: [] };
export function usePersonal() {
  const [personal, setPersonal] = useState<PersonalState>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/personal', { cache: 'no-store' });
      const data = (await response.json()) as PersonalState & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          data.error ?? 'Unable to load your personal dashboard.',
        );
      setPersonal(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to connect. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as PersonalState & {
        error?: string;
      };
      if (!response.ok) {
        if (response.status === 401 && body.action !== 'login')
          setPersonal(empty);
        throw new Error(data.error ?? 'Unable to save. Please try again.');
      }
      setPersonal(data);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to connect. Please try again.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { personal, loading, busy, error, act, reload: load };
}

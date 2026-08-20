import { useState, useCallback, useRef, useEffect } from 'react';

export function useHistoryState<T>(initialState: T, debounceMs: number = 500) {
  const [state, setState] = useState<T>(initialState);
  const [undoHistory, setUndoHistory] = useState<T[]>([]);
  const [redoHistory, setRedoHistory] = useState<T[]>([]);
  
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedState = useRef<T>(initialState);

  const setWithHistory = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const resolvedState = typeof newState === 'function' ? (newState as Function)(prev) : newState;
      
      if (timer.current) clearTimeout(timer.current);
      
      timer.current = setTimeout(() => {
        if (JSON.stringify(lastSavedState.current) !== JSON.stringify(resolvedState)) {
          setUndoHistory(history => [...history, lastSavedState.current]);
          setRedoHistory([]);
          lastSavedState.current = resolvedState;
        }
      }, debounceMs);
      
      return resolvedState;
    });
  }, [debounceMs]);

  const undo = useCallback(() => {
    setUndoHistory(history => {
      if (history.length === 0) return history;
      const newHistory = [...history];
      const previousState = newHistory.pop()!;
      setRedoHistory(r => [lastSavedState.current, ...r]);
      lastSavedState.current = previousState;
      setState(previousState);
      return newHistory;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoHistory(history => {
      if (history.length === 0) return history;
      const newHistory = [...history];
      const nextState = newHistory.shift()!;
      setUndoHistory(u => [...u, lastSavedState.current]);
      lastSavedState.current = nextState;
      setState(nextState);
      return newHistory;
    });
  }, []);
  
  // Also provide immediate save without debounce
  const saveStateImmediately = useCallback(() => {
    setState(current => {
      if (JSON.stringify(lastSavedState.current) !== JSON.stringify(current)) {
        setUndoHistory(h => [...h, lastSavedState.current]);
        setRedoHistory([]);
        lastSavedState.current = current;
      }
      return current;
    });
  }, []);

  return [state, setWithHistory, { undo, redo, canUndo: undoHistory.length > 0, canRedo: redoHistory.length > 0, saveStateImmediately }] as const;
}

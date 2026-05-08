import { useState, useCallback, useMemo } from 'react';
import type { Note } from '../types/note';
import { loadNotes, saveNotes } from '../utils/storage';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => sortNotes(loadNotes()));
  const [search, setSearch] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || null,
    [notes, activeNoteId]
  );

  const persist = useCallback((next: Note[]) => {
    const sorted = sortNotes(next);
    setNotes(sorted);
    saveNotes(sorted);
  }, []);

  const createNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    persist([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    return newNote.id;
  }, [notes, persist]);

  const updateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
      const next = notes.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: Date.now() }
          : n
      );
      persist(next);
    },
    [notes, persist]
  );

  const deleteNote = useCallback(
    (id: string) => {
      const next = notes.filter((n) => n.id !== id);
      persist(next);
      if (activeNoteId === id) {
        setActiveNoteId(next[0]?.id ?? null);
      }
    },
    [notes, persist, activeNoteId]
  );

  const togglePin = useCallback(
    (id: string) => {
      const next = notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      );
      persist(next);
    },
    [notes, persist]
  );

  const setAllNotes = useCallback(
    (next: Note[]) => {
      persist(next);
      setActiveNoteId(next[0]?.id ?? null);
    },
    [persist]
  );

  return {
    notes,
    filteredNotes,
    activeNote,
    activeNoteId,
    search,
    setSearch,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    setAllNotes,
  };
}

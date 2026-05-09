import { useState } from 'react';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t } = useTranslation();
  const {
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
  } = useNotes();

  const { settings, setSettings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMagicMathOn = settings.magicMath === 'on';
  const isMagicCurrencyOn = settings.magicCurrency === 'on';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const isLiquidGlass = settings.theme === 'liquid-glass';

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteNote = () => {
    if (confirmDelete) {
      deleteNote(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div className={`flex h-full ${isLiquidGlass ? '' : 'bg-base-200'}`}>
      <NoteList
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        search={search}
        sidebarOpen={sidebarOpen}
        onSearchChange={setSearch}
        onSelect={(id) => {
          setActiveNoteId(id);
          setSidebarOpen(false);
        }}
        onCreate={() => {
          createNote();
          setSidebarOpen(false);
        }}
        onDelete={handleDelete}
        onTogglePin={togglePin}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <NoteEditor
        note={activeNote}
        editorMode={settings.editorMode}
        magicMath={isMagicMathOn}
        magicCurrency={isMagicCurrencyOn}
        onUpdate={updateNote}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onCreate={() => {
          createNote();
          setSidebarOpen(false);
        }}
      />

      <SettingsModal
        open={settingsOpen}
        notes={notes}
        theme={settings.theme}
        editorMode={settings.editorMode}
        magicMath={settings.magicMath}
        magicCurrency={settings.magicCurrency}
        onThemeChange={(theme) => setSettings({ theme })}
        onEditorModeChange={(editorMode) => setSettings({ editorMode })}
        onMagicMathChange={(magicMath) => setSettings({ magicMath })}
        onMagicCurrencyChange={(magicCurrency) => setSettings({ magicCurrency })}
        onImport={setAllNotes}
        onClose={() => setSettingsOpen(false)}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title={t('deleteNote')}
        message={t('deleteConfirm')}
        confirmText={t('delete')}
        onConfirm={confirmDeleteNote}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

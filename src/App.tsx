import { useState } from 'react';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { useTranslation } from 'react-i18next';
import { FileText, PenLine, Settings } from 'lucide-react';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  const isLiquidGlass = settings.theme === 'liquid-glass';

  const handleDelete = (id: string) => setConfirmDelete(id);

  const confirmDeleteNote = () => {
    if (confirmDelete) {
      deleteNote(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleNoteSelect = (id: string) => {
    setActiveNoteId(id);
    setMobileView('editor');
  };

  const handleCreate = () => {
    createNote();
    setMobileView('editor');
  };

  return (
    <div className={`flex h-full overflow-hidden ${isLiquidGlass ? '' : 'bg-base-200'}`}>
      <NoteList
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        search={search}
        mobileView={mobileView}
        onSearchChange={setSearch}
        onSelect={handleNoteSelect}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onTogglePin={togglePin}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <NoteEditor
        note={activeNote}
        editorMode={settings.editorMode}
        magicFeatures={settings.magicFeatures}
        mobileView={mobileView}
        onUpdate={updateNote}
        onCreate={handleCreate}
      />

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-base-100/95 backdrop-blur-sm border-t border-base-300/30 flex">
        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
            mobileView === 'list' ? 'text-primary' : 'text-base-content/40'
          }`}
          onClick={() => setMobileView('list')}
        >
          <FileText size={19} />
          <span>Notes</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
            mobileView === 'editor' ? 'text-primary' : 'text-base-content/40'
          }`}
          onClick={() => setMobileView('editor')}
        >
          <PenLine size={19} />
          <span>{t('editor')}</span>
        </button>
        <button
          className="flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-base-content/40 transition-colors"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={19} />
          <span>{t('settings')}</span>
        </button>
      </nav>

      <SettingsModal
        open={settingsOpen}
        notes={notes}
        theme={settings.theme}
        editorMode={settings.editorMode}
        magicFeatures={settings.magicFeatures}
        onThemeChange={(theme) => setSettings({ theme })}
        onEditorModeChange={(editorMode) => setSettings({ editorMode })}
        onMagicFeaturesChange={(magicFeatures) => setSettings({ magicFeatures })}
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

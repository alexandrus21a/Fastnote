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
    notes, filteredNotes, activeNote, activeNoteId, search,
    setSearch, setActiveNoteId, createNote, updateNote, deleteNote, togglePin, setAllNotes,
  } = useNotes();
  const { settings, setSettings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  const isLiquidGlass = settings.theme === 'liquid-glass';
  const isWin96 = settings.theme === 'win96';

  const handleDelete = (id: string) => setConfirmDelete(id);
  const confirmDeleteNote = () => {
    if (confirmDelete) { deleteNote(confirmDelete); setConfirmDelete(null); }
  };
  const handleNoteSelect = (id: string) => { setActiveNoteId(id); setMobileView('editor'); };
  const handleCreate = () => { createNote(); setMobileView('editor'); };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${!isLiquidGlass ? 'bg-base-200' : ''}`}>

      {/* Win96 global title bar + menu bar */}
      {isWin96 && (
        <div className="shrink-0" style={{ fontFamily: 'Tahoma, "MS Sans Serif", sans-serif' }}>
          <div className="flex items-center h-[22px] px-1.5"
               style={{ background: 'linear-gradient(90deg,#000080 0%,#1084d0 100%)' }}>
            <span className="text-[11px] font-bold text-white flex-1 select-none">
              📝 Fastnote
            </span>
            {['-', '□', '×'].map((c) => (
              <button
                key={c}
                className="w-[18px] h-[14px] text-[9px] text-black flex items-center justify-center ml-px select-none"
                style={{ background: '#c0c0c0', border: '1.5px outset #dfdfdf', fontWeight: 'bold' }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center h-[21px] px-1 text-[11px] select-none"
               style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}>
            {['File', 'Edit', 'View', 'Help'].map((m) => (
              <button
                key={m}
                className="px-2 h-full hover:bg-[#000080] hover:text-white"
                style={{ color: 'black' }}
              >
                <u>{m[0]}</u>{m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content row */}
      <div className={`flex flex-1 min-w-0 overflow-hidden ${isLiquidGlass ? 'p-2.5 gap-2.5' : ''}`}>
        <NoteList
          notes={filteredNotes}
          activeNoteId={activeNoteId}
          search={search}
          mobileView={mobileView}
          theme={settings.theme}
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
          theme={settings.theme}
          onUpdate={updateNote}
          onCreate={handleCreate}
        />
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-base-100/95 backdrop-blur-sm border-t border-base-300/30 flex">
        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${mobileView === 'list' ? 'text-primary' : 'text-base-content/40'}`}
          onClick={() => setMobileView('list')}
        >
          <FileText size={19} /><span>Notes</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${mobileView === 'editor' ? 'text-primary' : 'text-base-content/40'}`}
          onClick={() => setMobileView('editor')}
        >
          <PenLine size={19} /><span>{t('editor')}</span>
        </button>
        <button
          className="flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-base-content/40 transition-colors"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={19} /><span>{t('settings')}</span>
        </button>
      </nav>

      <SettingsModal
        open={settingsOpen} notes={notes} theme={settings.theme}
        editorMode={settings.editorMode} magicFeatures={settings.magicFeatures}
        onThemeChange={(theme) => setSettings({ theme })}
        onEditorModeChange={(editorMode) => setSettings({ editorMode })}
        onMagicFeaturesChange={(magicFeatures) => setSettings({ magicFeatures })}
        onImport={setAllNotes}
        onClose={() => setSettingsOpen(false)}
      />
      <ConfirmModal
        open={!!confirmDelete}
        title={t('deleteNote')} message={t('deleteConfirm')} confirmText={t('delete')}
        onConfirm={confirmDeleteNote} onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

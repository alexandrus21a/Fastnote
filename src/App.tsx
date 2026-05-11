import { useState, useMemo } from 'react';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CommandPalette, type PaletteCommand } from './components/CommandPalette';
import { useTranslation } from 'react-i18next';
import { FileText, PenLine, Settings, Plus, Search, PanelLeft } from 'lucide-react';

export default function App() {
  const { t } = useTranslation();
  const {
    notes, filteredNotes, activeNote, activeNoteId, search,
    setSearch, setActiveNoteId, createNote, updateNote, deleteNote, togglePin, setAllNotes,
  } = useNotes();
  const { settings, setSettings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [focusSearchTrigger, setFocusSearchTrigger] = useState(0);

  const isLiquidGlass = settings.theme === 'liquid-glass';
  const isWin96 = settings.theme === 'win96';
  const isHacker = settings.theme === 'hacker';

  const handleDelete = (id: string) => setConfirmDelete(id);
  const confirmDeleteNote = () => {
    if (confirmDelete) { deleteNote(confirmDelete); setConfirmDelete(null); }
  };
  const handleNoteSelect = (id: string) => { setActiveNoteId(id); setMobileView('editor'); };
  const handleCreate = () => { createNote(); setMobileView('editor'); };

  const focusSearch = () => { setMobileView('list'); setFocusSearchTrigger((n) => n + 1); };

  const paletteCommands = useMemo<PaletteCommand[]>(() => [
    { id: 'new-note',      label: 'New Note',        description: 'Create a new note',                   shortcut: ['Ctrl', 'N'], icon: <Plus size={14} />,     action: handleCreate },
    { id: 'focus-search',  label: 'Focus Search',    description: 'Jump to the note search field',       shortcut: ['Ctrl', '/'], icon: <Search size={14} />,   action: focusSearch },
    { id: 'toggle-sidebar',label: 'Toggle Sidebar',  description: 'Switch between list and editor views', shortcut: ['Ctrl', 'B'], icon: <PanelLeft size={14} />, action: () => setMobileView((v) => v === 'list' ? 'editor' : 'list') },
    { id: 'settings',      label: 'Open Settings',   description: 'Open the settings panel',             shortcut: ['Ctrl', ','], icon: <Settings size={14} />, action: () => setSettingsOpen(true) },
  ], []);  // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboardShortcuts(useMemo(() => [
    { key: 'n', ctrl: true, handler: handleCreate },
    { key: 'k', ctrl: true, handler: () => setPaletteOpen(true) },
    { key: ',', ctrl: true, handler: () => setSettingsOpen(true) },
    { key: '/', ctrl: true, handler: focusSearch },
    { key: 'b', ctrl: true, handler: () => setMobileView((v) => v === 'list' ? 'editor' : 'list') },
  ], []));  // eslint-disable-line react-hooks/exhaustive-deps

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
          focusSearchTrigger={focusSearchTrigger}
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
      {isWin96 ? (
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex"
          style={{ background: '#c0c0c0', borderTop: '2px outset #dfdfdf', fontFamily: 'Tahoma, "MS Sans Serif", sans-serif' }}
        >
          {([
            { label: 'Notes', icon: '📁', view: 'list' as const },
            { label: 'Editor', icon: '📝', view: 'editor' as const },
          ]).map(({ label, icon, view }) => (
            <button
              key={view}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px]"
              style={{
                color: mobileView === view ? '#000080' : '#000',
                fontWeight: mobileView === view ? 'bold' : 'normal',
                borderRight: '1px solid #808080',
              }}
              onClick={() => setMobileView(view)}
            >
              <span className="text-[18px] leading-none">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
          <button
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px]"
            style={{ color: '#000' }}
            onClick={() => setSettingsOpen(true)}
          >
            <span className="text-[18px] leading-none">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>
      ) : isHacker ? (
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex"
          style={{ background: '#0d0c0c', borderTop: '1px solid #393836', fontFamily: '"Courier New", monospace' }}
        >
          {([
            { label: '[ls]', view: 'list' as const },
            { label: '[vim]', view: 'editor' as const },
          ]).map(({ label, view }) => (
            <button
              key={view}
              className="flex-1 py-3 text-[12px] font-bold transition-colors"
              style={{ color: mobileView === view ? '#87a987' : '#625e5a' }}
              onClick={() => setMobileView(view)}
            >
              {label}
            </button>
          ))}
          <button
            className="flex-1 py-3 text-[12px] transition-colors"
            style={{ color: '#625e5a' }}
            onClick={() => setSettingsOpen(true)}
          >
            [cfg]
          </button>
        </nav>
      ) : (
        <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t flex ${isLiquidGlass ? 'border-white/30' : 'border-base-300/30'}`}
             style={isLiquidGlass ? { background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } : { background: 'var(--color-base-100)', backdropFilter: 'blur(8px)' }}
        >
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
      )}

      <CommandPalette
        open={paletteOpen}
        commands={paletteCommands}
        onClose={() => setPaletteOpen(false)}
      />
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

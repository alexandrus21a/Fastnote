import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Download, Upload, FileJson, Palette, Type, Settings,
  Code, FileText, Languages, Sparkles, TriangleAlert,
  Info, CheckCircle2, AlertCircle, Lock, File, Keyboard,
  Plus, Search, PanelLeft, Command,
} from 'lucide-react';
import type { Note } from '../types/note';
import type { AppTheme, EditorMode } from '../hooks/useSettings';
import { encryptData, decryptData, type EncryptedBundle } from '../utils/crypto';

interface SettingsModalProps {
  open: boolean;
  notes: Note[];
  theme: AppTheme;
  editorMode: EditorMode;
  magicFeatures: boolean;
  onThemeChange: (theme: AppTheme) => void;
  onEditorModeChange: (mode: EditorMode) => void;
  onMagicFeaturesChange: (enabled: boolean) => void;
  onImport: (notes: Note[]) => void;
  onClose: () => void;
}

type TabKey = 'appearance' | 'editor' | 'data' | 'shortcuts';

const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'editor', label: 'Editor', icon: Type },
  { key: 'data', label: 'Data', icon: FileJson },
  { key: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
];

const SHORTCUT_ROWS: { icon: React.ReactNode; label: string; description: string; keys: string[] }[] = [
  { icon: <Plus size={13} />, label: 'New Note', description: 'Create a new note', keys: ['Ctrl', 'N'] },
  { icon: <Command size={13} />, label: 'Command Palette', description: 'Search and run any command', keys: ['Ctrl', 'K'] },
  { icon: <Search size={13} />, label: 'Focus Search', description: 'Jump to the note search field', keys: ['Ctrl', '/'] },
  { icon: <PanelLeft size={13} />, label: 'Toggle Sidebar', description: 'Switch between list and editor', keys: ['Ctrl', 'B'] },
  { icon: <Settings size={13} />, label: 'Open Settings', description: 'Open this settings panel', keys: ['Ctrl', ','] },
];

interface StandardTheme {
  value: AppTheme;
  label: string;
  dots: string[];
}

const STANDARD_THEMES: StandardTheme[] = [
  { value: 'light',  label: 'Light',  dots: ['#f3f4f6', '#e05454', '#1f2937'] },
  { value: 'dark',   label: 'Dark',   dots: ['#1e1e2e', '#f87171', '#e2e8f0'] },
  { value: 'pink',   label: 'Pink',   dots: ['#fdf2f8', '#ec4899', '#4a044e'] },
  { value: 'forest', label: 'Forest', dots: ['#0f1a12', '#22c55e', '#bbf7d0'] },
  { value: 'luxury', label: 'Luxury', dots: ['#09090b', '#d97706', '#fef3c7'] },
];

function LiquidGlassPreview() {
  return (
    <div className="relative overflow-hidden rounded-lg h-full bg-gradient-to-br from-sky-100 via-white to-slate-100">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%,rgba(147,197,253,.4) 0%,transparent 60%),radial-gradient(circle at 70% 70%,rgba(196,181,253,.3) 0%,transparent 60%)' }} />
      <div className="absolute inset-2.5 rounded-lg border border-white/70 shadow-md flex flex-col gap-1.5 p-2" style={{ background: 'rgba(255,255,255,.52)', backdropFilter: 'blur(12px)' }}>
        <div className="h-1.5 rounded-full bg-slate-300/60 w-3/4" />
        <div className="h-1 rounded-full bg-slate-200/60 w-1/2" />
        <div className="mt-auto flex gap-1">
          <div className="h-4 rounded-md px-2 flex items-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)', boxShadow: '0 2px 8px rgba(59,130,246,.4)' }}>
            <div className="w-3 h-0.5 rounded-full bg-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Win96Preview() {
  return (
    <div className="h-full rounded-lg overflow-hidden bg-[#c0c0c0]" style={{ fontFamily: 'Tahoma, "MS Sans Serif", sans-serif' }}>
      <div className="h-5 flex items-center px-1.5 gap-1" style={{ background: 'linear-gradient(90deg,#000080,#1084d0)' }}>
        <span className="text-white text-[9px] font-bold flex-1 truncate">📝 Fastnote</span>
        <div className="flex gap-px">
          {['_', '□', '×'].map((c) => (
            <div key={c} className="w-3.5 h-3.5 bg-[#c0c0c0] flex items-center justify-center text-[9px] text-black" style={{ border: '1px outset #dfdfdf' }}>{c}</div>
          ))}
        </div>
      </div>
      <div className="p-1.5 flex flex-col gap-1">
        <div className="bg-white h-5 text-[9px] text-black flex items-center px-1 truncate" style={{ border: '2px inset #808080' }}>My Note...</div>
        <div className="flex gap-1">
          {['OK', 'Cancel'].map(l => (
            <div key={l} className="bg-[#c0c0c0] text-[9px] text-black px-2 py-0.5 flex items-center" style={{ border: '2px outset #dfdfdf' }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HackerPreview() {
  return (
    <div className="h-full rounded-lg overflow-hidden bg-[#0d0c0c] relative p-2" style={{ fontFamily: '"Courier New", monospace' }}>
      <div className="text-[9px] leading-[1.5] space-y-px">
        <div style={{ color: '#c5c9c5' }}>vim <span style={{ color: '#87a987' }}>note.md</span></div>
        <div style={{ color: '#87a987' }}>{'-- INSERT --'}</div>
        <div style={{ color: '#c5c9c5' }}>12*8=<span style={{ color: '#87a987', fontWeight: 700 }}>96</span></div>
        <div className="flex items-center gap-1">
          <span className="px-1 text-[8px] font-bold" style={{ background: '#87a987', color: '#0d0c0c' }}>INSERT</span>
          <span style={{ color: '#87a987' }}>note.md</span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-25" style={{ background: 'repeating-linear-gradient(0deg,rgba(0,0,0,.15),rgba(0,0,0,.15) 1px,transparent 1px,transparent 2px)' }} />
    </div>
  );
}

interface CustomThemeDef {
  value: AppTheme;
  label: string;
  description: string;
  preview: React.ReactNode;
}

const CUSTOM_THEMES: CustomThemeDef[] = [
  { value: 'liquid-glass', label: 'Liquid Glass', description: 'Frosted glass, soft gradients', preview: <LiquidGlassPreview /> },
  { value: 'win96', label: 'Win 96', description: 'Windows 95/96 retro', preview: <Win96Preview /> },
  { value: 'hacker', label: 'Hacker', description: 'Kanagawa Dragon · terminal, CRT scanlines', preview: <HackerPreview /> },
];

export function SettingsModal({
  open, notes, theme, editorMode, magicFeatures,
  onThemeChange, onEditorModeChange, onMagicFeaturesChange, onImport, onClose,
}: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<TabKey>('appearance');

  // Export state
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Import state — two-step: pick file → enter password
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setExportPassphrase(''); setExportStatus(null); setExportError(null); setExportLoading(false);
    setPendingFile(null); setImportPassphrase(''); setImportStatus(null); setImportError(null); setImportLoading(false);
    onClose();
  };

  const handleExport = async () => {
    if (!exportPassphrase) { setExportError(t('enterPassphrase')); return; }
    setExportError(null); setExportLoading(true); setExportStatus(null);
    try {
      const bundle = await encryptData(notes, exportPassphrase);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fastnote-backup-${new Date().toISOString().slice(0, 10)}.fastnote`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus(t('exportSuccess'));
      setExportPassphrase('');
    } catch { setExportError(t('encryptionFailed')); }
    setExportLoading(false);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImportPassphrase('');
    setImportStatus(null);
    setImportError(null);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!pendingFile || !importPassphrase) { setImportError(t('enterPassphrase')); return; }
    setImportError(null); setImportLoading(true); setImportStatus(null);
    try {
      const text = await pendingFile.text();
      const bundle: EncryptedBundle = JSON.parse(text);
      const imported = await decryptData<Note[]>(bundle, importPassphrase);
      if (!Array.isArray(imported)) throw new Error('Invalid');
      onImport(imported);
      setImportStatus(t('importSuccess', { count: imported.length }));
      setPendingFile(null);
      setImportPassphrase('');
    } catch { setImportError(t('decryptionFailed')); }
    setImportLoading(false);
  };

  if (!open) return null;

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-base-content/90">{label}</div>
        {description && <div className="text-xs text-base-content/40 mt-0.5 leading-relaxed">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-base-300'}`}
        role="switch" aria-checked={checked}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="text-[11px] font-bold tracking-widest uppercase text-base-content/30">{title}</h4>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />

      <div className="absolute top-0 right-0 h-full w-full sm:w-[480px] bg-base-100 shadow-2xl flex flex-col drawer-enter">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={17} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">{t('settings')}</h2>
              <p className="text-[11px] text-base-content/40">Fastnote</p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost min-h-8 h-8 w-8" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300/40 px-4 gap-1 shrink-0">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                tab === tb.key ? 'border-primary text-primary' : 'border-transparent text-base-content/45 hover:text-base-content/70'
              }`}
            >
              <tb.icon size={13} />{tb.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-7">

          {/* ── APPEARANCE ───────────────────────────────────────────────── */}
          {tab === 'appearance' && (
            <>
              <Section title={t('language') || 'Language'}>
                <div className="flex p-1 bg-base-200/60 rounded-xl gap-1">
                  {(['en', 'ru'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => i18n.changeLanguage(lang)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${i18n.language === lang ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/50 hover:text-base-content'}`}
                    >
                      <Languages size={14} />
                      {lang === 'en' ? 'English' : 'Русский'}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={t('theme') || 'Themes'}>
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_THEMES.map((th) => {
                    const active = theme === th.value;
                    return (
                      <button
                        key={th.value}
                        onClick={() => onThemeChange(th.value)}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all border ${active ? 'bg-primary/8 border-primary/35 shadow-sm' : 'bg-base-200/40 border-transparent hover:bg-base-200/80 hover:border-base-300/40'}`}
                      >
                        <div className="flex gap-px shrink-0">
                          {th.dots.map((color, i) => (
                            <span key={i} className="block rounded-full" style={{ width: i === 0 ? 16 : 10, height: i === 0 ? 16 : 10, background: color, border: '1.5px solid rgba(0,0,0,.08)', marginTop: i === 0 ? 0 : 3 }} />
                          ))}
                        </div>
                        <span className={`text-[13px] font-medium flex-1 ${active ? 'text-primary' : 'text-base-content/80'}`}>{th.label}</span>
                        {active && <CheckCircle2 size={13} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Custom Themes">
                <div className="space-y-2">
                  {CUSTOM_THEMES.map((th) => {
                    const active = theme === th.value;
                    return (
                      <button
                        key={th.value}
                        onClick={() => onThemeChange(th.value)}
                        className={`w-full flex items-stretch gap-3 rounded-xl overflow-hidden text-left transition-all border-2 ${active ? 'border-primary shadow-md' : 'border-transparent hover:border-base-300/60'}`}
                      >
                        <div className="w-28 h-20 shrink-0">{th.preview}</div>
                        <div className="flex-1 flex flex-col justify-center py-2 pr-3">
                          <div className={`text-[14px] font-semibold leading-tight ${active ? 'text-primary' : 'text-base-content/85'}`}>{th.label}</div>
                          <div className="text-[12px] text-base-content/40 mt-0.5 leading-snug">{th.description}</div>
                          {active && <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary font-medium"><CheckCircle2 size={11} />Active</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            </>
          )}

          {/* ── EDITOR ───────────────────────────────────────────────────── */}
          {tab === 'editor' && (
            <>
              <Section title={t('editorMode') || 'Editor Mode'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {([
                    { mode: 'markdown' as EditorMode, Icon: Code, label: 'Markdown', desc: t('markdownDesc') },
                    { mode: 'simple' as EditorMode, Icon: FileText, label: t('simpleNote'), desc: t('simpleDesc') },
                  ]).map(({ mode, Icon, label, desc }) => (
                    <button
                      key={mode}
                      onClick={() => onEditorModeChange(mode)}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${editorMode === mode ? 'bg-primary/8 border-primary/30 shadow-sm' : 'bg-base-200/40 border-transparent hover:bg-base-200'}`}
                    >
                      <Icon size={18} className={editorMode === mode ? 'text-primary' : 'text-base-content/50'} />
                      <div>
                        <div className={`text-sm font-semibold ${editorMode === mode ? 'text-primary' : 'text-base-content/90'}`}>{label}</div>
                        <div className="text-[11px] text-base-content/40 mt-0.5 leading-relaxed">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={t('magicFeatures') || 'Magic Features'}>
                <div className="bg-base-200/30 rounded-xl p-4">
                  <Toggle checked={magicFeatures} onChange={onMagicFeaturesChange} label={t('magicFeatures')} description={t('magicFeaturesDesc')} />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-base-content/30 px-1">
                  {['1+1= → 2', '100$+2€=', '15km+3mi='].map((ex) => (
                    <span key={ex} className="inline-flex items-center gap-1 bg-base-200/50 px-2 py-1 rounded-md">
                      <Sparkles size={10} /> {ex}
                    </span>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── SHORTCUTS ───────────────────────────────────────────────── */}
          {tab === 'shortcuts' && (
            <Section title="Keyboard Shortcuts">
              <div className="space-y-1">
                {SHORTCUT_ROWS.map(({ icon, label, description, keys }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-base-200/30 hover:bg-base-200/60 transition-colors"
                  >
                    <span className="text-base-content/35 shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-base-content/85 leading-tight">{label}</div>
                      <div className="text-[11px] text-base-content/35 mt-0.5">{description}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-0.5">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="inline-flex items-center justify-center px-2 py-1 text-[11px] font-mono font-medium bg-base-100 border border-base-300/60 rounded-md text-base-content/50 shadow-sm leading-none"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-base-content/30 px-1 pt-1">
                On macOS, use <kbd className="font-mono text-[10px] px-1 py-0.5 bg-base-200 border border-base-300/50 rounded">⌘</kbd> instead of <kbd className="font-mono text-[10px] px-1 py-0.5 bg-base-200 border border-base-300/50 rounded">Ctrl</kbd>.
              </p>
            </Section>
          )}

          {/* ── DATA ─────────────────────────────────────────────────────── */}
          {tab === 'data' && (
            <>
              {/* Export */}
              <Section title={t('export') || 'Export Backup'}>
                <div className="rounded-xl border border-base-300/40 bg-base-200/20 p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-base-content/40">
                    <Info size={13} className="shrink-0 mt-0.5 text-info" />
                    <span>{t('exportingNotes', { count: notes.length })}</span>
                  </div>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                    <input
                      type="password"
                      className="w-full h-10 pl-9 pr-3 rounded-lg text-sm outline-none bg-base-100 border border-base-300/50 focus:border-primary/40 transition-colors"
                      placeholder={t('enterPassphrase')}
                      value={exportPassphrase}
                      onChange={(e) => setExportPassphrase(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExport()}
                    />
                  </div>
                  <p className="text-[11px] text-base-content/35">{t('passphraseExportHint')}</p>
                  <button
                    className="btn btn-primary w-full h-10 rounded-xl text-sm"
                    onClick={handleExport}
                    disabled={exportLoading}
                  >
                    {exportLoading ? <span className="loading loading-spinner loading-xs" /> : <Download size={15} />}
                    {exportLoading ? t('encrypting') : `${t('downloadBackup')}`}
                  </button>
                  {exportStatus && (
                    <div className="flex items-center gap-2 text-sm text-success bg-success/8 px-3 py-2 rounded-lg border border-success/20">
                      <CheckCircle2 size={14} className="shrink-0" />{exportStatus}
                    </div>
                  )}
                  {exportError && (
                    <div className="flex items-center gap-2 text-sm text-error bg-error/8 px-3 py-2 rounded-lg border border-error/20">
                      <AlertCircle size={14} className="shrink-0" />{exportError}
                    </div>
                  )}
                </div>
              </Section>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-base-300/40" />
                <span className="text-[11px] text-base-content/30 font-medium uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-base-300/40" />
              </div>

              {/* Import */}
              <Section title={t('import') || 'Import Backup'}>
                <div className="rounded-xl border border-base-300/40 bg-base-200/20 p-4 space-y-3">
                  <input ref={fileInputRef} type="file" accept=".fastnote,.json" className="hidden" onChange={handleFilePick} />

                  {!pendingFile ? (
                    <button
                      className="btn btn-outline w-full h-10 rounded-xl text-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={15} />
                      {t('chooseFile')}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* File badge */}
                      <div className="flex items-center gap-2 bg-base-100 border border-base-300/50 rounded-lg px-3 py-2">
                        <File size={14} className="text-primary shrink-0" />
                        <span className="text-[13px] text-base-content/80 flex-1 min-w-0 truncate">{pendingFile.name}</span>
                        <button
                          className="text-base-content/30 hover:text-base-content/60 transition-colors"
                          onClick={() => { setPendingFile(null); setImportPassphrase(''); setImportError(null); }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                      {/* Passphrase */}
                      <div className="relative">
                        <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
                        <input
                          type="password"
                          className="w-full h-10 pl-9 pr-3 rounded-lg text-sm outline-none bg-base-100 border border-base-300/50 focus:border-primary/40 transition-colors"
                          placeholder={t('enterPassphrase')}
                          value={importPassphrase}
                          onChange={(e) => setImportPassphrase(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-base-content/35">{t('passphraseImportHint')}</p>
                      <button
                        className="btn btn-primary w-full h-10 rounded-xl text-sm"
                        onClick={handleImport}
                        disabled={importLoading}
                      >
                        {importLoading ? <span className="loading loading-spinner loading-xs" /> : <Download size={15} />}
                        {importLoading ? t('decrypting') : 'Decrypt & Import'}
                      </button>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-[11px] text-base-content/40 bg-warning/8 px-3 py-2 rounded-lg border border-warning/20">
                    <TriangleAlert size={12} className="shrink-0 mt-px text-warning" />
                    <span>{t('importWarning')}</span>
                  </div>

                  {importStatus && (
                    <div className="flex items-center gap-2 text-sm text-success bg-success/8 px-3 py-2 rounded-lg border border-success/20">
                      <CheckCircle2 size={14} className="shrink-0" />{importStatus}
                    </div>
                  )}
                  {importError && (
                    <div className="flex items-center gap-2 text-sm text-error bg-error/8 px-3 py-2 rounded-lg border border-error/20">
                      <AlertCircle size={14} className="shrink-0" />{importError}
                    </div>
                  )}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

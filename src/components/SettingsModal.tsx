import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Upload, Lock, FileJson, Palette, Type, Settings, Sparkles, Monitor, Terminal } from 'lucide-react';
import type { Note } from '../types/note';
import type { AppTheme, EditorMode, MagicMathMode } from '../hooks/useSettings';
import { encryptData, decryptData, type EncryptedBundle } from '../utils/crypto';

interface SettingsModalProps {
  open: boolean;
  notes: Note[];
  theme: AppTheme;
  editorMode: EditorMode;
  magicMath: MagicMathMode;
  onThemeChange: (theme: AppTheme) => void;
  onEditorModeChange: (mode: EditorMode) => void;
  onMagicMathChange: (mode: MagicMathMode) => void;
  onImport: (notes: Note[]) => void;
  onClose: () => void;
}

const THEMES: { value: AppTheme; label: string; group: string; icon: typeof Sparkles }[] = [
  { value: 'light', label: 'Light', group: 'Default', icon: Sparkles },
  { value: 'dark', label: 'Dark', group: 'Default', icon: Sparkles },
  { value: 'pink', label: 'Pink', group: 'DaisyUI', icon: Sparkles },
  { value: 'forest', label: 'Forest', group: 'DaisyUI', icon: Sparkles },
  { value: 'luxury', label: 'Luxury', group: 'DaisyUI', icon: Sparkles },
  { value: 'liquid-glass', label: 'Liquid Glass', group: 'Custom', icon: Monitor },
  { value: 'win96', label: 'Win 96', group: 'Custom', icon: Monitor },
  { value: 'hacker', label: 'Hacker', group: 'Custom', icon: Terminal },
];

export function SettingsModal({
  open,
  notes,
  theme,
  editorMode,
  magicMath,
  onThemeChange,
  onEditorModeChange,
  onMagicMathChange,
  onImport,
  onClose,
}: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<'appearance' | 'editor' | 'data'>('appearance');
  const [passphrase, setPassphrase] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setPassphrase(''); setStatus(null); setError(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleExport = async () => {
    if (!passphrase) { setError(t('enterPassphrase')); return; }
    setError(null); setStatus(t('encrypting'));
    try {
      const bundle = await encryptData(notes, passphrase);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fastnote-backup-${new Date().toISOString().slice(0, 10)}.fastnote`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(t('exportSuccess'));
    } catch { setError(t('encryptionFailed')); setStatus(null); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!passphrase) { setError(t('enterPassphrase')); return; }
    setError(null); setStatus(t('decrypting'));
    try {
      const text = await file.text();
      const bundle: EncryptedBundle = JSON.parse(text);
      const imported = await decryptData<Note[]>(bundle, passphrase);
      if (!Array.isArray(imported)) throw new Error('Invalid');
      onImport(imported);
      setStatus(t('importSuccess', { count: imported.length }));
    } catch { setError(t('decryptionFailed')); setStatus(null); }
  };

  if (!open) return null;

  const tabButton = (key: typeof tab, Icon: typeof Palette, label: string) => (
    <button
      onClick={() => setTab(key)}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
        tab === key
          ? 'bg-primary text-primary-content shadow-md shadow-primary/25'
          : 'hover:bg-base-200 text-base-content/60'
      }`}
    >
      <Icon size={14} />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="modal-enter glass-panel-strong rounded-3xl w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
          <h3 className="text-lg font-bold flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={16} className="text-primary" />
            </div>
            {t('settings') || 'Settings'}
          </h3>
          <button className="btn btn-sm btn-circle btn-ghost min-h-8 h-8 w-8" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-1.5">
          {tabButton('appearance', Palette, t('appearance') || 'Appearance')}
          {tabButton('editor', Type, t('editor') || 'Editor')}
          {tabButton('data', FileJson, t('data') || 'Data')}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {tab === 'appearance' && (
            <>
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  {t('language') || 'Language'}
                </label>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-sm flex-1 rounded-xl ${i18n.language === 'en' ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                    onClick={() => i18n.changeLanguage('en')}
                  >
                    English
                  </button>
                  <button
                    className={`btn btn-sm flex-1 rounded-xl ${i18n.language === 'ru' ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                    onClick={() => i18n.changeLanguage('ru')}
                  >
                    Русский
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  {t('theme') || 'Theme'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEMES.map((th) => {
                    const Icon = th.icon;
                    return (
                      <button
                        key={th.value}
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-left text-sm transition-all ${
                          theme === th.value
                            ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                            : 'bg-base-200 hover:bg-base-300'
                        }`}
                        onClick={() => onThemeChange(th.value)}
                      >
                        <Icon size={15} className="shrink-0 opacity-70" />
                        <span className="font-medium">{th.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'editor' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  {t('editorMode') || 'Default Editor Mode'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className={`btn btn-sm flex-1 rounded-xl ${editorMode === 'markdown' ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                    onClick={() => onEditorModeChange('markdown')}
                  >
                    Markdown
                  </button>
                  <button
                    className={`btn btn-sm flex-1 rounded-xl ${editorMode === 'simple' ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                    onClick={() => onEditorModeChange('simple')}
                  >
                    {t('simpleNote') || 'Simple Note'}
                  </button>
                </div>
                <p className="text-xs text-base-content/40 leading-relaxed">
                  {editorMode === 'markdown'
                    ? (t('markdownDesc') || 'Full markdown support with preview, toolbar, and formatting.')
                    : (t('simpleDesc') || 'Plain text editor without markdown features.')}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest uppercase text-base-content/40">
                  {t('magicMath') || 'Magic Math'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className={`btn btn-sm flex-1 rounded-xl ${magicMath === 'on' ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                    onClick={() => onMagicMathChange('on')}
                  >
                    {t('on') || 'On'}
                  </button>
                  <button
                    className={`btn btn-sm flex-1 rounded-xl ${magicMath === 'off' ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                    onClick={() => onMagicMathChange('off')}
                  >
                    {t('off') || 'Off'}
                  </button>
                </div>
                <p className="text-xs text-base-content/40 leading-relaxed">
                  {t('magicMathDesc') || 'Type "1+1=" and the result "2" appears automatically.'}
                </p>
              </div>
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text text-sm font-medium flex items-center gap-1.5">
                    <Lock size={13} /> {t('passphrase')}
                  </span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full h-10 rounded-xl text-sm"
                  placeholder={t('enterPassphrase')}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </div>

              <div className="alert alert-info text-sm rounded-xl">
                <FileJson size={16} />
                <span>{t('exportingNotes', { count: notes.length })}</span>
              </div>

              <button className="btn btn-primary w-full rounded-xl" onClick={handleExport}>
                <Download size={16} className="mr-1.5" /> {t('downloadBackup')}
              </button>

              <div className="divider text-xs text-base-content/30">{t('or') || 'or'}</div>

              <input ref={fileInputRef} type="file" accept=".fastnote,.json" className="hidden" onChange={handleFileSelect} />
              <button className="btn btn-outline w-full rounded-xl" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-1.5" /> {t('chooseFile')}
              </button>
              <div className="alert alert-warning text-sm rounded-xl">
                <span>{t('importWarning')}</span>
              </div>

              {error && <div className="alert alert-error text-sm rounded-xl">{error}</div>}
              {status && <div className="alert alert-success text-sm rounded-xl">{status}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

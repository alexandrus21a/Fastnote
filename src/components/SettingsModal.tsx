import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Download, Upload, FileJson, Palette, Type, Settings,
  Code, FileText, Languages, Sparkles, TriangleAlert,
  Info, CheckCircle2, AlertCircle,
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

type TabKey = 'appearance' | 'editor' | 'data';

const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'editor', label: 'Editor', icon: Type },
  { key: 'data', label: 'Data', icon: FileJson },
];

const THEMES: {
  value: AppTheme;
  label: string;
  group: string;
  previewClass: string;
  previewDot?: string;
}[] = [
  { value: 'light', label: 'Light', group: 'Default', previewClass: 'bg-white border-gray-200' },
  { value: 'dark', label: 'Dark', group: 'Default', previewClass: 'bg-gray-900 border-gray-700' },
  { value: 'pink', label: 'Pink', group: 'DaisyUI', previewClass: 'bg-pink-400 border-pink-300' },
  { value: 'forest', label: 'Forest', group: 'DaisyUI', previewClass: 'bg-emerald-700 border-emerald-600' },
  { value: 'luxury', label: 'Luxury', group: 'DaisyUI', previewClass: 'bg-purple-950 border-yellow-600' },
  { value: 'liquid-glass', label: 'Liquid Glass', group: 'Custom', previewClass: 'bg-blue-400/40 border-blue-300/50 backdrop-blur-sm' },
  { value: 'win96', label: 'Win 96', group: 'Custom', previewClass: 'bg-gray-400 border-gray-300' },
  { value: 'hacker', label: 'Hacker', group: 'Custom', previewClass: 'bg-black border-green-500' },
];

export function SettingsModal({
  open,
  notes,
  theme,
  editorMode,
  magicFeatures,
  onThemeChange,
  onEditorModeChange,
  onMagicFeaturesChange,
  onImport,
  onClose,
}: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<TabKey>('appearance');
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

  const Switch = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-base-content/90">{label}</div>
        {description && <div className="text-xs text-base-content/40 mt-0.5 leading-relaxed">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-base-300'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold tracking-widest uppercase text-base-content/30">{title}</h4>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full sm:w-[520px] bg-base-100 shadow-2xl flex flex-col drawer-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={17} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">{t('settings')}</h2>
              <p className="text-[11px] text-base-content/40 font-medium">Fastnote</p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost min-h-8 h-8 w-8"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex border-b border-base-300/40 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-base-content/50 hover:text-base-content'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden sm:flex w-52 flex-col border-r border-base-300/40 py-4">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all text-left ${
                  tab === t.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/60 hover:bg-base-200/60 hover:text-base-content'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">
            {tab === 'appearance' && (
              <>
                <Section title={t('language') || 'Language'}>
                  <div className="flex p-1 bg-base-200/60 rounded-xl">
                    {(['en', 'ru'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => i18n.changeLanguage(lang)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                          i18n.language === lang
                            ? 'bg-base-100 text-base-content shadow-sm'
                            : 'text-base-content/50 hover:text-base-content'
                        }`}
                      >
                        <Languages size={14} />
                        {lang === 'en' ? 'English' : 'Русский'}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title={t('theme') || 'Theme'}>
                  <div className="space-y-1">
                    {['Default', 'DaisyUI', 'Custom'].map((group) => (
                      <div key={group}>
                        <div className="text-[10px] font-medium text-base-content/30 uppercase tracking-wider px-1 py-1.5">
                          {group}
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {THEMES.filter((th) => th.group === group).map((th) => (
                            <button
                              key={th.value}
                              onClick={() => onThemeChange(th.value)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all border ${
                                theme === th.value
                                  ? 'bg-primary/8 border-primary/30 text-primary shadow-sm'
                                  : 'bg-base-200/40 border-transparent hover:bg-base-200 text-base-content/80'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg border shrink-0 ${th.previewClass}`}
                              />
                              <span className="font-medium">{th.label}</span>
                              {theme === th.value && (
                                <CheckCircle2 size={14} className="ml-auto text-primary shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {tab === 'editor' && (
              <>
                <Section title={t('editorMode') || 'Editor Mode'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => onEditorModeChange('markdown')}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
                        editorMode === 'markdown'
                          ? 'bg-primary/8 border-primary/30 shadow-sm'
                          : 'bg-base-200/40 border-transparent hover:bg-base-200'
                      }`}
                    >
                      <Code size={18} className={editorMode === 'markdown' ? 'text-primary' : 'text-base-content/50'} />
                      <div>
                        <div className={`text-sm font-semibold ${editorMode === 'markdown' ? 'text-primary' : 'text-base-content/90'}`}>
                          Markdown
                        </div>
                        <div className="text-[11px] text-base-content/40 mt-0.5 leading-relaxed">
                          {t('markdownDesc') || 'Preview, toolbar, formatting'}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => onEditorModeChange('simple')}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
                        editorMode === 'simple'
                          ? 'bg-primary/8 border-primary/30 shadow-sm'
                          : 'bg-base-200/40 border-transparent hover:bg-base-200'
                      }`}
                    >
                      <FileText size={18} className={editorMode === 'simple' ? 'text-primary' : 'text-base-content/50'} />
                      <div>
                        <div className={`text-sm font-semibold ${editorMode === 'simple' ? 'text-primary' : 'text-base-content/90'}`}>
                          {t('simpleNote') || 'Simple Note'}
                        </div>
                        <div className="text-[11px] text-base-content/40 mt-0.5 leading-relaxed">
                          {t('simpleDesc') || 'Plain text, no formatting'}
                        </div>
                      </div>
                    </button>
                  </div>
                </Section>

                <Section title={t('magicFeatures') || 'Magic Features'}>
                  <div className="bg-base-200/30 rounded-xl p-4 space-y-1">
                    <Switch
                      checked={magicFeatures}
                      onChange={onMagicFeaturesChange}
                      label={t('magicFeatures') || 'Magic Features'}
                      description={t('magicFeaturesDesc') || 'Auto-calculate math, currencies and units when typing "="'}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-base-content/30 px-1">
                    <span className="inline-flex items-center gap-1 bg-base-200/50 px-2 py-1 rounded-md">
                      <Sparkles size={10} /> 1+1= → 2
                    </span>
                    <span className="inline-flex items-center gap-1 bg-base-200/50 px-2 py-1 rounded-md">
                      <Sparkles size={10} /> 100$+2€=
                    </span>
                    <span className="inline-flex items-center gap-1 bg-base-200/50 px-2 py-1 rounded-md">
                      <Sparkles size={10} /> 15km+3mi=
                    </span>
                  </div>
                </Section>
              </>
            )}

            {tab === 'data' && (
              <>
                <Section title={t('passphrase') || 'Passphrase'}>
                  <div className="space-y-3">
                    <input
                      type="password"
                      className="input input-bordered w-full h-11 rounded-xl text-sm bg-base-100"
                      placeholder={t('enterPassphrase')}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                    />
                    <div className="flex items-start gap-2 text-xs text-base-content/40 bg-base-200/30 p-3 rounded-xl">
                      <Info size={14} className="shrink-0 mt-0.5 text-info" />
                      <span>{t('exportingNotes', { count: notes.length })}</span>
                    </div>
                  </div>
                </Section>

                <Section title={t('export') || 'Export'}>
                  <button
                    className="btn btn-primary w-full h-11 rounded-xl"
                    onClick={handleExport}
                  >
                    <Download size={16} />
                    {t('downloadBackup')}
                  </button>
                </Section>

                <div className="h-px bg-base-300/40" />

                <Section title={t('import') || 'Import'}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".fastnote,.json"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    className="btn btn-outline w-full h-11 rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    {t('chooseFile')}
                  </button>
                  <div className="flex items-start gap-2 text-xs text-base-content/40 bg-warning/8 p-3 rounded-xl border border-warning/20">
                    <TriangleAlert size={14} className="shrink-0 mt-0.5 text-warning" />
                    <span>{t('importWarning')}</span>
                  </div>
                </Section>

                {error && (
                  <div className="flex items-start gap-2 text-sm bg-error/8 p-3 rounded-xl border border-error/20 text-error">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {status && (
                  <div className="flex items-start gap-2 text-sm bg-success/8 p-3 rounded-xl border border-success/20 text-success">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{status}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

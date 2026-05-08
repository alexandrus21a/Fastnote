import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Upload, Lock, FileJson } from 'lucide-react';
import type { Note } from '../types/note';
import { encryptData, decryptData, type EncryptedBundle } from '../utils/crypto';

interface ImportExportModalProps {
  open: boolean;
  notes: Note[];
  onImport: (notes: Note[]) => void;
  onClose: () => void;
}

type Tab = 'export' | 'import';

export function ImportExportModal({
  open,
  notes,
  onImport,
  onClose,
}: ImportExportModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('export');
  const [passphrase, setPassphrase] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPassphrase('');
    setStatus(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleExport = async () => {
    if (!passphrase) {
      setError(t('enterPassphrase'));
      return;
    }
    setError(null);
    setStatus(t('encrypting'));
    try {
      const bundle = await encryptData(notes, passphrase);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fastnote-backup-${new Date().toISOString().slice(0, 10)}.fastnote`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(t('exportSuccess'));
    } catch (e) {
      setError(t('encryptionFailed'));
      setStatus(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!passphrase) {
      setError(t('enterPassphrase'));
      return;
    }
    setError(null);
    setStatus(t('decrypting'));

    try {
      const text = await file.text();
      const bundle: EncryptedBundle = JSON.parse(text);
      const imported = await decryptData<Note[]>(bundle, passphrase);
      if (!Array.isArray(imported)) throw new Error('Invalid data');
      onImport(imported);
      setStatus(t('importSuccess', { count: imported.length }));
    } catch (e) {
      setError(t('decryptionFailed'));
      setStatus(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-base-100 rounded-box shadow-xl w-full max-w-md p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t('importExport')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div role="tablist" className="tabs tabs-bordered mb-4">
          <button
            role="tab"
            className={`tab ${tab === 'export' ? 'tab-active' : ''}`}
            onClick={() => { setTab('export'); reset(); }}
          >
            <Download size={14} className="mr-1" /> {t('export')}
          </button>
          <button
            role="tab"
            className={`tab ${tab === 'import' ? 'tab-active' : ''}`}
            onClick={() => { setTab('import'); reset(); }}
          >
            <Upload size={14} className="mr-1" /> {t('import')}
          </button>
        </div>

        <div className="space-y-3">
          <label className="form-control">
            <div className="label">
              <span className="label-text flex items-center gap-1">
                <Lock size={14} /> {t('passphrase')}
              </span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder={t('enterPassphrase')}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
            <div className="label">
              <span className="label-text-alt">
                {tab === 'export'
                  ? t('passphraseExportHint')
                  : t('passphraseImportHint')}
              </span>
            </div>
          </label>

          {tab === 'export' && (
            <div className="alert alert-info text-sm">
              <FileJson size={16} />
              <span>{t('exportingNotes', { count: notes.length })}</span>
            </div>
          )}

          {tab === 'import' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fastnote,.json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                className="btn btn-outline w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-1" /> {t('chooseFile')}
              </button>
              <div className="alert alert-warning text-sm">
                <span>{t('importWarning')}</span>
              </div>
            </>
          )}

          {tab === 'export' && (
            <button className="btn btn-primary w-full" onClick={handleExport}>
              <Download size={16} className="mr-1" /> {t('downloadBackup')}
            </button>
          )}

          {error && <div className="alert alert-error text-sm">{error}</div>}
          {status && <div className="alert alert-success text-sm">{status}</div>}
        </div>
      </div>
    </div>
  );
}

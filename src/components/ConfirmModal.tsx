import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="modal-enter glass-panel-strong rounded-3xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-base-content/60 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn btn-ghost rounded-xl" onClick={onCancel}>
            {cancelText || t('cancel')}
          </button>
          <button className="btn btn-error rounded-xl" onClick={onConfirm}>
            {confirmText || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

import Modal from "./Modal";
import { btnDanger, btnSecondary } from "../../lib/utils";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirm Delete", message = "Are you sure? This action cannot be undone.", confirmLabel = "Delete", loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className={btnSecondary} disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className={btnDanger} disabled={loading}>
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

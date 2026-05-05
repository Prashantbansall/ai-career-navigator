import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, loading, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-description"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onCancel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl p-6"
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              aria-label="Close confirmation dialog"
              className="absolute right-4 top-4 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div
              className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 mb-5"
              aria-hidden="true"
            >
              <AlertTriangle size={28} aria-hidden="true" />
            </div>

            <h3
              id="confirm-modal-title"
              className="text-xl font-semibold text-gray-100"
            >
              {title}
            </h3>

            <p
              id="confirm-modal-description"
              className="text-sm md:text-base text-gray-400 mt-2"
            >
              {message}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                aria-label="Cancel confirmation"
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                aria-label="Confirm action"
                className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

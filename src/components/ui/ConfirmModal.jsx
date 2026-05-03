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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onCancel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
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
              onClick={onCancel}
              disabled={loading}
              className="absolute right-4 top-4 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 mb-5">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-xl font-semibold text-gray-100">{title}</h3>

            <p className="text-sm md:text-base text-gray-400 mt-2">{message}</p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition disabled:opacity-60"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

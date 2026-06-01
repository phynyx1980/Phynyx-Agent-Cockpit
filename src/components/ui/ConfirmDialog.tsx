"use client";

import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  open:        boolean;
  title:       string;
  description: string;
  confirmLabel?: string;
  cancelLabel?:  string;
  danger?:       boolean;   // true = roter Confirm-Button
  onConfirm:   () => void;
  onCancel:    () => void;
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = "Bestätigen",
  cancelLabel  = "Abbrechen",
  danger       = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] shadow-2xl overflow-hidden"
        style={{ boxShadow: danger ? "0 0 40px rgba(204,17,0,0.2)" : "0 0 40px rgba(0,0,0,0.6)" }}>

        {/* Top border accent */}
        <div className="h-0.5 w-full" style={{ backgroundColor: danger ? "#CC1100" : "#C9A84C" }} />

        <div className="p-5">
          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: danger ? "rgba(204,17,0,0.15)" : "rgba(201,168,76,0.15)" }}>
              {danger
                ? <AlertTriangle className="w-4 h-4 text-[#CC1100]" />
                : <CheckCircle className="w-4 h-4 text-[#C9A84C]" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-xs text-[#999999] mt-1 leading-relaxed">{description}</p>
            </div>
            <button onClick={onCancel} className="text-[#555555] hover:text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#999999] bg-[#111111] border border-[#2A2A2A] hover:text-white hover:border-[#3A3A3A] transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => { onConfirm(); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{
                backgroundColor: danger ? "#CC1100" : "#C9A84C",
                color:           danger ? "#fff"    : "#0A0A0A",
                boxShadow:       danger
                  ? "0 0 12px rgba(204,17,0,0.4)"
                  : "0 0 12px rgba(201,168,76,0.3)",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

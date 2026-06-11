import { Inbox } from "lucide-react";

export default function EmptyState({ message, actionLabel, onAction, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <p className="text-slate-600 font-medium mb-1">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium text-sm transition-all cursor-pointer">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

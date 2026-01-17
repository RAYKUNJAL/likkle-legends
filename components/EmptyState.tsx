import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = "🥥",
    title,
    message,
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-blue-50/50 rounded-[3rem] border-4 border-dashed border-blue-200 h-full min-h-[300px] animate-in fade-in zoom-in duration-500">
            <div className="text-7xl mb-6 animate-float">{icon}</div>
            <h3 className="text-2xl font-heading font-black text-blue-950 mb-2">{title}</h3>
            <p className="text-blue-900/60 font-bold max-w-sm mb-8 leading-relaxed">{message}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

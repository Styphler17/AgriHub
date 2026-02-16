import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
    onCancel: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onCancel, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-700 transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-black text-center mb-2">Log Out?</h2>
                <p className="text-center text-slate-500 font-medium mb-8">
                    This will clear your local session and reset the app. Are you sure?
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onCancel}
                        className="py-4 rounded-xl font-bold border-2 border-slate-100 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-4 rounded-xl font-bold bg-red-600 text-white shadow-xl shadow-red-600/20 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Yes, Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;

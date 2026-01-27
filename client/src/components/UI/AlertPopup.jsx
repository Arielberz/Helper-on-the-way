/*
  קובץ זה אחראי על:
  - תצוגת חלונות קופצים להודעות מערכת (alerts)
  - סוגי הודעות: success, error, warning, info, confirm
  - עיצוב דינמי לפי סוג ההודעה (צבע, איקון)
  - תמיכה בכפתורי אישור/ביטול

  הקובץ משמש את:
  - AlertContext לניהול מרכזי של התראות
  - כל קומפוננטה שצריכה להציג הודעות למשתמש

  הקובץ אינו:
  - מכיל לוגיקה עסקית
  - מטפל בקריאות API
*/

import React from 'react';
import { X, Check, AlertTriangle, Info } from 'lucide-react';

export default function AlertPopup({ isOpen, message, type = 'info', title, onClose, onConfirm }) {
  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="w-8 h-8 text-green-500" />,
          titleColor: 'text-green-600',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50/50'
        };
      case 'error':
        return {
          icon: <X className="w-8 h-8 text-red-500" />,
          titleColor: 'text-red-600',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50/50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          titleColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          bgColor: 'bg-yellow-50/50'
        };
      default:
        return {
          icon: <Info className="w-8 h-8 text-blue-500" />,
          titleColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50/50'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-sm overflow-hidden 
          bg-white/80 backdrop-blur-xl
          border border-white/40
          rounded-2xl shadow-2xl
          transform transition-all scale-100
          animate-in zoom-in-95 duration-200
        `}
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >


        <div className="flex flex-col items-center p-6 text-center space-y-4">

          <div className={`p-3 rounded-full ${styles.bgColor} border ${styles.borderColor} shadow-sm`}>
            {styles.icon}
          </div>

          <div className="space-y-2">
            {title && (
              <h3 className={`text-lg font-bold ${styles.titleColor}`}>
                {title}
              </h3>
            )}
            <p className="text-gray-700 font-medium leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            {onConfirm && (
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 
                  bg-blue-600 hover:bg-blue-700 
                  text-white font-semibold rounded-xl
                  shadow-lg shadow-blue-500/30
                  transition-all duration-200
                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                אישור
              </button>
            )}

            {!onConfirm ? (
              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 
                  bg-blue-600 hover:bg-blue-700 
                  text-white font-semibold rounded-xl
                  shadow-lg shadow-blue-500/30
                  transition-all duration-200
                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                סגור
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 
                  bg-gray-100 hover:bg-gray-200 
                  text-gray-700 font-semibold rounded-xl
                  transition-all duration-200
                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                ביטול
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

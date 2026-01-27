/*
  קובץ זה אחראי על:
  - ניהול מרכזי של התראות והודעות מערכת באפליקציה
  - ספק קשר (Context Provider) להצגת alerts מכל קומפוננטה
  - מערכת alert אחידה לכל האפליקציה (success, error, warning, info, confirm)
  - Hook useAlert לשימוש בכל קומפוננטה

  הקובץ משמש את:
  - main.jsx שמעטף את כל האפליקציה ב-AlertProvider
  - כל קומפוננטה שקוראת ל-useAlert()

  הקובץ אינו:
  - מכיל לוגיקה עסקית או קריאות API
  - מציג את ה-UI עצמו (זה תפקיד AlertPopup)
*/

import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertPopup from '../components/UI/AlertPopup';

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '',
    type: 'info',
    onClose: null,
    onConfirm: null
  });

  const showConfirm = useCallback((message, onConfirmCallback, title = 'אישור פעולה') => {
    setAlertState({
      isOpen: true,
      message,
      title,
      type: 'warning',
      onClose: null,
      onConfirm: onConfirmCallback
    });
  }, []);

  const showAlert = useCallback((message, typeOrOptions = 'info') => {
    let type = 'info';
    let title = '';
    let customOnClose = null;

    if (typeof typeOrOptions === 'string') {
      type = typeOrOptions;
    } else if (typeof typeOrOptions === 'object') {
      type = typeOrOptions.type || 'info';
      title = typeOrOptions.title || '';
      customOnClose = typeOrOptions.onClose || null;
    }

    let cleanMessage = message;
    if (typeof message === 'string') {
      if (message.includes('✅')) {
        type = 'success';
        cleanMessage = message.replace('✅', '').trim();
        if (!title) title = 'הצלחה!';
      } else if (message.includes('❌')) {
        type = 'error';
        cleanMessage = message.replace('❌', '').trim();
        if (!title) title = 'שגיאה';
      } else if (message.includes('⚠️')) {
        type = 'warning';
        cleanMessage = message.replace('⚠️', '').trim();
        if (!title) title = 'שים לב';
      }
      
      if (type === 'error' && cleanMessage.toLowerCase().startsWith('error:')) {
         cleanMessage = cleanMessage.substring(6).trim();
      }
      if (type === 'error' && cleanMessage.startsWith('שגיאה:')) {
         cleanMessage = cleanMessage.substring(6).trim();
      }
    }

    setAlertState({
      isOpen: true,
      message: cleanMessage,
      title,
      type,
      onClose: customOnClose,
      onConfirm: null
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => {
      if (prev.onClose) prev.onClose();
      return { ...prev, isOpen: false };
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, showConfirm }}>
      {children}
      <AlertPopup
        isOpen={alertState.isOpen}
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        onClose={hideAlert}
        onConfirm={alertState.onConfirm}
      />
    </AlertContext.Provider>
  );
};

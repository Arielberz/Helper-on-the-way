/*
  קובץ זה אחראי על:
  - גלילה אוטומטית לראש העמוד בכל מעבר בין דפים
  - שיפור חוויית משתמש בניווט
  - ריקון מיקום הגלילה לפני טעינת עמוד חדש

  הקובץ משמש את:
  - App.jsx כקומפוננטה עטיפה גלובלית
  - React Router לאיתור שינויי pathname

  הקובץ אינו:
  - מציג UI
  - מטפל בלאיגוקה או מצב
*/

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;

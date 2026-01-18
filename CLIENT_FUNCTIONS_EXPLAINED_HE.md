# מדריך רכיבים ופונקציות Client - Helper on the Way

תיעוד מפורט של הרכיבים, Hooks, Context והפונקציות העיקריות בצד הלקוח, מיקומן והסבר לוגי על תפקידן.

---

## תוכן עניינים

1. [מבנה האפליקציה (App Structure)](#1-מבנה-האפליקציה-app-structure)
2. [רכיבי ניהול מצב (Context Providers)](#2-רכיבי-ניהול-מצב-context-providers)
3. [רכיבים עיקריים (Main Components)](#3-רכיבים-עיקריים-main-components)
4. [עמודים (Pages)](#4-עמודים-pages)
5. [Hooks מותאמים (Custom Hooks)](#5-hooks-מותאמים-custom-hooks)
6. [פונקציות עזר (Utilities)](#6-פונקציות-עזר-utilities)
7. [תקשורת בזמן אמת (Real-time Communication)](#7-תקשורת-בזמן-אמת-realtime-communication)

---

## 1. מבנה האפליקציה (App Structure)

**מיקום:** `client/src/app.jsx`

### 1.1 קומפוננטת `App` - שורש האפליקציה

**הסבר:**
זהו הרכיב הראשי של האפליקציה שמגדיר את כל המסלולים (routes) ומספק את ה-Context providers לכל האפליקציה.

**מבנה לוגי:**
1. **Providers עוטפים:** 
   - `RatingProvider` - ניהול דירוגים
   - `HelperRequestProvider` - ניהול Socket.IO והתראות
2. **רכיבים גלובליים:**
   - `ScrollToTop` - גלילה אוטומטית לראש העמוד בניווט
   - `GlobalRatingModal` - חלון דירוג גלובלי
   - `HelperConfirmedNotification` - התראות אישור עוזר
3. **ניתוב (Routes):**
   - מסלולים ציבוריים: `/`, `/login`, `/register`, `/terms`, `/privacy`
   - מסלולים מוגנים: `/home`, `/chat`, `/rating`, `/profile`
   - מסלולי מנהל: `/admin/*`

**קטגוריות מסלולים:**

#### מסלולים ציבוריים (`PublicRoute`)
- יכולים לגשת אליהם רק משתמשים שלא מחוברים
- אם משתמש מחובר - מנותב אוטומטית ל-`/home`

#### מסלולים מוגנים (`ProtectedRoute`)
- דורשים אימות (טוקן תקף)
- אם אין אימות - מנותב ל-`/login`

#### מסלולי מנהל
- נגישים רק למשתמשים עם הרשאות admin
- כוללים דשבורד ניהול מערכת

---

## 2. רכיבי ניהול מצב (Context Providers)

### 2.1 `HelperRequestContext` - ניהול Socket.IO ובקשות עזרה

**מיקום:** `client/src/context/HelperRequestContext.jsx`

**הסבר:**
Context מרכזי שמנהל את חיבור Socket.IO ומספק גישה לנתוני בקשות בזמן אמת.

**מצב (State) שמנוהל:**
- `socket`: החיבור של Socket.IO
- `pendingRequest`: בקשת עזרה ממתינה (כשמישהו מבקש עזרה ממני)
- `helperConfirmed`: אישור שעוזר מגיע (כשמישהו הקצה עצמו לעזור לי)
- `etaByRequestId`: מילון של זמני הגעה משוערים לפי ID בקשה

**פונקציות:**
- `clearPendingRequest()`: מנקה בקשה ממתינה
- `clearHelperConfirmed()`: מנקה אישור עוזר
- `setEtaForRequest(requestId, etaData)`: מעדכן זמן הגעה לבקשה

**תהליך לוגי - יצירת חיבור Socket.IO:**
1. **בדיקת טוקן:** רק אם יש טוכן תקף, יוצר חיבור
2. **יצירת Socket:** מתחבר לשרת עם אימות
3. **האזנה לאירועים:**
   - `helperRequestReceived`: בקשת עזרה חדשה נשלחה אלי
   - `helperConfirmed`: עוזר אישר שהוא בא לעזור לי
   - `etaUpdated`: עדכון זמן הגעה משוער
4. **ניקוי בסגירה:** סוגר חיבור כשיוצאים מהאפליקציה

**הערות חשובות:**
- החיבור נשמר בזיכרון ונגיש לכל האפליקציה
- ETA נשמר ב-localStorage להתמדה
- משמיע צלילי התראה כשמגיעות הודעות חדשות

---

### 2.2 `RatingContext` - ניהול חלונות דירוג

**מיקום:** `client/src/context/RatingContext.jsx`

**הסבר:**
מנהל את פתיחה/סגירה של חלון הדירוג הגלובלי.

**מצב:**
- `showRatingModal`: האם החלון פתוח
- `requestToRate`: הבקשה שצריך לדרג

**פונקציות:**
- `openRatingModal(request)`: פותח חלון דירוג עבור בקשה
- `closeRatingModal()`: סוגר את חלון הדירוג

**שימוש:**
```javascript
const { openRatingModal } = useRating();
openRatingModal(completedRequest);
```

---

### 2.3 `AlertContext` - התראות מערכת

**מיקום:** `client/src/context/AlertContext.jsx`

**הסבר:**
מספק מערכת התראות גלובלית (alerts, confirms) לכל האפליקציה.

**פונקציות:**
- `showAlert(message, type)`: מציג התראה
- `showConfirm(message)`: מציג אישור (confirm dialog)

---

## 3. רכיבים עיקריים (Main Components)

### 3.1 `MapLive` - מפה חיה עם בקשות בזמן אמת

**מיקום:** `client/src/components/MapLive/MapLive.jsx`

**הסבר:**
הרכיב המרכזי של האפליקציה - מציג מפה אינטראקטיבית עם בקשות עזרה בזמן אמת.

**תהליך לוגי:**

#### 1. אתחול מיקום משתמש
- משתמש ב-hook `useMapLocation`
- מנסה קודם לקבל מיקום מבוסס IP (מהיר, אין צורך באישור)
- לאחר מכן מבקש אישור ל-GPS מדויק
- מציג באנר דיוק מיקום

#### 2. טעינת בקשות מהשרת
- קורא ל-`/api/requests` בטעינה ראשונית
- מקבל את כל הבקשות הפעילות
- מציג אותן כסמנים על המפה

#### 3. האזנה לעדכונים בזמן אמת (Socket.IO)
- `requestAdded`: בקשה חדשה נוספה
- `requestUpdated`: בקשה עודכנה (שינוי סטטוס, עוזר הוקצה)
- `requestDeleted`: בקשה נמחקה

#### 4. זיהוי הבקשה הפעילה שלי
- בודק אם המשתמש הוא מבקש או עוזר בבקשה פעילה
- אם המשתמש עוזר - שולח עדכוני מיקום כל 30 שניות

#### 5. ציור מסלול (Routing)
- משתמש ב-OSRM לחישוב מסלול אופטימלי
- מציג polyline (קו) על המפה מהעוזר ליעד

**תכונות נוספות:**
- **Mobile responsive:** תפריט צד נסתר במובייל
- **פרופיל**: תפריט פרופיל עם אווטר
- **צ'אט**: אייקון צ'אט עם counter של הודעות לא נקראות
- **HelpButton**: כפתור יצירת בקשת עזרה חדשה

**רכיבי משנה:**
- `UserMarker`: סמן המשתמש על המפה
- `RequestMarkers`: סמני הבקשות
- `RoutePolylines`: קווי המסלול
- `MapSidebar`: תפריט צד עם רשימת בקשות
- `MobileMapHeader`: כותרת למובייל
- `LocationAccuracyBanner`: באנר דיוק מיקום

---

### 3.2 `HelpButton` - כפתור יצירת בקשת עזרה

**מיקום:** `client/src/components/helpButton/helpButton.jsx`

**הסבר:**
כפתור צף שפותח מודל ליצירת בקשת עזרה חדשה.

**תהליך יצירת בקשה:**

#### 1. פתיחת המודל
- משתמש לוחץ על כפתור העזרה
- מבקש אוטומטית מיקום GPS

#### 2. בחירת מיקום
- **GPS אוטומטי (ברירת מחדל):** משתמש במיקום הנוכחי
- **כתובת ידנית:** משתמש יכול להקליד כתובת

#### 3. מילוי פרטים
- **סוג בעיה:** תקר בגלגל, סוללה, דלק, וכו'
- **תיאור:** תיאור טקסטואלי
- **תמונה:** העלאת תמונה (אופציונלי)
- **תשלום:** סכום מוצע (אופציונלי)

#### 4. שליחה
- ממיר תמונה ל-Base64
- אם נבחרה כתובת ידנית - עובר geocoding (המרה לקואורדינטות)
- שולח POST ל-`/api/requests`
- משדר אוטומטית לכולם דרך Socket.IO

**Hooks פנימיים:**
- `useImageUpload`: ניהול העלאת תמונות
- `useLocation`: ניהול מיקום GPS

---

### 3.3 `IncomingHelpNotification` - התראת בקשת עזרה נכנסת

**מיקום:** `client/src/components/IncomingHelpNotification/IncomingHelpNotification.jsx`

**הסבר:**
מציג התראה כשמישהו מבקש עזרה בקרבת המשתמש.

**תהליך:**
1. מאזין ל-`helperRequestReceived` מ-Socket.IO
2. מציג קלף עם פרטי הבקשה
3. משתמש יכול לבחור:
   - "הצג במפה" - מנווט למפה ומיקוד על הבקשה
   - "התעלם" - סוגר את ההתראה

---

### 3.4 `HelperConfirmedNotification` - התראת אישור עוזר

**מיקום:** `client/src/components/HelperConfirmedNotification/HelperConfirmedNotification.jsx`

**הסבר:**
מציג התראה כשעוזר מאשר שהוא בא לעזור למשתמש.

**תכולה:**
- שם העוזר
- דירוג ממוצע
- ETA (זמן הגעה משוער)
- כפתור "פתח צ'אט"

---

## 4. עמודים (Pages)

### 4.1 `Home` - עמוד הבית

**מיקום:** `client/src/pages/home/home.jsx`

**הסבר:**
עמוד הבית המרכזי של האפליקציה - מציג את המפה החיה.

**תהליך לוגי:**
1. **טעינה:** רנדור של `MapLive`
2. **בדיקת דירוגים ממתינים:**
   - קורא ל-`/api/requests/my-requests`
   - מחפש בקשות שהושלמו וטרם דורגו
   - פותח אוטומטית מודל דירוג אם יש
3. **רכיבים:**
   - `MapLive` - המפה
   - `PendingRatingNotification` - התראת דירוג ממתין

---

### 4.2 `Chat` - עמוד צ'אט

**מיקום:** `client/src/pages/chat/chat.jsx`

**הסבר:**
עמוד צ'אט מלא עם שיחות ממשיות בזמן אמת דרך Socket.IO.

**מבנה:**
- **Sidebar:** רשימת שיחות
- **Chat Window:** חלון השיחה הנבחרת
- **Message Input:** שדה הקלדת הודעות

**תהליך לוגי:**

#### 1. טעינת שיחות
- קורא ל-`/api/chat/conversations`
- מציג רשימה של כל השיחות (כמבקש וכעוזר)
- סמן "לא נקרא" אם יש הודעות חדשות

#### 2. בחירת שיחה
- לחיצה על שיחה טוענת את כל ההודעות
- שולח `mark_as_read` לסמן הודעות כנקראו
- מצטרף לחדר Socket.IO של השיחה

#### 3. שליחת הודעה
- משתמש מקליד ושולח
- שולח דרך Socket.IO: `send_message`
- הודעה מתקבלת בזמן אמת על ידי כל המשתתפים

#### 4. תכונות נוספות
- **Typing indicator:** "משתמש מקליד..."
- **ETA display:** מציג זמן הגעה משוער
- **Payment:** אפשרות תשלום דרך PayPal
- **End treatment:** סיום טיפול
- **Report:** דיווח על משתמש

**רכיבי משנה:**
- `Sidebar`: תפריט שיחות
- `ChatHeader`: כותרת עם פרטי משתמש
- `MessageList`: רשימת הודעות
- `MessageInput`: שדה הקלדה
- `PaymentModal`: חלון תשלום
- `ReportModal`: חלון דיווח

---

### 4.3 `Login` - עמוד התחברות

**מיקום:** `client/src/pages/login/login.jsx`

**הסבר:**
עמוד התחברות למערכת.

**תהליך לוגי:**
1. **קלט:** אימייל/טלפון + סיסמה
2. **נורמליזציה:** ממיר מספרי טלפון (05X → +9725X)
3. **שליחה:** POST ל-`/api/users/login`
4. **קבלת טוקן:** שמירת JWT ב-localStorage
5. **ניתוב:**
   - מנהל → `/admin`
   - משתמש רגיל → `/home`

**טיפול בשגיאות:**
- משתמש חסום - הודעה מיוחדת
- פרטים שגויים
- מייל לא אומת

---

### 4.4 `Register` - עמוד הרשמה

**מיקום:** `client/src/pages/register/register.jsx`

**הסבר:**
עמוד הרשמה למערכת עם אימות מייל.

**תהליך רישום בשלבים:**

#### שלב 1: מילוי טופס
- שם משתמש (3-30 תווים)
- טלפון (פורמט ישראלי)
- אימייל
- סיסמה (מינימום 8 תווים)
- אישור סיסמה

#### שלב 2: אישור תנאי שימוש
- מציג מודל של תנאי שימוש ופרטיות
- חובה לאשר

#### שלב 3: שליחה
- POST ל-`/api/users/register`
- שרת שולח קוד אימות למייל

#### שלב 4: אימות מייל
- מודל אימות עם שדה קוד (6 ספרות)
- משתמש מזין את הקוד שקיבל במייל
- POST ל-`/api/users/verify-email`
- אם מצליח - מתחבר אוטומטית

**רכיבי משנה:**
- `RegisterForm`: טופס הרשמה
- `EmailVerificationModal`: מודל אימות מייל
- `TermsConsentModal`: מודל תנאי שימוש

---

### 4.5 `Profile` - עמוד פרופיל

**מיקום:** `client/src/pages/Profile/profile.jsx`

**תכונות:**
- **הצגת מידע:** שם, אימייל, טלפון, דירוג
- **עריכה:** שינוי פרטים אישיים
- **אווטר:** העלאת תמונת פרופיל
- **Wallet:** ארנק דיגיטלי (יתרה, משיכות)
- **היסטוריה:** בקשות עזרה קודמות

---

### 4.6 `Rating` - עמוד דירוגים

**מיקום:** `client/src/pages/Rating/Rating.jsx`

**הסבר:**
מציג את כל הדירוגים שהמשתמש קיבל (אם הוא עוזר).

**תכולה:**
- ממוצע דירוג
- מספר דירוגים
- רשימת דירוגים עם:
  - ציון (כוכבים)
  - ביקורת טקסטואלית
  - סוג בעיה
  - תאריך

---

### 4.7 עמודי מנהל (Admin Pages)

**מיקום:** `client/src/pages/Admin/`

#### `AdminDashboard` - לוח בקרה
- סטטיסטיקות כלליות
- גרפים (עמודות, עוגה)
- נתונים עדכניים על המערכת

#### `UsersTable` - ניהול משתמשים
- רשימת כל המשתמשים
- חסימת/ביטול חסימה
- צפייה בפרטים

#### `RequestsTable` - ניהול בקשות
- כל הבקשות במערכת
- סטטוס, משתמש, עוזר
- סינון ומיון

#### `TransactionsTable` - עסקאות
- כל התשלומים
- סכומים, תאריכים
- סטטוס תשלום

#### `ReportsTable` - דיווחים
- דיווחים על משתמשים
- סטטוס טיפול
- פעולות ניהול

---

## 5. Hooks מותאמים (Custom Hooks)

### 5.1 `useMapLocation` - ניהול מיקום למפה

**מיקום:** `client/src/hooks/useMapLocation.js`

**הסבר:**
Hook שמנהל את תהליך קבלת מיקום המשתמש בצורה חכמה ומדורגת.

**תהליך:**

#### שלב 1: מיקום IP (מיידי, ללא אישור)
- קורא לשירות IP geolocation
- מקבל מיקום משוער (דיוק של כ-10 ק"מ)
- מרכז את המפה על המיקום

#### שלב 2: בקשת GPS (לאחר דחייה קצרה)
- אם המיקום לא מדויק - מבקש אוטומטית GPS
- משתמש רואה באנר "לחץ לדיוק גבוה"
- אם המשתמש מאשר - מקבל מיקום מדויק

#### שלב 3: Cache
- שומר מיקום GPS ב-localStorage
- בביקור הבא - משתמש במיקום השמור

**ערכים מוחזרים:**
- `position`: [lat, lng]
- `locationAccuracy`: 'precise' / 'approximate' / 'default'
- `showAccuracyBanner`: האם להציג באנר
- `refreshLocation()`: פונקציה לעדכון מיקום
- `dismissAccuracyBanner()`: סגירת הבאנר

---

### 5.2 `useUnreadCount` - ספירת הודעות לא נקראות

**מיקום:** `client/src/hooks/useUnreadCount.js`

**הסבר:**
Hook שסופר כמה הודעות צ'אט לא נקראות יש למשתמש.

**תהליך:**
1. קורא ל-`/api/chat/conversations`
2. עובר על כל השיחות
3. סופר הודעות שלא נקראו (שהמשתמש לא שלח)
4. מחזיר מספר

**שימוש:**
```javascript
const unreadCount = useUnreadCount();
// מציג badge עם המספר
```

---

### 5.3 `useChatConversations` - ניהול שיחות צ'אט

**מיקום:** `client/src/hooks/useChatConversations.js`

**הסבר:**
Hook שמנהל רשימת שיחות והודעות.

**פונקציות:**
- טעינת שיחות
- בחירת שיחה
- הוספת הודעה חדשה

---

### 5.4 `useChatPayment` - תשלום דרך צ'אט

**מיקום:** `client/src/hooks/useChatPayment.js`

**הסבר:**
Hook שמטפל בתהליך התשלום דרך PayPal מתוך הצ'אט.

**תהליך:**
1. `createPaymentOrder()`: יצירת הזמנה ב-PayPal
2. ניתוב למסך PayPal לאישור
3. חזרה לאפליקציה
4. `capturePayment()`: לכידת התשלום

---

## 6. פונקציות עזר (Utilities)

### 6.1 אימות (Auth Utils)

**מיקום:** `client/src/utils/authUtils.js`

#### `setAuthData(token, user)`
שומר טוקן ו-userId ב-localStorage.

#### `getToken()`
מחזיר טוכן, בודק תקפות (expiration).

#### `getUserId()`
מחזיר את ה-ID של המשתמש המחובר.

#### `clearAuthData()`
מנקה את כל המידע של האימות.

#### `isTokenExpired(token)`
בודק אם טוקן פג תוקף (decode JWT ובדיקת exp).

**הערות:**
- לא שומר מידע רגיש מלבד טוכן ו-ID
- שאר הנתונים נשלפים מהשרת בעת הצורך

---

### 6.2 API Fetch

**מיקום:** `client/src/utils/apiFetch.js`

**הסבר:**
Wrapper על `fetch` שמוסיף אוטומטית את ה-Authorization header.

**שימוש:**
```javascript
const response = await apiFetch('/api/requests', {}, navigate);
```

**תכונות:**
- מוסיף אוטומטית `Authorization: Bearer ${token}`
- זיהוי אוטומטי של טוקן פג תוקף
- ניתוב ל-login במקרה של 401

---

### 6.3 Location Utils

**מיקום:** `client/src/utils/locationUtils.js`

#### `getInitialLocation()`
מקבל מיקום ראשוני מבוסס IP.

#### `getPreciseLocation()`
מבקש מיקום GPS מדויק.

#### `cacheLocation(location)`
שומר מיקום ב-cache.

#### `geocodeAddress(address)`
ממיר כתובת לקואורדינטות.

---

### 6.4 Currency Utils

**מיקום:** `client/src/utils/currencyUtils.js`

#### `formatCurrency(amount, currency)`
מעצב סכום כסף לתצוגה.

#### `agorotToILS(agorot)`
ממיר עגורות לשקלים.

---

### 6.5 Request Utils

**מיקום:** `client/src/utils/requestUtils.js`

**פונקציות:**
- `getProblemTypeText(type)`: ממיר קוד בעיה לטקסט עברי
- `getStatusText(status)`: ממיר סטטוס לטקסט עברי
- `getStatusColor(status)`: מחזיר צבע לפי סטטוס

---

## 7. תקשורת בזמן אמת (Real-time Communication)

### 7.1 Socket.IO Client

**מיקום:** `client/src/context/HelperRequestContext.jsx`

**חיבור:**
```javascript
const socket = io(API_BASE, {
  auth: { token: authToken },
  transports: ['websocket', 'polling']
});
```

**אירועים נתמכים:**

#### מצד השרת (Server → Client)

##### `requestAdded`
בקשת עזרה חדשה נוספה למערכת.
```javascript
socket.on('requestAdded', (request) => {
  // הוסף למפה
});
```

##### `requestUpdated`
בקשה עודכנה (שינוי סטטוס, עוזר הוקצה).
```javascript
socket.on('requestUpdated', (request) => {
  // עדכן במפה
});
```

##### `requestDeleted`
בקשה נמחקה.
```javascript
socket.on('requestDeleted', ({ _id }) => {
  // הסר מהמפה
});
```

##### `helperRequestReceived`
התקבלה בקשת עזרה שמתאימה לי (קרוב למיקומי).
```javascript
socket.on('helperRequestReceived', (data) => {
  // הצג התראה
});
```

##### `helperConfirmed`
עוזר אישר שהוא בא לעזור לי.
```javascript
socket.on('helperConfirmed', (data) => {
  // הצג התראת אישור
});
```

##### `etaUpdated`
עדכון זמן הגעה משוער.
```javascript
socket.on('etaUpdated', ({ requestId, etaSeconds }) => {
  // עדכן ETA בממשק
});
```

##### צ'אט - `new_message`
הודעה חדשה בצ'אט.
```javascript
socket.on('new_message', ({ conversationId, message }) => {
  // הוסף הודעה לשיחה
});
```

##### צ'אט - `user_typing`
משתמש מקליד.
```javascript
socket.on('user_typing', ({ userId, isTyping }) => {
  // הצג "מקליד..."
});
```

##### צ'אט - `messages_read`
הודעות סומנו כנקראו.
```javascript
socket.on('messages_read', ({ conversationId }) => {
  // עדכן UI
});
```

#### מצד הלקוח (Client → Server)

##### `join_conversation`
הצטרפות לחדר שיחה.
```javascript
socket.emit('join_conversation', conversationId);
```

##### `send_message`
שליחת הודעה.
```javascript
socket.emit('send_message', {
  conversationId,
  content: 'הודעה'
});
```

##### `mark_as_read`
סימון הודעות כנקראו.
```javascript
socket.emit('mark_as_read', { conversationId });
```

##### `typing`
שליחת אינדיקציה שמקלידים.
```javascript
socket.emit('typing', {
  conversationId,
  isTyping: true
});
```

##### `helperLocationUpdate`
עדכון מיקום עוזר (נשלח כל 30 שניות).
```javascript
socket.emit('helperLocationUpdate', {
  requestId,
  latitude,
  longitude
});
```

---

## סיכום ארכיטקטורה Client

### זרימת בקשת עזרה - מצד המשתמש:

#### כמבקש עזרה:
1. **יצירה:**
   - לוחץ על כפתור עזרה
   - בוחר מיקום (GPS או ידני)
   - ממלא פרטים
   - שולח בקשה
   
2. **המתנה:**
   - רואה בקשה על המפה בסטטוס `pending`
   - מקבל התראה כשעוזר מוקצה
   - רואה ETA של העוזר

3. **תקשורת:**
   - פותח צ'אט עם העוזר
   - מקבל עדכוני מיקום בזמן אמת
   - רואה מסלול על המפה

4. **סיום:**
   - עוזר מסמן "הגעתי"
   - עוזר מסיים טיפול
   - אם יש תשלום - משלם דרך PayPal
   - אם חינם - מאשר השלמה

5. **דירוג:**
   - מקבל בקשה לדרג
   - נותן כוכבים וביקורת
   - העוזר מקבל עדכון בפרופיל

#### כעוזר (מתנדב):
1. **צפייה במפה:**
   - רואה בקשות פעילות במפה
   - יכול לסנן לפי סוג בעיה

2. **קבלת התראה:**
   - מקבל התראה על בקשה קרובה
   - יכול לראות פרטים

3. **הקצאה:**
   - לוחץ "אני בא לעזור"
   - מחשב מסלול ו-ETA
   - נשלח עדכון למבקש

4. **נסיעה:**
   - מיקום מתעדכן כל 30 שניות
   - מבקש רואה את המיקום
   - צ'אט פתוח לתקשורת

5. **הגעה וטיפול:**
   - מסמן "הגעתי"
   - מטפל בבעיה
   - מסיים טיפול

6. **קבלת תשלום:**
   - אם יש תשלום - מבקש משלם
   - כסף נזקף אוטומטית לארנק
   - יכול למשוך לבנק

### טכנולוגיות מרכזיות:

#### Frontend Framework
- **React 19** - ספרייה ראשית
- **React Router v7** - ניתוב
- **Vite** - build tool מהיר

#### UI & Styling
- **Tailwind CSS v4** - עיצוב
- **Leaflet** - מפות אינטראקטיביות
- **React Leaflet** - רכיבי React למפות

#### Real-time Communication
- **Socket.IO Client** - תקשורת דו-כיוונית
- **WebSocket** - חיבור מתמשך

#### State Management
- **Context API** - ניהול מצב גלובלי
- **Custom Hooks** - לוגיקה משותפת
- **localStorage** - התמדה מקומית

#### HTTP Requests
- **Axios** - בקשות HTTP
- **Fetch API** - wrapper מותאם

#### Forms & Validation
- **React Forms** - טפסים מבוססי state
- **Client-side Validation** - וולידציה מקומית

#### Media Handling
- **Base64 Encoding** - תמונות
- **File API** - העלאת קבצים

### אבטחה:

#### Client-side Security
- **JWT Storage:** שמירה ב-localStorage (לא רגיש מדי)
- **Token Validation:** בדיקת תוקף לפני כל בקשה
- **Auto Logout:** יציאה אוטומטית בטוקן פג
- **Protected Routes:** נתיבים מוגנים
- **Input Validation:** וולידציה לפני שליחה

#### Best Practices
- **No sensitive data in localStorage:** רק טוקן ו-ID
- **HTTPS only in production**
- **CSP Headers** (מוגדר בשרת)
- **XSS Protection** - React מנקה אוטומטית

### ביצועים:

#### Optimization Techniques
- **Code Splitting:** טעינה lazy של routes
- **Memo/useMemo:** מניעת רינדורים מיותרים
- **WebSocket Reuse:** חיבור Socket.IO אחד משותף
- **localStorage Cache:** שמירת מיקום, ETA
- **Image Compression:** דחיסת תמונות לפני העלאה
- **Debouncing:** על אירועי typing

#### Mobile Optimization
- **Responsive Design:** Tailwind breakpoints
- **Touch Events:** תמיכה במגע
- **Mobile Menu:** תפריט מותאם למובייל
- **GPS Accuracy:** שימוש ב-HTML5 Geolocation

---

**סוף המדריך**

קובץ זה מתעד את הרכיבים והפונקציות המרכזיות בצד הלקוח. לשאלות נוספות או הבהרות, ניתן לעיין בקוד המקור של כל רכיב.

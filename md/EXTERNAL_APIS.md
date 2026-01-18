# External APIs - Helper on the Way

תיעוד מלא של כל ה-APIs החיצוניים שבהם הפרויקט משתמש.

---

## 📚 תוכן עניינים
- [PayPal API](#paypal-api)
- [IP Geolocation Services](#ip-geolocation-services)
- [OSRM API](#osrm-api)
- [OpenStreetMap Tiles](#openstreetmap-tiles)

---

## 💳 PayPal API

### תיאור כללי
API לעיבוד תשלומים אונליין דרך PayPal. משמש ליצירת הזמנות תשלום ולכידתן.

### פרטים טכניים
- **Provider**: PayPal Inc.
- **מיקום בקוד**: [paypalService.js](../server/api/services/paypalService.js)
- **Protocol**: HTTPS + REST API
- **Authentication**: OAuth 2.0 (Client Credentials Flow)
- **Response Format**: JSON

### Base URLs
```
Production:  https://api-m.paypal.com
Sandbox:     https://api-m.sandbox.paypal.com
```

### Endpoints בשימוש

#### 1. OAuth Token
```
POST /v1/oauth2/token
Authorization: Basic {base64(CLIENT_ID:CLIENT_SECRET)}
Content-Type: application/x-www-form-urlencoded

Body: grant_type=client_credentials
```

**Response:**
```json
{
  "access_token": "A21AAL...",
  "token_type": "Bearer",
  "expires_in": 32400
}
```

#### 2. Create Order
```
POST /v2/checkout/orders
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

Body: {
  "intent": "CAPTURE",
  "purchase_units": [...],
  "application_context": {...}
}
```

**Response:**
```json
{
  "id": "ORDER_ID",
  "status": "CREATED",
  "links": [...]
}
```

#### 3. Capture Order
```
POST /v2/checkout/orders/{orderId}/capture
Authorization: Bearer {ACCESS_TOKEN}
```

**Response:**
```json
{
  "id": "ORDER_ID",
  "status": "COMPLETED",
  "purchase_units": [...]
}
```

### משתני סביבה נדרשים
```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox  # או 'live' לפרודקשן
```

### שימוש בפרויקט
- **Server Functions**: 
  - `getAccessToken()` - קבלת טוקן אימות
  - `createPayPalOrder()` - יצירת הזמנת תשלום
  - `capturePayPalOrder()` - לכידת תשלום
- **Controllers**: `paymentController.js`
- **Routes**: 
  - `POST /api/payments/create-order`
  - `POST /api/payments/capture-order`
- **Client Components**: 
  - [PaymentModal.jsx](../client/src/pages/chat/components/PaymentModal.jsx)
  - [PayPalSuccess.jsx](../client/src/pages/PayPal/PayPalSuccess.jsx)

### Limitations & Pricing
- **Sandbox**: חינמי, ללא הגבלה (לבדיקות בלבד)
- **Production**: עמלה לפי עסקה (~3.4% + ₪1.20)
- **Rate Limits**: תלוי בחשבון (בדרך כלל מספיק נדיב)

### תיעוד רשמי
- 📖 [PayPal REST API Documentation](https://developer.paypal.com/api/rest/)
- 🔑 [Get API Credentials](https://developer.paypal.com/dashboard/)
- 🧪 [Sandbox Testing](https://developer.paypal.com/tools/sandbox/)

---

## 📍 IP Geolocation Services

### תיאור כללי
שירותים לקבלת מיקום גיאוגרפי (קואורדינטות) של משתמש לפי כתובת IP שלו. משמש כגיבוי אם המשתמש לא נותן הרשאת GPS.

### אסטרטגיית Failover
הפרויקט משתמש בשני שירותים עם מנגנון fallback:
1. **Primary**: ipapi.co (אמין יותר, HTTPS)
2. **Fallback**: ip-api.com (גיבוי אם הראשון נכשל)

---

### 🔵 Primary Service: ipapi.co

#### פרטים טכניים
- **Provider**: ipapi.co
- **Protocol**: HTTPS
- **Authentication**: לא נדרש (free tier)
- **Response Format**: JSON

#### Endpoints
```
Auto-detect (by client IP):
GET https://ipapi.co/json/

Specific IP:
GET https://ipapi.co/{ip_address}/json/
```

#### Response Example
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country_name": "United States",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "timezone": "America/Los_Angeles",
  "currency": "USD"
}
```

#### Free Tier Limits
- **Requests**: 1,000/day (30,000/month)
- **Rate**: לא מוגבל לשנייה
- **HTTPS**: כן ✅

#### תיעוד רשמי
📖 https://ipapi.co/docs/

---

### 🟡 Fallback Service: ip-api.com

#### פרטים טכניים
- **Provider**: ip-api.com
- **Protocol**: HTTP (free tier) / HTTPS (pro)
- **Authentication**: לא נדרש
- **Response Format**: JSON

#### Endpoints
```
Auto-detect:
GET http://ip-api.com/json/

Specific IP:
GET http://ip-api.com/json/{ip_address}
```

#### Response Example
```json
{
  "status": "success",
  "country": "United States",
  "city": "Mountain View",
  "lat": 37.4056,
  "lon": -122.0775,
  "query": "8.8.8.8",
  "timezone": "America/Los_Angeles"
}
```

#### Free Tier Limits
- **Rate**: 45 requests/minute
- **Daily**: ללא הגבלה
- **HTTPS**: ❌ (רק בחשבון בתשלום)

#### תיעוד רשמי
📖 https://ip-api.com/docs/

---

### שימוש בפרויקט
- **מיקום בקוד**: [userController.js](../server/api/controllers/userController.js#L316-L380)
- **Function**: `getUserLocationByIP()`
- **Route**: `GET /api/users/location/ip`
- **Client Usage**: [locationUtils.js](../client/src/utils/locationUtils.js#L53)

### Logic Flow
```javascript
1. קבל IP של הלקוח (req.ip)
2. בדוק אם IP פרטי (localhost/LAN) -> השתמש ב-auto-detect
3. נסה ipapi.co (primary)
   ✅ Success -> החזר תוצאה
   ❌ Failed -> המשך ל-fallback
4. נסה ip-api.com (fallback)
   ✅ Success -> החזר תוצאה
   ❌ Failed -> החזר error
```

### הערות חשובות
⚠️ **Accuracy**: דיוק של 80-95% ברמת עיר (תלוי ב-ISP)  
⚠️ **Privacy**: לא אידיאלי למיקום מדויק - משמש רק כגיבוי  
⚠️ **Rate Limits**: יש לנטר שימוש כדי לא לחרוג מה-free tier

---

## 🗺️ OSRM API

### תיאור כללי
Open Source Routing Machine - מנוע ניתוב קוד פתוח לחישוב מסלולי נסיעה. משמש לחישוב המסלול האופטימלי בין מסייע למבקש עזרה.

### פרטים טכניים
- **Provider**: Project OSRM (Public Instance)
- **מיקום בקוד**: [requestsController.js](../server/api/controllers/requestsController.js#L1296)
- **Protocol**: HTTPS
- **Authentication**: לא נדרש
- **Response Format**: JSON (GeoJSON geometries)

### Base URL
```
https://router.project-osrm.org
```

### Endpoint בשימוש

#### Route Service
```
GET /route/v1/driving/{lon1},{lat1};{lon2},{lat2}
```

**Query Parameters:**
- `overview=full` - מחזיר את כל נקודות המסלול (לא רק סיכום)
- `geometries=geojson` - מחזיר קואורדינטות בפורמט GeoJSON
- `steps=true` - (אופציונלי) הוראות ניווט צעד-צעד
- `alternatives=true` - (אופציונלי) מסלולים חלופיים

**Example Request:**
```
GET https://router.project-osrm.org/route/v1/driving/34.7818,32.0853;34.9730,32.7940?overview=full&geometries=geojson
```

**Response Example:**
```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {
        "type": "LineString",
        "coordinates": [[34.7818, 32.0853], [34.78, 32.09], ...]
      },
      "distance": 85432.5,  // מטרים
      "duration": 4512.8,   // שניות
      "weight": 4512.8
    }
  ],
  "waypoints": [
    {"location": [34.7818, 32.0853], "name": "..."},
    {"location": [34.9730, 32.7940], "name": "..."}
  ]
}
```

### שימוש בפרויקט
- **Route**: `GET /api/requests/route`
- **Query Params**: `lat1`, `lon1`, `lat2`, `lon2`
- **Use Case**: הצגת מסלול צפוי במפה לפני קבלת עזרה
- **Client**: טרם ממומש בצד הלקוח (מוכן בשרת)

### Limitations
⚠️ **Public Instance**: 
- זהו שרת ציבורי ללא SLA
- מוגבל לשימוש סביר (fair use)
- עלול להיות איטי בשעות עומס
- **לא מומלץ לפרודקשן בקנה מידה גדול**

### המלצות לפרודקשן
להריץ OSRM instance פרטי:
```bash
# Docker example
docker run -t -i -p 5000:5000 -v "${PWD}:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/israel-latest.osrm
```

### תיעוד רשמי
- 📖 [OSRM API Documentation](http://project-osrm.org/docs/v5.24.0/api/)
- 💻 [GitHub Repository](https://github.com/Project-OSRM/osrm-backend)
- 🚀 [Self-Hosting Guide](http://project-osrm.org/docs/v5.24.0/)

---

## 🗺️ OpenStreetMap Tiles

### תיאור כללי
אריחי מפה (map tiles) מ-OpenStreetMap - מסד נתוני מפות קוד פתוח. משמש להצגת המפה הבסיסית בממשק המשתמש.

### פרטים טכניים
- **Provider**: OpenStreetMap Foundation
- **מיקום בקוד**: [MapLive.jsx](../client/src/components/MapLive/MapLive.jsx#L459)
- **Protocol**: HTTPS
- **Authentication**: לא נדרש
- **Format**: PNG images (256x256 pixels)

### Tile URL Pattern
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Parameters:**
- `{s}` - Subdomain (a, b, או c) - לאיזון עומס
- `{z}` - Zoom level (0-19)
- `{x}` - Tile X coordinate
- `{y}` - Tile Y coordinate

### שימוש בפרויקט
```jsx
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/>
```

### Tile Usage Policy
⚠️ **חובות שימוש**:
1. **Attribution**: חובה להציג את ה-copyright notice
2. **Rate Limiting**: לא יותר מ-2 requests/second לכל domain
3. **User-Agent**: יש לשלוח User-Agent תקין
4. **Caching**: מומלץ לשמור cache של tiles
5. **Heavy Usage**: אם יש הרבה תנועה - יש להריץ tile server משלך

### Alternatives
לפרודקשן מומלץ לשקול:
- **Mapbox** (בתשלום, יציב מאוד)
- **Maptiler** (בתשלום, כולל free tier)
- **Self-hosted Tile Server** (חינמי, דורש תחזוקה)

### תיעוד רשמי
- 📖 [Tile Usage Policy](https://wiki.openstreetmap.org/wiki/Tile_usage_policy)
- 🗺️ [OpenStreetMap Main Site](https://www.openstreetmap.org/)
- 🛠️ [Switch2OSM Guide](https://switch2osm.org/)

---

## 📊 סיכום וסטטיסטיקות

### APIs בשימוש - סיכום
| API | Type | Cost | Authentication | Usage |
|-----|------|------|----------------|-------|
| PayPal | Payment | עמלה לעסקה | OAuth 2.0 | תשלומים |
| ipapi.co | Geolocation | Free (1K/day) | ❌ | מיקום IP (primary) |
| ip-api.com | Geolocation | Free (45/min) | ❌ | מיקום IP (fallback) |
| OSRM | Routing | Free | ❌ | חישוב מסלולים |
| OSM Tiles | Mapping | Free | ❌ | הצגת מפה |

### שיקולי פרודקשן

#### 🟢 מוכן לפרודקשן
- ✅ **PayPal** - יציב, מומלץ (עם API keys נכונים)
- ✅ **ipapi.co** - יציב ל-traffic נמוך-בינוני

#### 🟡 מצריך שיפור
- ⚠️ **ip-api.com** - HTTP only, rate limits
- ⚠️ **OSRM Public** - אין SLA, שימוש סביר בלבד
- ⚠️ **OSM Tiles** - יש להקפיד על usage policy

#### המלצות
1. **Monitoring**: להוסיף ניטור למכסות API
2. **Caching**: לשמור תוצאות של IPs חוזרים
3. **Self-Hosting**: לשקול OSRM ו-tile server פרטיים לסקייל גדול
4. **Fallbacks**: המשך להשתמש במנגנון fallback הקיים

---

**עדכון אחרון**: ינואר 2026  
**גרסה**: 1.0

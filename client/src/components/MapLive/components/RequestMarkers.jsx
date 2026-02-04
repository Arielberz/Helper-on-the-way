/*
  קובץ זה אחראי על:
  - הצגת מרקרים של בקשות עזרה על המפה
  - פופאפים עם פרטי הבקשה ואפשרות להקצאה
  - אייקונים שונים לסוגי בעיות שונים
  - אינטראקציה עם בקשות על המפה
*/

import React from "react";
import { Marker, Popup } from "react-leaflet";
import { getUserId } from "../../../utils/authUtils";
import { getProblemIcon, getProblemTypeLabel } from "../../../utils/iconUtils";

export default function RequestMarkers({
  sharedMarkers,
  routes,
  position,
  fetchRoute,
  openChat,
  isPhoneVerified,
  onVerifyPhoneClick,
}) {
  const currentUserId = getUserId();

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "ממתין";
      case "assigned":
        return "שוייך";
      default:
        return status;
    }
  };

  return (
    <>
      {sharedMarkers
        .filter((m) => m.location?.lat && m.location?.lng)
        .filter((m) => m.status !== 'cancelled' && m.status !== 'completed')
        .map((m) => {
          const isMyRequest =
            m.user?._id === currentUserId || m.user?.id === currentUserId;

          const alreadyRequested = m.pendingHelpers?.some(
            (ph) =>
              ph.user?._id === currentUserId || ph.user?.id === currentUserId
          );

          const isAssignedHelper =
            m.helper === currentUserId || m.helper?._id === currentUserId;

          const routeInfo = routes[m._id || m.id];

          return (
            <Marker
              key={m._id || m.id}
              position={[m.location.lat, m.location.lng]}
              icon={getProblemIcon(m.problemType)}
            >
              <Popup className="request-popup">
                <div className="request-popup-content">
                  <div className="popup-header">
                    {m.user?.username || "Unknown User"}
                  </div>

                  {m.photos && m.photos.length > 0 && m.photos[0] && (
                    <img
                      src={typeof m.photos[0] === 'string' ? m.photos[0] : m.photos[0].url}
                      alt="Request"
                      className="popup-image"
                    />
                  )}

                  <div className="popup-info">
                    <span className="popup-type">
                      {getProblemTypeLabel(m.problemType)}
                      {m.payment?.offeredAmount > 0 && (
                        <span className="popup-price">
                          {' '}
                          {m.payment.helperAmount || Math.round(m.payment.offeredAmount * 0.9 * 10) / 10}
                          {m.payment.currency === 'ILS' ? '₪' : '$'}
                        </span>
                      )}
                    </span>
                    <span className={`popup-status ${m.status || 'pending'}`}>
                      {getStatusLabel(m.status || 'pending')}
                    </span>
                  </div>

                  {m.description && (
                    <div className="popup-description">{m.description}</div>
                  )}

                  {routeInfo && (
                    <div className="popup-route-info">
                      🚗 {(routeInfo.distance / 1000).toFixed(1)} km • ⏱️ {Math.round(routeInfo.duration / 60)} min
                    </div>
                  )}

                  {!routeInfo && !isMyRequest && position && position[0] && position[1] && (
                    <button
                      onClick={() =>
                        fetchRoute(
                          m._id || m.id,
                          position[0],
                          position[1],
                          m.location.lat,
                          m.location.lng
                        )
                      }
                      className="popup-btn primary"
                    >
                      🗺️ הצג מסלול
                    </button>
                  )}

                  {!isMyRequest && (
                    <>
                      {!isPhoneVerified && (
                        <div className="popup-phone-warning">
                          <div style={{ marginBottom: '8px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#dc2626' }}>
                            📱 צריך לאמת מספר טלפון
                          </div>
                          <button
                            onClick={onVerifyPhoneClick}
                            className="popup-btn primary"
                          >
                            אמת טלפון
                          </button>
                        </div>
                      )}
                      
                      {isPhoneVerified && m.status === "pending" && !alreadyRequested && (
                        <button
                          onClick={() => openChat(m)}
                          className="popup-btn success"
                        >
                          🙋 אני רוצה לעזור
                        </button>
                      )}

                      {m.status === "pending" && alreadyRequested && (
                        <div className="popup-btn-waiting">
                          ⏳ ממתין לאישור
                        </div>
                      )}

                      {m.status === "assigned" && isAssignedHelper && (
                        <>
                          <button
                            onClick={() => openChat(m)}
                            className="popup-btn primary"
                          >
                            💬 פתח צ'אט
                          </button>
                          {!routeInfo && position && position[0] && position[1] && (
                            <button
                              onClick={() =>
                                fetchRoute(
                                  m._id || m.id,
                                  position[0],
                                  position[1],
                                  m.location.lat,
                                  m.location.lng
                                )
                              }
                              className="popup-btn success"
                            >
                              🚗 נווט
                            </button>
                          )}
                        </>
                      )}

                      {m.status === "assigned" && !isAssignedHelper && (
                        <div className="popup-btn-disabled">
                          👤 עוזר שוייך
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </>
  );
}


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
          // Check if current user is the requester
          const isMyRequest =
            m.user?._id === currentUserId || m.user?.id === currentUserId;

          // Check if current user has already requested to help
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
                  {/* Requester Name */}
                  <div className="popup-header">
                    {m.user?.username || "Unknown User"}
                  </div>

                  {/* Image (only if exists) */}
                  {m.photos && m.photos.length > 0 && m.photos[0] && (
                    <img
                      src={typeof m.photos[0] === 'string' ? m.photos[0] : m.photos[0].url}
                      alt="Request"
                      className="popup-image"
                    />
                  )}

                  {/* Problem Type + Payment + Status */}
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

                  {/* Description */}
                  {m.description && (
                    <div className="popup-description">{m.description}</div>
                  )}

                  {/* Route Info */}
                  {routeInfo && (
                    <div className="popup-route-info">
                      🚗 {(routeInfo.distance / 1000).toFixed(1)} km • ⏱️ {Math.round(routeInfo.duration / 60)} min
                    </div>
                  )}

                  {/* Route Button */}
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

                  {/* Action Buttons for non-requesters */}
                  {!isMyRequest && (
                    <>
                      {m.status === "pending" && !alreadyRequested && (
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


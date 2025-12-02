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

  return (
    <>
      {sharedMarkers
        .filter((m) => m.location?.lat && m.location?.lng)
        .map((m) => {
          // Check if current user is the requester
          const isMyRequest =
            m.user?._id === currentUserId || m.user?.id === currentUserId;

          // Check if current user has already requested to help
          const alreadyRequested = m.pendingHelpers?.some(
            (ph) =>
              ph.user?._id === currentUserId || ph.user?.id === currentUserId
          );

          return (
            <Marker
              key={m._id || m.id}
              position={[m.location.lat, m.location.lng]}
              icon={getProblemIcon(m.problemType)}
            >
              <Popup>
                <strong>{m.user?.username || "משתמש לא ידוע"}</strong>
                <br />
                {m.problemType &&
                  `בעיה: ${getProblemTypeLabel(m.problemType)}`}
                <br />
                {m.description && `תיאור: ${m.description}`}
                <br />
                סטטוס: {m.status || "pending"}
                <br />
                {/* Show route info if available */}
                {routes[m._id || m.id] && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    🚗 מרחק:{" "}
                    {(routes[m._id || m.id].distance / 1000).toFixed(2)} ק"מ
                    <br />
                    ⏱️ זמן: {Math.round(routes[m._id || m.id].duration / 60)}{" "}
                    דק'
                  </div>
                )}
                {/* Show route button - available for everyone except the requester */}
                {!routes[m._id || m.id] &&
                  !isMyRequest &&
                  position &&
                  position[0] &&
                  position[1] && (
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
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium w-full"
                    >
                      🗺️ הצג מסלול
                    </button>
                  )}
                {!isMyRequest && (
                  <>
                    {m.status === "pending" && !alreadyRequested && (
                      <button
                        onClick={() => openChat(m)}
                        className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium w-full"
                      >
                        🙋 אני רוצה לעזור
                      </button>
                    )}
                    {m.status === "pending" && alreadyRequested && (
                      <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium text-center">
                        ⏳ ממתין לאישור
                      </div>
                    )}
                    {m.status === "assigned" &&
                      (m.helper === currentUserId ||
                        m.helper?._id === currentUserId) && (
                        <>
                          <button
                            onClick={() => openChat(m)}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium w-full"
                          >
                            💬 פתח צ'אט
                          </button>
                          {/* Auto-show route for assigned helper */}
                          {!routes[m._id || m.id] &&
                            position &&
                            position[0] &&
                            position[1] && (
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
                                className="mt-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium w-full"
                              >
                                🚗 הצג ניווט
                              </button>
                            )}
                        </>
                      )}
                    {m.status === "assigned" &&
                      m.helper !== currentUserId &&
                      m.helper?._id !== currentUserId && (
                        <div className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium text-center">
                          👤 כבר שובץ עוזר
                        </div>
                      )}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
    </>
  );
}

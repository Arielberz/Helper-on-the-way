import React, { useEffect, useRef } from "react";

export default function MessageList({
  messages,
  currentUserId,
  selectedConversation,
  handleConfirmCompletion,
  handleAcceptPayment,
  isAcceptingPayment,
  etaData,
  requestStatus,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Render persistent ETA message
  const renderEtaMessage = () => {
    // Only show for assigned requests
    if (requestStatus !== 'assigned') return null;
    
    // If no ETA data yet, show a "calculating" message
    if (!etaData) {
      return (
        <div className="sticky top-0 z-10 flex justify-center mb-4 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-transparent">
          <div
            className="max-w-[90%] px-4 py-3 rounded-xl text-center"
            style={{
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(14, 165, 233, 0.2)",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.15)",
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl animate-bounce">🚗</span>
              <div className="text-sky-700">
                <p className="text-sm font-medium">העוזר בדרך אליך</p>
                <p className="text-xs text-sky-600">מחשב זמן הגעה משוער...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    const roundedMinutes = Math.max(1, Math.round(etaData.etaMinutes));
    const isArriving = etaData.etaMinutes < 1;
    
    return (
      <div className="sticky top-0 z-10 flex justify-center mb-4 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-transparent">
        <div
          className="max-w-[90%] px-4 py-3 rounded-xl text-center animate-pulse-subtle"
          style={{
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(14, 165, 233, 0.2)",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.15)",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{isArriving ? '📍' : '🚗'}</span>
            <div className="text-sky-700">
              {isArriving ? (
                <p className="font-semibold">העוזר כמעט הגיע!</p>
              ) : (
                <>
                  <p className="text-sm font-medium">העוזר בדרך אליך</p>
                  <p className="text-base font-bold">
                    {etaData.distanceKm !== undefined && !isNaN(etaData.distanceKm) && (
                      <>{etaData.distanceKm.toFixed(1)} ק"מ • </>
                    )}
                    ~{roundedMinutes} {roundedMinutes === 1 ? 'דקה' : 'דקות'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      {/* Persistent ETA Message - Always visible at top */}
      {renderEtaMessage()}
      
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-[var(--text-secondary)]">
          <p className="mb-1 text-lg">השיחה ריקה</p>
          <p className="text-sm">שלח הודעה כדי להתחיל</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {messages.map((msg, idx) => {
              const senderId =
                msg.sender?._id?.toString() || msg.sender?.toString() || "";
              const isMe = senderId === currentUserId;

              // Check if this is a system message (end treatment notification or payment)
              const isSystemMessage =
                msg.isSystemMessage ||
                msg.systemMessageType === "end_treatment" ||
                msg.systemMessageType === "payment_sent" ||
                msg.systemMessageType === "payment_pending" ||
                msg.systemMessageType === "payment_accepted";
              const isRequester =
                currentUserId === selectedConversation.user?._id;
              const isHelper =
                currentUserId === selectedConversation.helper?._id;

              // System message for end treatment or payment
              if (isSystemMessage) {
                return (
                  <div key={idx} className="flex justify-center my-4">
                    <div
                      className="max-w-[85%] px-4 py-3 rounded-xl text-center"
                      style={{
                        backgroundColor: "var(--glass-bg-strong)",
                        backdropFilter: "blur(var(--glass-blur))",
                        WebkitBackdropFilter: "blur(var(--glass-blur))",
                        border: "1px solid var(--glass-border)",
                        boxShadow: "var(--glass-shadow)",
                      }}
                    >
                      <p
                        className="text-sm font-medium mb-3"
                        style={{ color: "var(--primary-dark)" }}
                      >
                        {msg.content}
                      </p>

                      {/* End treatment confirmation button - for requester */}
                      {msg.systemMessageType === "end_treatment" &&
                        isRequester &&
                        selectedConversation.request?.status !== "completed" && (
                          <button
                            onClick={() =>
                              handleConfirmCompletion(
                                msg.requestId ||
                                  selectedConversation.request._id
                              )
                            }
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 w-full"
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "white",
                            }}
                          >
                            ✅ אשר סיום
                          </button>
                        )}

                      {/* Accept payment button - for helper */}
                      {msg.systemMessageType === "payment_pending" &&
                        isHelper &&
                        !selectedConversation.request?.payment?.isPaid && (
                          <button
                            onClick={() =>
                              handleAcceptPayment(
                                msg.requestId ||
                                  selectedConversation.request._id
                              )
                            }
                            disabled={isAcceptingPayment}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "white",
                            }}
                          >
                            {isAcceptingPayment ? "⏳ מעבד..." : "✅ אשר תשלום"}
                          </button>
                        )}

                      {msg.systemMessageType === "end_treatment" &&
                        selectedConversation.request?.status === "completed" && (
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            ✓ אושר
                          </p>
                        )}

                      <p
                        className="mt-2 text-[10px] opacity-70"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString("he-IL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              }

              // Regular message
              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`
                      max-w-[72%] rounded-2xl px-3 py-2 text-sm
                      ${
                        isMe
                          ? "rounded-br-none bg-[var(--primary)] text-white"
                          : "rounded-bl-none bg-[var(--primary-light)] text-[var(--text-main)]"
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="mt-1 text-[10px] text-left opacity-80">
                      {new Date(msg.timestamp).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

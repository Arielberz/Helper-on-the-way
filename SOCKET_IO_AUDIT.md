# Socket.IO Audit and Recommendations

Date: 2025-12-01
Branch: `socket`
Reviewer: GitHub Copilot

---

## Overview
This audit reviews the Socket.IO implementation across server and client, focusing on event names, data flow, room/join logic, error handling, performance, scalability, and security. Findings reference specific files in the repository and provide concrete, actionable fixes.

---

## Top Risks (Critical)
- Insecure room join allows subscribing to other users’ rooms.
- Client-driven global broadcasts enable spam and location leakage.
- CORS wildcard with credentials is insecure and may break in browsers.
- REST read-receipts do not emit socket events → state drift.
- Case-sensitive path imports (`Api/` vs `api/`) will crash on Linux/CI.

---

## Server Findings

- App setup
  - File: `Server/App.js`
    - Uses `new Server(server, { cors: { origin: '*', credentials: true } })`. Using `'*'` with credentials is insecure and often blocked by browsers; use an allowlist.
    - Imports use `./Api/...` while the actual directory is `api/`. Works on Windows; fails on Linux/CI. Standardize to lowercase.
    - Exposes `io` via `app.set('io', io)`; controllers emit events using `req.app.get('io')` (good).

- Socket handlers
  - File: `Server/api/sockets/chatSockets.js`
    - Auth: Verifies JWT from `handshake.auth.token` or `Authorization` header; sets `socket.userId` (good).
    - On connect: `socket.join('user:<userId>')` (good).
    - Events:
      - `join`: allows joining `user:<userId>` from arbitrary client input. This is a critical vulnerability.
      - `newRequest`: broadcasts `requestAdded` to everyone based on client payload; easy to spam the map with fake markers.
      - `toggleHelper`: broadcasts `helperAvailabilityChanged` globally, including location/settings; leaks to all clients.
      - `join_conversation`: verifies membership then joins `conversation:<id>` (good).
      - `leave_conversation`: leaves room (fine).
      - `send_message`: verifies membership, persists, emits `new_message` to `conversation:<id>` (good).
      - `mark_as_read`: verifies membership, marks read, emits `messages_read` to `user:<otherUserId>` (good).
      - `typing`: emits `user_typing` to conversation without re-checking membership; no throttling.
    - Error events: emits `'error'` as an application event and also listens to `'error'`. This collides with Socket.IO’s reserved error semantics.

- Controller-driven emits
  - File: `Server/api/Controllers/requestsController.js`
    - Emits `helperRequestReceived` to `user:<request.user>` when a helper requests to help.
    - Emits `helperConfirmed` to `user:<helperId>` when confirmed.
    - Room user ID formatting is inconsistent; sometimes `toString()`, sometimes raw. Normalize.

---

## Client Findings

- Shared socket provider
  - File: `client/src/context/HelperRequestContext.jsx`
    - Creates a socket at mount only; if token becomes available after login, the socket never connects until a full refresh. Consider depending on auth state or moving provider inside protected routes.
    - Listens to `helperRequestReceived` and `helperConfirmed`. Does not listen for server-side application error events.

- Map & notifications
  - File: `client/src/components/MapLive/MapLive.jsx`
    - Listens to `requestAdded`, `new_message`, and `messages_read`.
    - Emits `newRequest` and `toggleHelper` directly to server, which the server currently broadcasts globally. This is unsafe and allows abuse.

- Chat badge
  - File: `client/src/components/IconChat/IconChat.jsx`
    - Increments unread count on every `new_message` received without checking whether the sender is the current user (badge may increase on the sender side).

- Chat page
  - File: `client/src/pages/chat/chat.jsx`
    - Uses sockets correctly for join/send. Marks read via REST (`PATCH /read`) which does not notify the remote party by socket.

---

## Event Map (current)

- Server receives
  - `join` → joins arbitrary `user:<userId>` room (insecure)
  - `newRequest` → `socket.broadcast.emit('requestAdded', request)` (global)
  - `toggleHelper` → `socket.broadcast.emit('helperAvailabilityChanged', {...})` (global)
  - `join_conversation`, `leave_conversation`, `send_message`, `mark_as_read`, `typing`

- Server emits
  - `requestAdded` (global)
  - `helperAvailabilityChanged` (global)
  - `joined_conversation`, `left_conversation`
  - `new_message` to `conversation:<id>`
  - `messages_read` to `user:<otherUserId>`

- Controllers emit
  - `helperRequestReceived` to `user:<request.user>`
  - `helperConfirmed` to `user:<helperId>`

- Client listens
  - MapLive: `requestAdded`, `new_message`, `messages_read`
  - HelperRequestContext: `helperRequestReceived`, `helperConfirmed`
  - IconChat: `new_message`, `messages_read`
  - Chat: `new_message`

---

## Issues and Concrete Fixes

1) Insecure room join (critical)
- Problem: `socket.on('join', (userId) => socket.join('user:' + userId))` allows joining anyone’s room.
- Fix: Remove the `join` event entirely; you already auto-join on connect. If kept, enforce `if (userId !== socket.userId) return;`.
- File: `Server/api/sockets/chatSockets.js`

2) Client-driven global broadcasts (critical)
- Problem: `newRequest` and `toggleHelper` accept client payload and broadcast globally (`requestAdded`, `helperAvailabilityChanged`). Abuse and data leakage risk.
- Fix: Remove these socket endpoints. Trigger real-time updates server-side after authenticated REST actions; target only relevant audiences (e.g., per-user or area-based rooms).
- Files: `Server/api/sockets/chatSockets.js`, `client/src/components/MapLive/MapLive.jsx`

3) CORS wildcard with credentials (high)
- Problem: `origin: '*'` with `credentials: true` is insecure and ineffective.
- Fix: Use env-based allowlist: `origin: [process.env.CLIENT_ORIGIN]` (or array) for both Express and Socket.IO; only set `credentials: true` if cookies are used.
- File: `Server/App.js`

4) REST read receipts don’t notify via socket (medium)
- Problem: `chatController.markMessagesAsRead` updates DB but does not emit `messages_read` to the other user; only the socket path does.
- Fix: In `markMessagesAsRead`, after save, compute `otherUserId` and emit `messages_read` via `req.app.get('io')`.
- File: `Server/api/Controllers/chatController.js`

5) Case-sensitive imports (medium)
- Problem: `./Api/...` imports while folder is `api/`; fails on Linux/CI.
- Fix: Change to `./api/...` for routers and sockets imports.
- File: `Server/App.js`

6) Application error event name collision (medium)
- Problem: Using `'error'` for application messages conflicts with Socket.IO’s reserved error event.
- Fix: Rename to namespaced events like `chat:error` or use acknowledgements (callbacks) for request/response.
- File: `Server/api/sockets/chatSockets.js` (+ add client listeners if needed)

7) Typing event authorization and noise (low/medium)
- Problem: `typing` does not re-check membership/rate; could be noisy or abused.
- Fix: Verify membership (socket is in room), optionally throttle (`socket.volatile.to(...).emit(...)`) or add per-socket rate limiting.
- File: `Server/api/sockets/chatSockets.js`

8) User room naming consistency (low)
- Problem: Inconsistent usage of `String(userId)` vs raw values for `user:<id>` rooms.
- Fix: Normalize: `const userRoom = `user:${String(userId)}`;` everywhere (controllers and sockets).
- Files: `requestsController.js`, `chatSockets.js`

9) Client socket lifecycle after login (low/medium)
- Problem: Socket created once at provider mount; if token is set later, socket never connects until refresh.
- Fix: Re-run socket init on token change (via auth context or storage subscription) or mount provider inside protected routes.
- File: `client/src/context/HelperRequestContext.jsx`

10) Unread badge increments on own messages (low)
- Problem: `IconChat` increments unread count for all `new_message` events without checking sender.
- Fix: Include `currentUserId` and only increment when `message.sender !== currentUserId`.
- File: `client/src/components/IconChat/IconChat.jsx`

11) Performance: monolithic conversation documents (advisory)
- Problem: `messages` embedded in conversation grow unbounded; reading large docs gets expensive.
- Fix (future): Move to separate `Message` collection with indexes; paginate on client.
- Files: `Server/api/models/chatModel.js` (future), `chatController.js` (future)

12) Scalability: single-node rooms (advisory)
- Problem: Without a Socket.IO adapter, rooms won’t synchronize across processes/instances.
- Fix: Add Redis adapter (`@socket.io/redis-adapter`) when scaling horizontally.
- File: `Server/App.js` (future)

13) Logging/monitoring (advisory)
- Problem: Mixed console logs; no structured logging.
- Fix: Use `pino`/`winston`; include event names, userId, conversationId; control via env.

---

## Quick Code Suggestions (snippets)

- Remove insecure join
```js
// Server/api/sockets/chatSockets.js
// Remove this entirely
// socket.on('join', (userId) => {
//   socket.join(`user:${userId}`);
// });
```

- Lock down CORS
```js
// Server/App.js
const allowedOrigins = (process.env.CLIENT_ORIGINS || '').split(',').filter(Boolean);
const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  credentials: true,
};
app.use(cors(corsOptions));
const io = new Server(server, { cors: corsOptions });
```

- Emit messages_read on REST path
```js
// Server/api/Controllers/chatController.js
const io = req.app.get('io');
if (io) {
  const otherUserId = conversation.user.toString() === userId
    ? conversation.helper.toString()
    : conversation.user.toString();
  io.to(`user:${otherUserId}`).emit('messages_read', { conversationId, readBy: userId });
}
```

- Normalize room naming
```js
const userRoom = (id) => `user:${String(id)}`;
io.to(userRoom(otherUserId)).emit('messages_read', { /* ... */ });
```

- Typing verification
```js
socket.on('typing', ({ conversationId, isTyping }) => {
  const room = `conversation:${conversationId}`;
  if (!socket.rooms.has(room)) return; // verify joined
  socket.volatile.to(room).emit('user_typing', { conversationId, userId: socket.userId, isTyping });
});
```

- IconChat unread check
```js
const handleNewMessage = (data) => {
  const { message } = data || {};
  if (!message) return;
  if (message.sender !== currentUserId) setUnreadCount((prev) => prev + 1);
};
```

---

## Action Plan

- Phase 1 (Immediate)
  - Remove `join`, `newRequest`, and `toggleHelper` socket endpoints (server + client callers).
  - Restrict CORS to allowlisted origins.
  - Fix case-sensitive imports in `Server/App.js` from `./Api/...` to `./api/...`.

- Phase 2 (Short-term)
  - Add socket emission to `markMessagesAsRead` (REST path).
  - Rename app-level `error` events to `chat:error` or use acknowledgements.
  - Add membership verification for `typing` and consider throttling.
  - Fix `IconChat` unread increment logic.
  - Make socket provider react to token changes or mount under protected routes.

- Phase 3 (Scale/Performance)
  - Introduce Socket.IO Redis adapter for horizontal scaling.
  - Migrate messages to separate collection with pagination and indexes.
  - Add structured logging and basic rate limits per socket.

---

## Verification Checklist
- [ ] Only one socket connection per logged-in user
- [ ] Users cannot join other users’ rooms
- [ ] No client-sourced global broadcasts
- [ ] CORS uses explicit allowlist
- [ ] REST mark-as-read emits `messages_read`
- [ ] `typing` events only from room members, throttled
- [ ] Chat badge increments only for messages from others
- [ ] Imports work on case-sensitive filesystems
- [ ] Optional: rooms sync across instances when scaled

---

## Notes
- The report documents issues and proposed fixes; it does not change code. If you want, I can apply the Phase 1 patches now and run a quick verification.

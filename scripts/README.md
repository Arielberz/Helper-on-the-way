# Project Verification Scripts

## verify.mjs

End-to-end sanity check script that verifies the entire project works correctly.

### What it does:
1. ✅ Installs all dependencies (client + server)
2. ✅ Builds the client successfully
3. ✅ Starts the server
4. ✅ Waits for port 3001 to be ready
5. ✅ Performs HTTP health check
6. ✅ Cleans up (stops server)

### Usage:

From project root:
```bash
npm run verify
```

### Expected Output:

```
=================================
🔍 Project Verification Starting
=================================

🚀 Starting server...
✓ Server process started
✓ Server process launched

⏳ Waiting for server on port 3001...
✓ Server is responding on port 3001

🏥 Performing health check...
✓ Health check passed

=================================
✅ VERIFICATION PASSED
=================================

All systems operational:
  ✓ Client builds successfully
  ✓ Server starts correctly
  ✓ Server responds to requests
```

### Troubleshooting:

**Server fails to start:**
- Check that MongoDB is running and `.env` is configured
- Verify `MONGO_URI` and `JWT_SECRET` are set
- Check port 3001 is not already in use

**Build fails:**
- Run `npm run install:all` manually
- Check for syntax errors in client code
- Verify Node.js version compatibility

**Timeout:**
- Server may be slow to connect to MongoDB
- Default timeout is 30 seconds
- Check MongoDB connection string

### Notes:

- This is NOT unit testing - it's a dev sanity check
- No application logic is modified
- Server is automatically stopped after verification
- Safe to run multiple times

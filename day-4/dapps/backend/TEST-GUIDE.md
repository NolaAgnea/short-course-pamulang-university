# 🧪 Task 5 - Integration Testing Guide

## Testing Backend API Day 4

### Prerequisites

- Backend server running on `http://localhost:3000`
- Contract deployed on Avalanche Fuji Testnet
- Internet connection for RPC access

---

## ✅ **Test 1: Health Check**

**URL:** `GET http://localhost:3000/`

**Expected Response:**

```json
{
  "message": "Hello World!"
}
```

**Status:** `200 OK`

---

## ✅ **Test 2: Read Smart Contract Value (Task 2)**

**URL:** `GET http://localhost:3000/blockchain/value`

**Method:** GET

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "value": "60",
    "contractAddress": "0x8b427e7f1291dc686bd32315afafe44be50fefce",
    "blockNumber": "12345678",
    "timestamp": "2026-01-18T10:30:00.000Z"
  }
}
```

**Status:** `200 OK`

**Test in Browser:**

```
http://localhost:3000/blockchain/value
```

**Test with cURL:**

```bash
curl http://localhost:3000/blockchain/value
```

**Test with PowerShell:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/blockchain/value" -Method Get
```

---

## ✅ **Test 3: Query Events (Task 3)**

**URL:** `POST http://localhost:3000/blockchain/events`

**Method:** POST

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "fromBlock": 7318000,
  "toBlock": 7320000
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "blockNumber": "7318123",
        "value": "60",
        "txHash": "0xabc123...",
        "logIndex": 0
      }
    ],
    "pagination": {
      "fromBlock": 7318000,
      "toBlock": 7320000,
      "totalEvents": 1
    },
    "contractAddress": "0x8b427e7f1291dc686bd32315afafe44be50fefce",
    "timestamp": "2026-01-18T10:30:00.000Z"
  }
}
```

**Status:** `200 OK`

**Test with cURL:**

```bash
curl -X POST http://localhost:3000/blockchain/events \
  -H "Content-Type: application/json" \
  -d "{\"fromBlock\": 7318000, \"toBlock\": 7320000}"
```

**Test with PowerShell:**

```powershell
$body = @{
    fromBlock = 7318000
    toBlock = 7320000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/blockchain/events" -Method Post -Body $body -ContentType "application/json"
```

---

## ✅ **Test 4: Error Handling - Block Range Too Large (Task 4)**

**URL:** `POST http://localhost:3000/blockchain/events`

**Body:**

```json
{
  "fromBlock": 1000000,
  "toBlock": 1005000
}
```

**Expected Response:**

```json
{
  "statusCode": 500,
  "message": "Block range too large. Maximum 2048 blocks per request.",
  "error": "Internal Server Error"
}
```

**Status:** `500 Internal Server Error`

---

## ✅ **Test 5: Error Handling - Negative Block Numbers (Task 4)**

**URL:** `POST http://localhost:3000/blockchain/events`

**Body:**

```json
{
  "fromBlock": -100,
  "toBlock": 1000
}
```

**Expected Response:**

```json
{
  "statusCode": 500,
  "message": "Block numbers must be positive.",
  "error": "Internal Server Error"
}
```

**Status:** `500 Internal Server Error`

---

## ✅ **Test 6: Error Handling - Invalid Block Order (Task 4)**

**URL:** `POST http://localhost:3000/blockchain/events`

**Body:**

```json
{
  "fromBlock": 2000,
  "toBlock": 1000
}
```

**Expected Response:**

```json
{
  "statusCode": 500,
  "message": "fromBlock must be less than or equal to toBlock.",
  "error": "Internal Server Error"
}
```

**Status:** `500 Internal Server Error`

---

## 📊 **Swagger API Documentation (Task 4)**

**URL:** `http://localhost:3000/api`

Open in browser to see interactive API documentation with:

- All endpoints listed
- Request/Response examples
- Try it out functionality

---

## 🧪 **Running Automated Tests (Task 5)**

### Run E2E Tests:

```bash
# Using npm
npm run test:e2e

# Using pnpm
pnpm test:e2e

# Using yarn
yarn test:e2e
```

### Expected Output:

```
Blockchain API Integration Tests (e2e)
  GET /blockchain/value
    ✓ should return current contract value with metadata (XXms)
    ✓ should handle RPC errors gracefully (XXms)
  POST /blockchain/events
    ✓ should return events with valid block range (XXms)
    ✓ should reject block range > 2048 (Task 4 - Validation) (XXms)
    ✓ should reject negative block numbers (XXms)
    ✓ should reject fromBlock > toBlock (XXms)
    ✓ should handle missing parameters (XXms)
  GET / (Health Check)
    ✓ should return API status (XXms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

---

## ✅ **Checklist - Task Completion**

### **Task 1 - Setup Blockchain Module** ✅

- [x] Module `blockchain` created
- [x] viem public client configured
- [x] Avalanche Fuji RPC connected

### **Task 2 - Read Smart Contract** ✅

- [x] Endpoint `GET /blockchain/value` created
- [x] Returns JSON response with value
- [x] Includes metadata (blockNumber, timestamp, contractAddress)

### **Task 3 - Event Query** ✅

- [x] Endpoint `POST /blockchain/events` created
- [x] Returns ValueUpdated events
- [x] Includes blockNumber, value, txHash, logIndex

### **Task 4 - API Design** ✅

- [x] Pagination support (fromBlock, toBlock)
- [x] Consistent response format (success, data)
- [x] Error handling (block range validation)
- [x] Swagger API documentation
- [x] Metadata in responses (timestamp, contractAddress)

### **Task 5 - Integration Test** ✅

- [x] E2E test suite created
- [x] Tests for all endpoints
- [x] Error handling tests
- [x] Manual testing guide created
- [x] Postman/cURL examples provided

---

## 🎯 **How to Test Everything (Step by Step)**

1. **Start Backend Server:**

   ```bash
   cd dapps/backend
   pnpm start:dev
   ```

2. **Open Swagger Documentation:**
   - Browser: `http://localhost:3000/api`
   - Test all endpoints interactively

3. **Manual Browser Test:**
   - Open: `http://localhost:3000/blockchain/value`
   - Should see JSON response with contract value

4. **Postman Test:**
   - Import endpoints
   - Test GET /blockchain/value
   - Test POST /blockchain/events with different scenarios

5. **Run Automated Tests:**

   ```bash
   pnpm test:e2e
   ```

   - All tests should pass ✅

6. **Verify Error Handling:**
   - Test with invalid block range
   - Test with negative numbers
   - Test with invalid order

---

## 📸 **Screenshot untuk Submission**

Ambil screenshot:

1. ✅ Swagger UI showing all endpoints
2. ✅ Browser showing `/blockchain/value` response
3. ✅ Postman showing `/blockchain/events` request & response
4. ✅ Terminal showing test results (all passed)
5. ✅ Backend server running without errors

---

## 🚀 **Ready for Submission!**

Jika semua test di atas berhasil, backend API Anda sudah memenuhi semua requirements Task 1-5! 🎉

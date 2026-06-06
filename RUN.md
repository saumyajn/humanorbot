# Local Development Setup

Run all three applications simultaneously in separate terminal windows.

## 1. Python Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Verify:

```bash
http://localhost:8000/health
```

Expected response:

```json
{"status":"We are online"}
```

## 2. Node.js Middleware

```bash
cd middleware
npm install
node server.js
```

Verify the console shows the middleware listening on port `3000`.

## 3. Angular Frontend

```bash
cd frontend
npm install
npm start
```

Verify:

```bash
http://localhost:4200
```

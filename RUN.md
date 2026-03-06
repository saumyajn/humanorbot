Part 1: Local Development Setup
To run all three applications simultaneously on your machine, follow these steps in separate terminal windows:

1. Python Backend (FastAPI/Flask)
Navigate: cd backend

Install: pip install -r requirements.txt

Run: python main.py or uvicorn main:app --reload

Verify: Open http://localhost:8000/health to see {"status": "ok"}.

2. Node.js Middleware (Socket.io)
Navigate: cd middleware

Install: npm install

Run: npm run dev or node server.js

Verify: Check the console for "Server running on port 3000".

3. Angular Frontend
Navigate: cd frontend

Install: npm install

Run: npm start

Verify: Open http://localhost:4200 in your browser.

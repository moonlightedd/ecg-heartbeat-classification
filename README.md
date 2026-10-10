# ECG Heartbeat Classification API

Educational backend for the existing React/Vite frontend.

## Local setup

Use Python 3.11 or 3.12 for the pinned scikit-learn version.

```bash
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install dependencies and start the API:
```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check: http://127.0.0.1:8000/health
API docs: http://127.0.0.1:8000/docs

## Frontend connection

In the frontend project root, create `.env.local`:
```text
VITE_API_URL=http://127.0.0.1:8000
```

Restart the Vite development server after adding/changing this variable.

For deployment, set `VITE_API_URL` to the deployed backend URL and set `FRONTEND_ORIGINS` on the backend to the exact frontend origin. Rebuild the frontend after changing `VITE_API_URL`.

## API contract

`GET /health`

`POST /predict`
```json
{
  "signals": [[0.0, 0.1, "... 187 numeric values total ..."]]
}
```

Response:
```json
{
  "results": [
    {"predictedClass": "N", "confidence": 0.98}
  ]
}
```

`confidence` is the maximum `predict_proba` output. It is not a clinically validated or calibrated probability of correctness.

## Important

- Each row must contain exactly 187 finite numerical values.
- The API accepts at most 5,000 rows per request.
- Do not upload identifiable patient data to a public deployment.
- This is an educational demonstration, not a medical diagnostic system.
- Only load trusted pickle/joblib model files. The included model was supplied by the project owner.
- The model was serialized with scikit-learn 1.6.1; dependencies pin that version to reduce compatibility issues.

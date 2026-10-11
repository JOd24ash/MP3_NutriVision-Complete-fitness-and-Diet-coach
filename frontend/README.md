# NutriVision Frontend

React 19 + Vite frontend for the NutriVision dashboard, meal history, manual food entry, voice logging, health profile, and chat experience.

## Run locally

```bash
npm install
npm run dev
```

The development server runs on `http://localhost:5173` and proxies `/api` requests to the FastAPI backend on `http://localhost:8000`.

## Build

```bash
npm run build
```

## Photo-scanner status

The scanner UI currently renders sample presentation data. It does not yet upload an image to `/api/v1/meals/photo`. The backend endpoint requires an authenticated multipart request with `image`, `user_id`, `reference_object_px`, and `reference_object_real_cm`, and it needs a local fine-tuned YOLO26 segmentation checkpoint configured on the backend.

The scanner must not present a COCO-pretrained YOLO26 model as recognition for Indian dishes; unsupported labels require manual review rather than nutritional values.

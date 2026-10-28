
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import pipeline

app = FastAPI(title="FoodVerse AI - Food Recognition")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


classifier = None


@app.get("/")
def home():
    return {
        "message": "FoodVerse AI recognition API is running"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    global classifier

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 10 MB."
        )

    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not open this image. Try a JPG or PNG."
        )

    try:
        if classifier is None:
            classifier = pipeline(
                "image-classification",
                model="nateraw/food"
            )

        results = classifier(image, top_k=3)

        predictions = [
            {
                "food": result["label"],
                "confidence": round(float(result["score"]) * 100, 2)
            }
            for result in results
        ]

        return {
            "success": True,
            "predicted_food": predictions[0]["food"],
            "confidence": predictions[0]["confidence"],
            "predictions": predictions
        }

    except Exception as error:
        print("Food recognition error:", error)
        raise HTTPException(
            status_code=500,
            detail=(
                "Food recognition failed. Check the terminal "
                "for the error and try again."
            )
        )

@app.post("/freshness")
async def check_freshness(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 10 MB."
        )

    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not open this image. Try a JPG or PNG."
        )

    return {
        "success": True,
        "message": "Image received successfully.",
        "analysis_status": "not_configured",
        "notice": (
            "A freshness-specific model is not configured yet. "
            "Image appearance alone cannot establish food safety."
        ),
        "image_size": {
            "width": image.width,
            "height": image.height
        }
    }

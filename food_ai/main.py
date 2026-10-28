
from io import BytesIO
import torch
from food_ai.hygiene import assess_kitchen_image
from torchvision import models, transforms
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import pipeline

app = FastAPI(title="FoodVerse AI - Food Recognition")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("APP FILE:", __file__)
print("CORS CONFIG:", app.user_middleware)
print("CORS MIDDLEWARES:", app.user_middleware)


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

# Freshness detection model
freshness_model = None

freshness_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    ),
])

def load_freshness_model():
    global freshness_model

    if freshness_model is None:
        model = models.mobilenet_v2(weights=None)
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(0.3),
            torch.nn.Linear(model.classifier[1].in_features, 2)
        )

        weights_path = (
            Path(__file__).resolve().parent.parent
            / "models"
            / "freshness_mobilenetv2_state_dict.pth"
        )

        state_dict = torch.load(
            weights_path,
            map_location="cpu",
            weights_only=True
        )

        model.load_state_dict(state_dict)
        model.eval()
        freshness_model = model

    return freshness_model



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
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

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
        model = load_freshness_model()
        image_tensor = freshness_transform(image).unsqueeze(0)

        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1)[0]
            predicted_class = int(torch.argmax(probabilities).item())

        # Class order documented by the model: fresh = 0, stale = 1
        label = "Fresh" if predicted_class == 0 else "Stale"
        confidence = round(float(probabilities[predicted_class].item()) * 100, 2)

        return {
            "success": True,
            "predicted_freshness": label,
            "confidence": confidence,
            "image_size": {
                "width": image.width,
                "height": image.height
            },
            "notice": (
                "This is an AI estimate based on visible appearance. "
                "It does not establish whether food is safe to eat."
            )
        }

    except Exception as error:
        print("Freshness detection error:", error)
        raise HTTPException(
            status_code=500,
            detail="Freshness prediction failed. Check the backend terminal."
        )

@app.post("/api/kitchen-hygiene")
async def kitchen_hygiene(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 10 MB."
        )

    result = assess_kitchen_image(image_bytes)

    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    return result


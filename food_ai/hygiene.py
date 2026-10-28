
import cv2
import numpy as np


def assess_kitchen_image(image_bytes):
    """
    Performs basic image validation for the Kitchen Hygiene feature.
    This does not independently detect germs or prove cleanliness.
    """

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        return {
            "success": False,
            "message": "Could not read this image. Please upload a valid kitchen photo."
        }

    height, width = image.shape[:2]

    if width < 100 or height < 100:
        return {
            "success": False,
            "message": "Please upload a clearer, larger kitchen photo."
        }

    return {
        "success": True,
        "message": "Kitchen image uploaded successfully.",
        "image_width": width,
        "image_height": height,
        "assessment": "Image received. A visual hygiene assessment model is not connected yet.",
        "hygiene_checklist": [
            "Keep raw and cooked foods separate.",
            "Wash hands before handling food.",
            "Clean and sanitize food preparation surfaces.",
            "Store perishable food at safe temperatures.",
            "Keep utensils and kitchen equipment clean."
        ],
        "disclaimer": "An image alone cannot confirm that a kitchen is germ-free or safe."
    }


from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample recipes for our first Python API

def get_recipes():
    import json
    from urllib.request import urlopen

    try:
        with urlopen("http://127.0.0.1:5000/api/recipes") as response:
            data = json.loads(response.read().decode("utf-8"))

        return data.get("recipes", [])

    except Exception as error:
        print("Could not get recipes from Node.js:", error)
        return []



@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to FoodVerse AI Python API!"
    })


@app.route("/api/match", methods=["POST"])
def match_recipes():
    data = request.get_json(silent=True) or {}

    ingredients = data.get("ingredients", [])

    if not isinstance(ingredients, list):
        return jsonify({
            "error": "Ingredients must be a list."
        }), 400

    ingredients = [
        item.strip().lower()
        for item in ingredients
        if isinstance(item, str) and item.strip()
    ]

    

    matches = []

    for recipe in get_recipes():
        recipe_ingredients = [
            item.strip().lower()
            for item in recipe.get("ingredients", [])
            if isinstance(item, str)
        ]

        matched_ingredients = [
            ingredient
            for ingredient in ingredients
            if ingredient in recipe_ingredients
        ]

        if matched_ingredients:
            match_percentage = (
                len(matched_ingredients) / len(ingredients)
            ) * 100

            recipe_result = recipe.copy()
            recipe_result["matched_ingredients"] = matched_ingredients
            recipe_result["missing_ingredients"] = [
                ingredient
                for ingredient in recipe_ingredients
                if ingredient not in ingredients
            ]
            recipe_result["match_percentage"] = round(match_percentage)

            matches.append(recipe_result)

    matches.sort(
        key=lambda recipe: recipe["match_percentage"],
        reverse=True
    )

    return jsonify({
        "success": True,
        "count": len(matches),
        "recipes": matches
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)

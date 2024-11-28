from pymongo import MongoClient
from bson.objectid import ObjectId
import jwt
import numpy as np
from flask import Flask, request, jsonify

SECRET_KEY = "your_secret_key"

# MongoDB connection
client = MongoClient("mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/user?retryWrites=true&w=majority")
db = client["movie-mbti"]

mbti_collection = db["mbti_list"]
movies_scores_collection = db["movies_scores"]

def calculate_pearson_correlation(user_ratings, neighbor_ratings):
    """
    Calculate Pearson Correlation Coefficient between two users' ratings.
    """
    common_movies = set(user_ratings.keys()).intersection(set(neighbor_ratings.keys()))
    if not common_movies:
        return 0

    user_scores = np.array([user_ratings[movie] for movie in common_movies])
    neighbor_scores = np.array([neighbor_ratings[movie] for movie in common_movies])

    numerator = np.sum((user_scores - np.mean(user_scores)) * (neighbor_scores - np.mean(neighbor_scores)))
    denominator = np.sqrt(np.sum((user_scores - np.mean(user_scores))**2)) * np.sqrt(np.sum((neighbor_scores - np.mean(neighbor_scores))**2))

    if denominator == 0:
        return 0

    return numerator / denominator

def get_user_ratings(username):
    """
    Fetch all ratings given by a user.
    """
    ratings = movies_scores_collection.find({"username": username})
    return {rating["movieName"]: rating["score"] for rating in ratings}

def predict_rating(target_user_ratings, target_movie, neighbors):
    """
    Predict the rating for a movie using neighbors' ratings.
    """
    numerator = 0
    denominator = 0

    for neighbor in neighbors:
        neighbor_ratings = get_user_ratings(neighbor["username"])
        similarity = neighbor["similarity"]

        if target_movie in neighbor_ratings:
            numerator += similarity * neighbor_ratings[target_movie]
            denominator += abs(similarity)

    if denominator == 0:
        return 0

    return numerator / denominator

def get_recommendations(token):
    """
    Fetch movie recommendations for a user based on their MBTI type.
    """
    try:
        # Decode JWT
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_token.get("id")

        # Fetch the user's MBTI
        user_mbti = mbti_collection.find_one({"_id": ObjectId(user_id)})
        if not user_mbti or "mbti_type" not in user_mbti:
            return {"error": f"MBTI type not found for user with ID: {user_id}"}

        mbti_type = user_mbti["mbti_type"]

        # Fetch users with the same MBTI type
        same_mbti_users = mbti_collection.find({"mbti_type": mbti_type})
        same_mbti_usernames = [user["username"] for user in same_mbti_users]

        # Fetch the target user's ratings
        target_user = user_mbti["username"]
        target_user_ratings = get_user_ratings(target_user)

        # Calculate similarity with neighbors
        neighbors = []
        for neighbor_username in same_mbti_usernames:
            if neighbor_username == target_user:
                continue  # Skip self
            neighbor_ratings = get_user_ratings(neighbor_username)
            similarity = calculate_pearson_correlation(target_user_ratings, neighbor_ratings)
            if similarity > 0:
                neighbors.append({"username": neighbor_username, "similarity": similarity})

        # Fetch all movies and predict ratings
        all_movies = movies_scores_collection.distinct("movieName")
        recommendations = []

        # ใช้ Set เพื่อเก็บหนังที่เพิ่มเข้ามาแล้ว
        added_movies = set()

        for movie in all_movies:
            if movie not in target_user_ratings and movie not in added_movies:
                predicted_rating = predict_rating(target_user_ratings, movie, neighbors)
                recommendations.append({"movieName": movie, "predictedRating": predicted_rating})
                added_movies.add(movie)  # เพิ่มหนังลงใน Set เพื่อป้องกันซ้ำ

        # Sort and limit the recommendations
        recommendations = sorted(recommendations, key=lambda x: x["predictedRating"], reverse=True)[:10]
        return {"mbti_type": mbti_type, "recommendations": recommendations}

    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}
    except Exception as e:
        return {"error": str(e)}


# Flask API
app = Flask(__name__)

@app.route("/recommend", methods=["POST"])
def recommend():
    token = request.headers.get("Authorization").split("Bearer ")[-1]
    return jsonify(get_recommendations(token))

if __name__ == "__main__":
    app.run(debug=True)

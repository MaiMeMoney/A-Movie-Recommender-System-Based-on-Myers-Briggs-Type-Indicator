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
    common_movies = set(user_ratings.keys()).intersection(set(neighbor_ratings.keys()))
    if not common_movies:
        return 0

    user_scores = np.array([user_ratings[movie] for movie in common_movies])
    neighbor_scores = np.array([neighbor_ratings[movie] for movie in common_movies])

    numerator = np.sum((user_scores - np.mean(user_scores)) * (neighbor_scores - np.mean(neighbor_scores)))
    denominator = np.sqrt(np.sum((user_scores - np.mean(user_scores))**2)) * np.sqrt(np.sum((neighbor_scores - np.mean(neighbor_scores))**2))

    return numerator / denominator if denominator != 0 else 0

def get_user_ratings(username):
    ratings = movies_scores_collection.find({"username": username})
    return {rating["movieName"]: rating["score"] for rating in ratings}

def predict_rating(target_user_ratings, target_movie, neighbors):
    numerator = 0
    denominator = 0

    for neighbor in neighbors:
        neighbor_ratings = get_user_ratings(neighbor["username"])
        similarity = neighbor["similarity"]

        if target_movie in neighbor_ratings:
            numerator += similarity * neighbor_ratings[target_movie]
            denominator += abs(similarity)

    return numerator / denominator if denominator != 0 else 0

def get_recommendations(token):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_token.get("id")

        # ตรวจสอบว่าผู้ใช้มีข้อมูล MBTI หรือไม่
        user_mbti = mbti_collection.find_one({"_id": ObjectId(user_id)})
        if not user_mbti or "mbti_type" not in user_mbti:
            return {"error": f"MBTI type not found for user with ID: {user_id}"}, 404

        mbti_type = user_mbti["mbti_type"]
        target_user = user_mbti["username"]

        target_user_ratings = get_user_ratings(target_user)

        # ค้นหาผู้ใช้ที่มี MBTI เดียวกัน
        same_mbti_users = mbti_collection.find({"mbti_type": mbti_type})
        neighbors = []
        for user in same_mbti_users:
            if user["username"] == target_user:
                continue
            neighbor_ratings = get_user_ratings(user["username"])
            similarity = calculate_pearson_correlation(target_user_ratings, neighbor_ratings)
            if similarity > 0:
                neighbors.append({"username": user["username"], "similarity": similarity})

        # ดึงหนังทั้งหมดและคำนวณคะแนน
        all_movies = movies_scores_collection.distinct("movieName")
        recommendations = []

        for movie in all_movies:
            if movie not in target_user_ratings:
                predicted_rating = predict_rating(target_user_ratings, movie, neighbors)
                if predicted_rating > 0:
                    recommendations.append({"movieName": movie, "predictedRating": predicted_rating})

        # จัดลำดับผลลัพธ์
        sorted_recommendations = sorted(recommendations, key=lambda x: x["predictedRating"], reverse=True)[:10]
        return {"mbti_type": mbti_type, "recommendations": sorted_recommendations}, 200

    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}, 401
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}, 401
    except Exception as e:
        # เพิ่มการ Debug ให้เห็นข้อผิดพลาดชัดเจน
        print(f"Unexpected error in get_recommendations: {str(e)}")
        return {"error": f"Unexpected error: {str(e)}"}, 500


# Flask API
app = Flask(__name__)

@app.route("/recommend", methods=["POST"])
def recommend():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("Authorization Header not provided or invalid format")
        return jsonify({"error": "Token not provided or invalid format"}), 401

    token = auth_header.split("Bearer ")[-1]

    try:
        # Decode token เพื่อตรวจสอบ
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print("Decoded Token:", decoded_token)

        # เพิ่ม Debug: ตรวจสอบ Body ของคำขอ
        if not request.json or "username" not in request.json:
            print("Request Body is invalid or missing 'username'")
            return jsonify({"error": "Invalid request body"}), 400

        username = request.json.get("username")
        print("Username from request body:", username)

        recommendations, status = get_recommendations(token)
        return jsonify(recommendations), status
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500



if __name__ == "__main__":
    app.run(debug=True, port=5003)

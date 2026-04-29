from flask import Blueprint, jsonify
from database import Gesture, Category

gestures_bp = Blueprint('gestures_bp', __name__)

@gestures_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "description": c.description
    } for c in categories])

@gestures_bp.route('/gestures', methods=['GET'])
def get_gestures():
    gestures = Gesture.query.filter_by(is_active=True).all()
    output = []
    for g in gestures:
        output.append({
            "id": g.id,
            "name": g.primary_name,
            "description": g.description,
            "video_url": g.video_url,
            "difficulty": float(g.base_difficulty_rate),
            "is_dynamic": g.is_dynamic,
            "synonyms": [s.name for s in g.synonyms]
        })
    return jsonify(output)
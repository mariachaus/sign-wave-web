from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from database import db, User, UserSetting

settings_bp = Blueprint('settings', __name__)

# --- НОВИЙ МАРШРУТ: Отримання всіх налаштувань ---
@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    settings = UserSetting.query.filter_by(user_id=user_id).first()

    if not user or not settings:
        return jsonify({"error": "Data not found"}), 404

    return jsonify({
        "profile": {
            "username": user.username,
            "email": user.email
        },
        "ui": {
            "theme": settings.theme,
            "landmark_color": settings.landmark_color,
            "is_landmarks_visible": settings.is_landmarks_visible,
            "font_size": float(settings.font_size_multiplier), # Numeric конвертуємо у float
            "email_notifications": settings.is_email_notifications_enabled,
            "is_mirror_view_enabled": settings.is_mirror_view_enabled
        }
    }), 200

# 1. Оновлення персональної інформації
@settings_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json

    if not user:
        return jsonify({"error": "User not found"}), 404

    new_username = data.get('username')
    if new_username and new_username != user.username:
        if User.query.filter_by(username=new_username).first():
            return jsonify({"error": "Username already taken"}), 400
        user.username = new_username

    new_email = data.get('email')
    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email already taken"}), 400
        user.email = new_email

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

# 2. Оновлення технічних налаштувань (Тема, Колір, Текст, Дзеркало)
@settings_bp.route('/update-ui', methods=['PUT'])
@jwt_required()
def update_ui():
    user_id = get_jwt_identity()
    settings = UserSetting.query.filter_by(user_id=user_id).first()
    data = request.json

    if not settings:
        return jsonify({"error": "Settings not found"}), 404

    if 'theme' in data:
        settings.theme = data.get('theme')
    if 'landmark_color' in data:
        settings.landmark_color = data.get('landmark_color')
    if 'is_landmarks_visible' in data:
        settings.is_landmarks_visible = data.get('is_landmarks_visible')
    if 'font_size' in data:
        settings.font_size_multiplier = data.get('font_size')
    if 'email_notifications' in data:
        settings.is_email_notifications_enabled = data.get('email_notifications')
    
    # Додано Mirror View згідно з твоєю БД
    if 'is_mirror_view_enabled' in data:
        settings.is_mirror_view_enabled = data.get('is_mirror_view_enabled')

    db.session.commit()
    return jsonify({"message": "UI settings updated"}), 200

# 3. Зміна пароля
@settings_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json

    old_pw = data.get('old_password')
    new_pw = data.get('new_password')

    if not user.password_hash:
        return jsonify({"error": "Google users cannot change password"}), 400

    if not check_password_hash(user.password_hash, old_pw):
        return jsonify({"error": "Incorrect old password"}), 400

    user.password_hash = generate_password_hash(new_pw)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200

# 4. Видалення акаунту
@settings_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account deleted forever"}), 200
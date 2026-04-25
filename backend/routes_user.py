from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, User, UserStreak, UserErrorLog, UserGestureStat, UserAchievement, Achievement

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        # Отримуємо ID з токена та конвертуємо в int
        user_id = int(get_jwt_identity())
        
        # Завантажуємо користувача разом зі стріком (оптимізація)
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # 1. Статистика помилок (кількість рядків у логах)
        errors_made = UserErrorLog.query.filter_by(user_id=user_id).count()

        # 2. Вивчені жести (унікальні жести з високим показником успіху)
        signs_learned = UserGestureStat.query.filter_by(user_id=user_id).filter(
            UserGestureStat.correct_count >= 5
        ).count()

        # 3. Сума всіх правильних відповідей (загальний прогрес)
        # Використовуємо scalar() для отримання чистого числа
        total_correct = db.session.query(
            db.func.sum(UserGestureStat.correct_count)
        ).filter(UserGestureStat.user_id == user_id).scalar() or 0

        # 4. Отримуємо досягнення ОДНИМ запитом через JOIN
        # Це набагато швидше, ніж цикли for у Python
        achievements_query = db.session.query(Achievement, UserAchievement.earned_at).join(
            UserAchievement, Achievement.id == UserAchievement.achievement_id
        ).filter(
            UserAchievement.user_id == user_id
        ).order_by(
            UserAchievement.earned_at.desc()
        ).limit(5).all()

        ach_list = [{
            "id": ach.Achievement.id,
            "title": ach.Achievement.title,
            "description": ach.Achievement.description,
            "icon_url": ach.Achievement.icon_url,
            "points_awarded": ach.Achievement.points_awarded,
            "earned_at": ach.earned_at.isoformat() # Додаємо дату отримання!
        } for ach in achievements_query]

        # Формуємо фінальну відповідь
        return jsonify({
            "username": user.username,
            "joined_at": user.created_at.strftime("%d %B %Y") if user.created_at else "Unknown",
            "total_xp": user.total_xp,
            "avatar_url": user.avatar_url,
            "current_streak": user.streak.current_streak if user.streak else 0,
            "longest_streak": user.streak.longest_streak if user.streak else 0,
            "achievements": ach_list,
            "stats": {
                "errors_made": errors_made, 
                "errors_corrected": int(total_correct),
                "signs_learned": signs_learned
            }
        }), 200

    except Exception as e:
        # Логування помилки для розробника
        print(f"Error in get_profile: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
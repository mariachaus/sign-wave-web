from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
# Додано UserAchievement та Achievement в імпорт
from database import db, User, UserSetting, UserStreak, UserAchievement, Achievement 

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "Відсутні обов'язкові поля"}), 400

    # 1. Перевірка, чи користувач вже існує
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Користувач з таким логіном або email вже існує"}), 400

    try:
        # 2. Хешування пароля
        hashed_pw = generate_password_hash(password)
        
        # 3. Створення нового користувача
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_pw,
            total_xp=0  # Початкове значення
        )
        
        db.session.add(new_user)
        db.session.flush()  # Отримуємо ID користувача для зв'язаних таблиць

        # 4. Створення початкових налаштувань та стріків
        new_settings = UserSetting(user_id=new_user.id)
        new_streak = UserStreak(user_id=new_user.id)
        
        db.session.add(new_settings)
        db.session.add(new_streak)

        # --- НОВА ЛОГІКА ДОСЯГНЕНЬ ---
        # 5. Шукаємо досягнення "First Wave"
        welcome_ach = Achievement.query.filter_by(title='First Wave').first()
        
        if welcome_ach:
            # Створюємо запис про отримання досягнення
            user_ach = UserAchievement(
                user_id=new_user.id,
                achievement_id=welcome_ach.id
            )
            db.session.add(user_ach)
            
            # Нараховуємо XP користувачу
            new_user.total_xp += welcome_ach.points_awarded
        # -----------------------------
        
        # Фіксуємо всі зміни в БД однією транзакцією
        db.session.commit()
        
        return jsonify({"message": "Реєстрація успішна! Досягнення 'First Wave' отримано."}), 201
    
    except Exception as e:
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "username": user.username,
            "user_id": user.id
        }), 200
    
    return jsonify({"error": "Неправильний логін або пароль"}), 401
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db  # Імпортуємо об'єкт бази даних
from routes_ml import ml_bp
from auth import auth_bp
from routes_user import user_bp

app = Flask(__name__)

# 1. КОНФІГУРАЦІЯ
# База даних (PostgreSQL)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:12345678@localhost:5432/sign-language-db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Безпека (JWT)
app.config["JWT_SECRET_KEY"] = "super-secret-key" 

# 2. ІНІЦІАЛІЗАЦІЯ РОЗШИРЕНЬ
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
db.init_app(app)
jwt = JWTManager(app)

# 3. РЕЄСТРАЦІЯ МОДУЛІВ (BLUEPRINTS)
app.register_blueprint(ml_bp)
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')

# 4. ГОЛОВНИЙ МАРШРУТ
@app.route('/', methods=['GET'])
def ping():
    return "<h1>Сервер працює: ML та Auth модулі активні</h1>"

# 5. АВТОМАТИЧНЕ СТВОРЕННЯ ТАБЛИЦЬ
with app.app_context():
    try:
        db.create_all()
        print("✅ Таблиці бази даних успішно перевірені/створені!")
    except Exception as e:
        print(f"❌ Помилка при створенні таблиць: {e}")

@app.route('/test_db')
def test_db():
    try:
        from database import User
        # Спробуємо знайти будь-якого юзера або просто перевірити зв'язок
        num_users = User.query.count()
        return f"Зв'язок з БД є! Кількість користувачів у таблиці: {num_users}"
    except Exception as e:
        return f"Помилка зв'язку: {str(e)}"

# 6. ЗАПУСК СЕРВЕРА
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db  # Імпортуємо об'єкт бази даних
from routes_ml import ml_bp
from auth import auth_bp
from routes_user import user_bp
from routes_settings import settings_bp
from routes_gestures import gestures_bp

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
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(gestures_bp, url_prefix='/api/data')

# 4. ГОЛОВНИЙ МАРШРУТ
@app.route('/', methods=['GET'])
def ping():
    return "<h1>Server is working: ML and Data base connected</h1>"

# 5. АВТОМАТИЧНЕ СТВОРЕННЯ ТАБЛИЦЬ
with app.app_context():
    try:
        db.create_all()
        print("✅ Tables created/checked")
    except Exception as e:
        print(f"❌ Error creating  tables: {e}")

@app.route('/test_db')
def test_db():
    try:
        from database import User
        # Спробуємо знайти будь-якого юзера або просто перевірити зв'язок
        num_users = User.query.count()
        return f"Connected to data base. Users amount in the table: {num_users}"
    except Exception as e:
        return f"Connection error: {str(e)}"

# 6. ЗАПУСК СЕРВЕРА
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
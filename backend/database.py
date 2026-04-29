from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# --- СЕКЦІЯ КОРИСТУВАЧІВ ---

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String)
    google_id = db.Column(db.String, unique=True)
    avatar_url = db.Column(db.String)
    total_xp = db.Column(db.Integer, default=0)
    role = db.Column(db.String(20), nullable=False, default='user')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Зв'язки
    settings = db.relationship('UserSetting', backref='user', uselist=False, cascade="all, delete-orphan")
    streak = db.relationship('UserStreak', backref='user', uselist=False, cascade="all, delete-orphan")
    achievements = db.relationship('UserAchievement', backref='user', cascade="all, delete-orphan")
    xp_logs = db.relationship('UserXPLog', backref='user', cascade="all, delete-orphan")
    gesture_stats = db.relationship('UserGestureStat', backref='user', cascade="all, delete-orphan")
    lesson_progress = db.relationship('UserLessonProgress', backref='user', cascade="all, delete-orphan")
    lesson_attempts = db.relationship('UserLessonAttempt', backref='user', cascade="all, delete-orphan")
    error_logs = db.relationship('UserErrorLog', backref='user', cascade="all, delete-orphan")
    daily_tasks = db.relationship('UserDailyTask', backref='user', cascade="all, delete-orphan")

class UserSetting(db.Model):
    __tablename__ = "user_settings"
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    theme = db.Column(db.String, default='system')
    font_size_multiplier = db.Column(db.Numeric(3,2), default=1.0)
    is_mirror_view_enabled = db.Column(db.Boolean, default=True)
    is_landmarks_visible = db.Column(db.Boolean, default=True)
    landmark_color = db.Column(db.String, default='#00FF00')
    camera_fps_limit = db.Column(db.Integer, default=30)
    is_email_notifications_enabled = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserStreak(db.Model):
    __tablename__ = "user_streaks"
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_activity_at = db.Column(db.DateTime)
    freeze_shields_count = db.Column(db.Integer, default=0)
    current_streak_started_at = db.Column(db.Date)

# --- СЕКЦІЯ НАВЧАЛЬНОГО КОНТЕНТУ ---

class Level(db.Model):
    __tablename__ = "levels"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    lessons = db.relationship('Lesson', backref='level')

class Lesson(db.Model):
    __tablename__ = "lessons"
    
    id = db.Column(db.Integer, primary_key=True)
    level_id = db.Column(db.Integer, db.ForeignKey('levels.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Gesture(db.Model):
    __tablename__ = "gestures"
    
    id = db.Column(db.Integer, primary_key=True)
    primary_name = db.Column(db.String, nullable=False)
    video_url = db.Column(db.String, nullable=False)
    base_difficulty_rate = db.Column(db.Numeric(4,2), default=1.0)
    is_dynamic = db.Column(db.Boolean, default=False)
    model_label = db.Column(db.String, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    thumbnail_url = db.Column(db.String(255))
    illustration_url = db.Column(db.String(255))
    description = db.Column(db.Text)

class Category(db.Model):
    __tablename__ = "categories"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GestureCategory(db.Model):
    __tablename__ = "gesture_categories"
    
    id = db.Column(db.Integer, primary_key=True)
    gesture_id = db.Column(db.Integer, db.ForeignKey('gestures.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

class GestureSynonym(db.Model):
    __tablename__ = "gesture_synonyms"
    
    id = db.Column(db.Integer, primary_key=True)
    gesture_id = db.Column(db.Integer, db.ForeignKey('gestures.id'), nullable=False)
    name = db.Column(db.String, nullable=False)

# --- СЕКЦІЯ ВПРАВ ТА ПЛАНУВАННЯ ---

class ExerciseType(db.Model):
    __tablename__ = "exercise_types"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    technical_component_name = db.Column(db.String, nullable=False)
    base_xp = db.Column(db.Integer, default=10)

class LessonPlanExercise(db.Model):
    __tablename__ = "lesson_plan_exercises"
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    type_id = db.Column(db.Integer, db.ForeignKey('exercise_types.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    theory_content = db.Column(db.Text)
    new_gestures_count = db.Column(db.Integer, default=0)
    repeat_gestures_count = db.Column(db.Integer, default=0)
    xp_multiplier = db.Column(db.Numeric(3,2), default=1.0)

class LessonGesturesPool(db.Model):
    __tablename__ = "lesson_gestures_pool"
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    gesture_id = db.Column(db.Integer, db.ForeignKey('gestures.id'), nullable=False)
    is_new_for_this_lesson = db.Column(db.Boolean, default=True)

# --- СЕКЦІЯ ПРОГРЕСУ ТА ЛОГІВ ---

class UserLessonProgress(db.Model):
    __tablename__ = "user_lessons_progress"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    best_score = db.Column(db.Integer, default=0)
    attempts_count = db.Column(db.Integer, default=0)
    last_attempt_at = db.Column(db.DateTime)

class UserLessonAttempt(db.Model):
    __tablename__ = "user_lesson_attempts"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    status = db.Column(db.String) # started, completed, failed, abandoned
    score_achieved = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime)

class UserGestureStat(db.Model):
    __tablename__ = "user_gesture_stats"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    gesture_id = db.Column(db.Integer, db.ForeignKey('gestures.id'), nullable=False)
    correct_count = db.Column(db.Integer, default=0)
    error_count = db.Column(db.Integer, default=0)
    personal_difficulty_modifier = db.Column(db.Numeric(4,2), default=0.0)
    last_attempt_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserErrorLog(db.Model):
    __tablename__ = "user_error_logs"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    gesture_id = db.Column(db.Integer, db.ForeignKey('gestures.id'))
    exercise_id = db.Column(db.Integer, db.ForeignKey('lesson_plan_exercises.id'))
    attempt_id = db.Column(db.Integer, db.ForeignKey('user_lesson_attempts.id'))
    error_type = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# --- СЕКЦІЯ ГЕЙМІФІКАЦІЇ ---

class Achievement(db.Model):
    __tablename__ = "achievements"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    icon_url = db.Column(db.String)
    points_awarded = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserAchievement(db.Model):
    __tablename__ = "user_achievements"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserXPLog(db.Model):
    __tablename__ = "user_xp_log"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    source_type = db.Column(db.String) # lesson_completed, achievement_earned, daily_bonus
    source_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DailyTaskTemplate(db.Model):
    __tablename__ = "daily_task_templates"
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String)
    task_type = db.Column(db.String) # lesson_count, gesture_count, xp_gain, perfect_score
    target_value = db.Column(db.Integer)
    xp_reward = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)

class UserDailyTask(db.Model):
    __tablename__ = "user_daily_tasks"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_template_id = db.Column(db.Integer, db.ForeignKey('daily_task_templates.id'), nullable=False)
    current_value = db.Column(db.Integer, default=0)
    is_completed = db.Column(db.Boolean, default=False)
    assigned_at = db.Column(db.Date, default=datetime.utcnow)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // Auth
          "sign_in": "Sign In",
          "create_account": "Create Account",
          "username": "Username",
          "email": "Email",
          "email_address": "Email Address",
          "login_btn": "Login",
          "register_btn": "Register",
          "no_account_signup": "Don't have an account? Sign Up",
          "have_account_signin": "Already have an account? Sign In",

          // Main dashboard
          "tab_image": "Image Mode",
          "tab_webcam": "Webcam Mode",
          "tab_video_data": "Video Data",
          "my_profile": "My Profile",
          "image_detection": "Image Detection",
          "live_testing": "Live Testing",
          "extract_sequences": "Extract Sequences",
          "download_csv": "Download CSV",
          "download_json": "Download JSON",

          // Settings
          "settings": "Settings",
          "personal_info": "Personal information",
          "password": "Password",
          "video_settings": "Video settings",
          "language": "Language",
          "dark_mode": "Dark mode",
          "save_general": "Save General Settings",
          "status_settings_saved": "Settings saved successfully!",
          "status_profile_updated": "Profile updated successfully!",
          "error_passwords_match": "Passwords do not match!",
          "status_password_changed": "Password changed successfully!",
          "confirm_delete_account": "Are you sure you want to delete your account? This cannot be undone.",
          "camera_preview": "Camera Preview",
          "close_preview": "Close Preview",
          "sign_out": "Sign out",
          "text_size": "Text size",
          "small": "Small",
          "medium": "Medium",
          "large": "Large",
          "email_subscription": "Email subscription",
          "change_password": "Change password",
          "save_profile": "Save Profile",
          "delete_account": "Delete Account",
          "old_password": "Old password",
          "new_password": "New password",
          "confirm_password": "Confirm password",
          "save_password": "Save password",
          "skeleton_visibility": "Skeleton visibility",
          "skeleton_color": "Skeleton color",
          "mirror_view": "Mirror view",
          "test_camera": "Test camera",
          "save_video": "Save video settings",

          // Profile
          "profile_loading": "Loading...",
          "user_not_found": "User not found",
          "session_error": "Something went wrong with your session.",
          "go_to_login": "Go to Login",
          "back_to_dashboard": "Back to Dashboard",
          "joined": "Joined",
          "days_count": "days",
          "current_streak": "Current streak",
          "longest_streak": "Longest streak",
          "stats": "Stats",
          "errors_made": "Errors made",
          "errors_corrected": "Errors corrected",
          "xp_earned": "XP earned",
          "signs_learned": "Signs learned",
          "achievements": "Achievements",
          "view_all": "View all",
          "no_achievements": "No achievements yet.",
          "earned": "Earned",

          // Gestures
          "library_of_gestures": "Gesture Library",
          "other": "Other",
          "gestures_count": "gestures",
          "no_description": "No description available.",
          "practice_now": "Practice now",
          "similar_gestures": "Similar gestures",
        }
      },
      uk: {
        translation: {
          // Auth
          "sign_in": "Увійти",
          "create_account": "Створити акаунт",
          "username": "Ім'я користувача",
          "email": "Електронна пошта",
          "email_address": "Електронна пошта",
          "login_btn": "Увійти",
          "register_btn": "Зареєструватися",
          "no_account_signup": "Немає акаунту? Зареєструватися",
          "have_account_signin": "Вже є акаунт? Увійти",

          // Main dashboard
          "tab_image": "Зображення",
          "tab_webcam": "Вебкамера",
          "tab_video_data": "Відео дані",
          "my_profile": "Мій профіль",
          "image_detection": "Розпізнавання зображень",
          "live_testing": "Живе тестування",
          "extract_sequences": "Виділення послідовностей",
          "download_csv": "Завантажити CSV",
          "download_json": "Завантажити JSON",

          // Settings
          "settings": "Налаштування",
          "personal_info": "Особиста інформація",
          "password": "Пароль",
          "video_settings": "Налаштування відео",
          "language": "Мова",
          "dark_mode": "Темна тема",
          "save_general": "Зберегти загальні налаштування",
          "status_settings_saved": "Налаштування збережено!",
          "status_profile_updated": "Профіль оновлено!",
          "error_passwords_match": "Паролі не збігаються!",
          "status_password_changed": "Пароль змінено успішно!",
          "confirm_delete_account": "Ви впевнені, що хочете видалити акаунт? Цю дію неможливо скасувати.",
          "camera_preview": "Перегляд камери",
          "close_preview": "Закрити перегляд",
          "sign_out": "Вийти",
          "text_size": "Розмір тексту",
          "small": "Малий",
          "medium": "Середній",
          "large": "Великий",
          "email_subscription": "Підписка на розсилку",
          "change_password": "Змінити пароль",
          "save_profile": "Зберегти профіль",
          "delete_account": "Видалити акаунт",
          "old_password": "Старий пароль",
          "new_password": "Новий пароль",
          "confirm_password": "Підтвердити пароль",
          "save_password": "Зберегти пароль",
          "skeleton_visibility": "Показувати скелет",
          "skeleton_color": "Колір скелету",
          "mirror_view": "Відзеркалення відео",
          "test_camera": "Тест камери",
          "save_video": "Зберегти налаштування відео",

          // Profile
          "profile_loading": "Завантаження...",
          "user_not_found": "Користувача не знайдено",
          "session_error": "Щось пішло не так з вашою сесією.",
          "go_to_login": "Перейти до входу",
          "back_to_dashboard": "На головну",
          "joined": "Приєднано",
          "days_count": "днів",
          "current_streak": "Поточна серія",
          "longest_streak": "Найдовша серія",
          "stats": "Статистика",
          "errors_made": "Помилок зроблено",
          "errors_corrected": "Помилок виправлено",
          "xp_earned": "Набрано XP",
          "signs_learned": "Вивчено жестів",
          "achievements": "Досягнення",
          "view_all": "Дивитись всі",
          "no_achievements": "Досягнень ще немає.",
          "earned": "Отримано",

          // Gestures
          "library_of_gestures": "Бібліотека жестів",
          "other": "Інше",
          "gestures_count": "жестів",
          "no_description": "Опис відсутній.",
          "practice_now": "Вправлятися зараз",
          "similar_gestures": "Схожі жести",
        }
      }
    },
    lng: localStorage.getItem('i18nextLng') || 'uk',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "settings": "Settings",
          "personal_info": "Personal information",
          "password": "Password",
          "video_settings": "Video settings",
          "language": "Language",
          "dark_mode": "Dark mode",
          "save_general": "Save General Settings",
          "status_settings_saved": "Settings saved successfully!",
          "camera_preview": "Camera Preview",
          "close_preview": "Close Preview",
          "sign_out": "Sign out",
          "text_size": "Text size",
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
          "save_video": "Save video",
          "profile_loading": "Profile loading...",
          "user_not_found": "User not found",
          "session_error": "Something went wrong with your session.",
          "go_to_login": "Go to Login",
          "back_to_dashboard": "Back to Dashboard",
          "joined": "joined",
          "days_count": "days",
          "current_streak": "current streak",
          "longest_streak": "longest streak",
          "stats": "Stats",
          "errors_made": "errors made",
          "errors_corrected": "errors corrected",
          "xp_earned": "xp earned",
          "signs_learned": "signs learned",
          "achievements": "Achievements",
          "view_all": "View all",
          "no_achievements": "No achievements yet.",
          "earned": "earned",
          "practice_now": "Practice now",
          "library_of_gestures": "Gestures library",
          "other": "Other"
        }
      },
      uk: {
        translation: {
          "settings": "Налаштування",
          "personal_info": "Особиста інформація",
          "password": "Пароль",
          "video_settings": "Налаштування відео",
          "language": "Мова",
          "dark_mode": "Темна тема",
          "save_general": "Зберегти загальні налаштування",
          "status_settings_saved": "Налаштування збережено!",
          "camera_preview": "Перегляд камери",
          "close_preview": "Закрити перегляд",
          "sign_out": "Вийти", 
          "text_size": "Розмір тексту",
          "email_subscription": "Підписка на розсилку",
          "change_password": "Змінити пароль",
          "save_profile": "Зберегти налаштування профілю",
          "delete_account": "Видалити акаунт",
          "old_password": "Старий пароль",
          "new_password": "Новий пароль",
          "confirm_password": "Підтвердити новий пароль",
          "save_password": "Зберегти пароль",
          "skeleton_visibility": "Показувати скелет",
          "skeleton_color": "Колір скелету",
          "mirror_view": "Відзеркалення відео",
          "test_camera": "Тест камери",
          "save_video": "Зберегти налаштування відео",
          "profile_loading": "Завантаження профілю...",
          "user_not_found": "Користувача не знайдено",
          "session_error": "Щось пішло не так з вашою сесією.",
          "go_to_login": "Перейти до входу",
          "back_to_dashboard": "На головну",
          "joined": "приєднано",
          "days_count": "днів",
          "current_streak": "поточна серія",
          "longest_streak": "найкраща серія",
          "stats": "Статистика",
          "errors_made": "помилок зроблено",
          "errors_corrected": "помилок виправлено",
          "xp_earned": "набрано XP",
          "signs_learned": "вивчено жестів",
          "achievements": "Досягнення",
          "view_all": "Дивитись всі",
          "no_achievements": "Досягнень ще немає.",
          "earned": "отримано",
          "practice_now": "Вправлятися зараз",
          "library_of_gestures": "Бібліотека жестів",
          "other": "Інше"
        }
      }
    },
    lng: localStorage.getItem('i18nextLng') || 'uk', // Пріоритет мови з локального сховища
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
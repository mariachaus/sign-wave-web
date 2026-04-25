import os
import json
import random
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify

# Створюємо Blueprint замість app
ml_bp = Blueprint('ml_bp', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. ЗАВАНТАЖЕННЯ МОДЕЛІ
model = None
model_path = os.path.join(BASE_DIR, './models/sign_language_model2_lmty.h5') 

if os.path.exists(model_path):
    try:
        model = tf.keras.models.load_model(model_path)
        print("✅ ML: Модель успішно завантажено!")
    except Exception as e:
        print(f"❌ ML: Помилка завантаження моделі: {e}")
else:
    print(f"❌ ML: Файл моделі не знайдено: {model_path}")

# 2. ЗАВАНТАЖЕННЯ НАЗВ ЖЕСТІВ
LABELS = []
labels_path = os.path.join(BASE_DIR, './models/gesture_classes_lmty.json')

if os.path.exists(labels_path):
    with open(labels_path, 'r', encoding='utf-8') as f:
        LABELS = json.load(f)
    print(f"✅ ML: Завантажено класи: {LABELS}")
else:
    LABELS = ['love', 'mother', 'thank-you']
    print(f"⚠️ ML: Класи не знайдено, використано стандартні.")

# МАРШРУТИ
@ml_bp.route('/get_task', methods=['GET'])
def get_task():
    target_gesture = random.choice(LABELS)
    return jsonify({'target': target_gesture})

@ml_bp.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Модель не завантажена'}), 500

    try:
        data = request.json
        if not data or 'features' not in data:
            return jsonify({'error': 'No features provided'}), 400

        features_list = data['features']
        input_data = np.array(features_list, dtype=np.float32).reshape(1, 30, 225)

        prediction_tensor = model(input_data, training=False)
        prediction = prediction_tensor.numpy()
        
        class_id = np.argmax(prediction)
        confidence = float(prediction[0][class_id])
        label_name = LABELS[class_id]

        return jsonify({
            'label': label_name,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
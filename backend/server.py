import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import random

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. ЗАВАНТАЖЕННЯ НОВОЇ МОДЕЛІ
model = None
model_path = os.path.join(BASE_DIR, 'sign_language_model2_lmty.h5') 

print(f"Шукаю модель: {model_path}")
if os.path.exists(model_path):
    try:
        model = tf.keras.models.load_model(model_path)
        print("✅ Модель успішно завантажено!")
    except Exception as e:
        print(f"❌ Помилка завантаження моделі: {e}")
else:
    print(f"❌ Файл моделі не знайдено: {model_path}")

# 2. ДИНАМІЧНЕ ЗАВАНТАЖЕННЯ НАЗВ ЖЕСТІВ
LABELS = []
labels_path = os.path.join(BASE_DIR, 'gesture_classes_lmty.json')

if os.path.exists(labels_path):
    with open(labels_path, 'r', encoding='utf-8') as f:
        LABELS = json.load(f)
    print(f"✅ Завантажено класи: {LABELS}")
else:
    print(f"⚠️ Файл gesture_classes.json не знайдено. Використовую стандартні.")
    LABELS = ['love', 'mother', 'thank-you']

@app.route('/get_task', methods=['GET'])
def get_task():
    target_gesture = random.choice(LABELS)
    return jsonify({'target': target_gesture})

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Модель не завантажена на сервері.'}), 500

    try:
        data = request.json
        if not data or 'features' not in data:
            return jsonify({'error': 'No features provided'}), 400

        features_list = data['features']

        
        # 1 - кількість відео (одне)
        # 30 - кількість кадрів
        # 225 - кількість координат у кожному кадрі
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

    except ValueError as ve:
        print(f"Помилка розмірності: {ve}")
        return jsonify({'error': 'Неправильний розмір даних. Очікується масив з 30 кадрів по 225 точок.'}), 400
    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/', methods=['GET'])
def ping():
    return "<h1>Сервер працює</h1>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
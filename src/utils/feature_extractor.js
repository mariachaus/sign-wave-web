export const extractFeatures = (poseResult, handResult) => {
  const frameData = new Array(225).fill(0);
  
  // 1. Отримуємо координати носа (Pose landmark 0) для нормалізації
  let noseX = 0;
  let noseY = 0;
  
  if (poseResult?.landmarks?.[0]?.[0]) {
    noseX = poseResult.landmarks[0][0].x;
    noseY = poseResult.landmarks[0][0].y;
  }

  // 2. Обробка Pose
  if (poseResult?.landmarks?.[0]) {
    poseResult.landmarks[0].forEach((lm, i) => {
      if (i < 33) {
        // ВІДНІМАЄМО КООРДИНАТИ НОСА (як у ноутбуці)
        frameData[i * 3] = lm.x - noseX;
        frameData[i * 3 + 1] = lm.y - noseY;
        frameData[i * 3 + 2] = lm.z;
      }
    });
  }

  // 3. Обробка Hands
  if (handResult?.landmarks && handResult.handedness) {
    handResult.landmarks.forEach((handLandmarks, index) => {
      const label = handResult.handedness[index][0].categoryName;
      const offset = label === "Left" ? 99 : 162;

      handLandmarks.forEach((lm, i) => {
        if (i < 21) {
          const baseIdx = offset + i * 3;
          // ТАКОЖ НОРМАЛІЗУЄМО ВІДНОСНО НОСА
          frameData[baseIdx] = lm.x - noseX;
          frameData[baseIdx + 1] = lm.y - noseY;
          frameData[baseIdx + 2] = lm.z;
        }
      });
    });
  }

  return frameData;
};
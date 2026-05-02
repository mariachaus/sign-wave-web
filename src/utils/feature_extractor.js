export const extractFeatures = (poseResult, handResult) => {
  // Створюємо порожній масив на 225 значень (заповнений нулями)
  const frameData = new Array(225).fill(0);

  // 1. Витягуємо Pose (точки 0-32, разом 33 точки * 3 координати = 99 значень)
  if (poseResult && poseResult.landmarks && poseResult.landmarks[0]) {
    poseResult.landmarks[0].forEach((lm, i) => {
      if (i < 33) {
        frameData[i * 3] = lm.x;
        frameData[i * 3 + 1] = lm.y;
        frameData[i * 3 + 2] = lm.z;
      }
    });
  }

  // 2. Витягуємо Hands (точки 99-161 для лівої та 162-224 для правої)
  if (handResult && handResult.landmarks && handResult.handedness) {
    handResult.landmarks.forEach((handLandmarks, index) => {
      // БЕЗПЕЧНА ПЕРЕВІРКА: чи є дані про те, яка це рука
      const handednessInfo = handResult.handedness[index];
      if (!handednessInfo || !handednessInfo[0]) return;

      const label = handednessInfo[0].categoryName; // "Left" або "Right"
      const offset = label === "Left" ? 99 : 162;

      handLandmarks.forEach((lm, i) => {
        if (i < 21) {
          const baseIdx = offset + i * 3;
          // Перевіряємо, щоб не вийти за межі масиву (про всяк випадок)
          if (baseIdx + 2 < 225) {
            frameData[baseIdx] = lm.x;
            frameData[baseIdx + 1] = lm.y;
            frameData[baseIdx + 2] = lm.z;
          }
        }
      });
    });
  }

  return frameData;
};
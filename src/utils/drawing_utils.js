export const hiddenPoseIds = [20, 18, 22, 19, 21, 17, 25, 26, 27, 28, 29, 30, 31, 32];

// ДОДАНО: Допоміжна функція для обчислення відстані між двома точками на екрані
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function drawAllLandmarks(drawingUtils, poseResult, handResult, poseConnections, handConnections) {
    if (!drawingUtils) return;

    // 1. СИНХРОНІЗАЦІЯ (SNAP): Прикріплюємо зап'ястя тіла до зап'ястя рук
    if (poseResult?.landmarks?.[0] && handResult?.landmarks) {
        const poseLandmarks = poseResult.landmarks[0];

        // Індекси зап'ясть у MediaPipe Pose
        const POSE_LEFT_WRIST = 15;
        const POSE_RIGHT_WRIST = 16;

        handResult.landmarks.forEach((handLandmarks) => {
            const handWrist = handLandmarks[0]; 

            if (poseLandmarks[POSE_LEFT_WRIST] && poseLandmarks[POSE_RIGHT_WRIST]) {
                // Рахуємо відстань від знайденої кисті до обох зап'ясть тіла
                const distToLeft = getDistance(handWrist, poseLandmarks[POSE_LEFT_WRIST]);
                const distToRight = getDistance(handWrist, poseLandmarks[POSE_RIGHT_WRIST]);

                // Вибираємо те зап'ястя тіла, яке фізично БЛИЖЧЕ
                const targetPoseIndex = distToLeft < distToRight ? POSE_LEFT_WRIST : POSE_RIGHT_WRIST;

                // ДОДАТКОВИЙ ЗАХИСТ: 
                // Примагнічуємо тільки якщо кисть не знаходиться аномально далеко від руки 
                // (наприклад, менше ніж 20% ширини екрана). 
                // Це рятує від глітчів, коли MediaPipe знаходить випадкову "руку" на фоні.
                const THRESHOLD = 0.2; 
                
                if (Math.min(distToLeft, distToRight) < THRESHOLD) {
                    poseLandmarks[targetPoseIndex].x = handWrist.x;
                    poseLandmarks[targetPoseIndex].y = handWrist.y;
                    poseLandmarks[targetPoseIndex].z = handWrist.z;
                }
            }
        });
    }

    // 2. Малюємо Pose
    if (poseResult?.landmarks) {
        const activePoseConnections = poseConnections.filter(conn => {
            const start = conn.start ?? conn[0];
            const end = conn.end ?? conn[1];
            return !hiddenPoseIds.includes(start) && !hiddenPoseIds.includes(end);
        });

        poseResult.landmarks.forEach((landmark) => {
            drawingUtils.drawConnectors(landmark, activePoseConnections, { color: '#00FF00', lineWidth: 4 });
            drawingUtils.drawLandmarks(landmark, {
                radius: (data) => (hiddenPoseIds.includes(data.index) ? 0 : 2),
                color: '#FF0000'
            });
        });
    }

    // 3. Малюємо Hands
    if (handResult?.landmarks) {
        handResult.landmarks.forEach((landmarks) => {
            drawingUtils.drawConnectors(landmarks, handConnections, { color: "#00FF00", lineWidth: 5 });
            drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
        });
    }
}
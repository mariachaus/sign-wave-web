export const hiddenPoseIds = [20, 18, 22, 19, 21, 17, 25, 26, 27, 28, 29, 30, 31, 32];

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function drawAllLandmarks(drawingUtils, poseResult, handResult, poseConnections, handConnections) {
    if (!drawingUtils) return;

    // --- 0. Отримуємо налаштування ---
    const rawVisible = localStorage.getItem('is_landmarks_visible');
    
    const isVisible = rawVisible === null ? true : rawVisible === 'true';
    
    const skeletonColor = localStorage.getItem('skeleton_color') || '#00FF00';
    const connectionColor = localStorage.getItem('connection_color') || '#FF0000';

    if (poseResult?.landmarks?.[0] && handResult?.landmarks) {
        const poseLandmarks = poseResult.landmarks[0];
        const POSE_LEFT_WRIST = 15;
        const POSE_RIGHT_WRIST = 16;

        handResult.landmarks.forEach((handLandmarks) => {
            const handWrist = handLandmarks[0]; 
            if (poseLandmarks[POSE_LEFT_WRIST] && poseLandmarks[POSE_RIGHT_WRIST]) {
                const distToLeft = getDistance(handWrist, poseLandmarks[POSE_LEFT_WRIST]);
                const distToRight = getDistance(handWrist, poseLandmarks[POSE_RIGHT_WRIST]);
                const targetPoseIndex = distToLeft < distToRight ? POSE_LEFT_WRIST : POSE_RIGHT_WRIST;
                const THRESHOLD = 0.2; 
                
                if (Math.min(distToLeft, distToRight) < THRESHOLD) {
                    poseLandmarks[targetPoseIndex].x = handWrist.x;
                    poseLandmarks[targetPoseIndex].y = handWrist.y;
                    poseLandmarks[targetPoseIndex].z = handWrist.z;
                }
            }
        });
    }

    // ЯКЩО СКЕЛЕТ ВИМКНЕНО СТОП МАЛЮВАННЯ ТУТ
    if (!isVisible) return;

    // 2. Малюємо Pose
    if (poseResult?.landmarks) {
        const activePoseConnections = poseConnections.filter(conn => {
            const start = conn.start ?? conn[0];
            const end = conn.end ?? conn[1];
            return !hiddenPoseIds.includes(start) && !hiddenPoseIds.includes(end);
        });

        poseResult.landmarks.forEach((landmark) => {
            drawingUtils.drawConnectors(landmark, activePoseConnections, { 
                color: skeletonColor, 
                lineWidth: 4 
            });
            drawingUtils.drawLandmarks(landmark, {
                radius: (data) => (hiddenPoseIds.includes(data.index) ? 0 : 2),
                color: connectionColor
            });
        });
    }

    if (handResult?.landmarks) {
        handResult.landmarks.forEach((landmarks) => {
            drawingUtils.drawConnectors(landmarks, handConnections, { 
                color: skeletonColor, 
                lineWidth: 5 
            });
            drawingUtils.drawLandmarks(landmarks, {
                color: connectionColor,
                lineWidth: 2
            });
        });
    }
}
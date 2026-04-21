// --- 1. ПІДГОТОВКА ВЕКТОРА (Математика не змінилася) ---
export function exportLandmarksToVector(poseLandmarks, handResult) {
    const features = [];
    
    // POSE (33 точки * 3 координати = 99 значень)
    if (poseLandmarks && poseLandmarks.length > 0) {
        poseLandmarks.forEach(lm => features.push(lm.x, lm.y, lm.z));
    } else {
        for (let i = 0; i < 99; i++) features.push(0);
    }

    // HANDS (21 точка * 3 координати * 2 руки = 126 значень)
    let leftHandData = new Array(63).fill(0);
    let rightHandData = new Array(63).fill(0);

    if (handResult && handResult.landmarks) {
        for (let i = 0; i < handResult.landmarks.length; i++) {
            const landmarks = handResult.landmarks[i];
            const handedness = handResult.handednesses[i][0].categoryName; 
            const flatHand = [];
            landmarks.forEach(lm => flatHand.push(lm.x, lm.y, lm.z));

            if (handedness === "Left") leftHandData = flatHand;
            else rightHandData = flatHand;
        }
    }
    
    // Разом: 99 + 126 = 225 ознак
    return features.concat(leftHandData).concat(rightHandData);
}

// --- 2. КОНВЕРТАЦІЯ В CSV (Чиста функція) ---
export function convertToCSV(dataset) {
    if (!dataset || dataset.length === 0) return "";
    
    let str = 'label';
    // Створюємо заголовки pixel_0...pixel_224
    for (let i = 0; i < 225; i++) str += `,pixel_${i}`;
    str += '\r\n';

    dataset.forEach(row => {
        let line = row.label;
        row.data.forEach(val => {
            line += ',' + val;
        });
        str += line + '\r\n';
    });
    return str;
}

// --- 3. ФУНКЦІЯ СКАЧУВАННЯ ---
export function downloadCSVDataset(dataset) {
    if (dataset.length === 0) {
        alert("Таблиця порожня!");
        return;
    }

    const csvContent = convertToCSV(dataset);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "training_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
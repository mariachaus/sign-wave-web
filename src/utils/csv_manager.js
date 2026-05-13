export function exportLandmarksToVector(poseLandmarks, handResult) {
    const features = [];
    

    if (poseLandmarks && poseLandmarks.length > 0) {
        poseLandmarks.forEach(lm => features.push(lm.x, lm.y, lm.z));
    } else {
        for (let i = 0; i < 99; i++) features.push(0);
    }

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
    

    return features.concat(leftHandData).concat(rightHandData);
}


export function convertToCSV(dataset) {
    if (!dataset || dataset.length === 0) return "";
    
    let str = 'label';

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


export function downloadCSVDataset(dataset) {
    if (dataset.length === 0) {
        alert("Table is empty!");
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
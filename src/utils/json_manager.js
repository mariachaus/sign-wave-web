/**
 * Зберігає зібрані відео-послідовності у форматі JSON
 * Ідеально підходить для тренування LSTM нейромереж у Python
 */
export const downloadJSONDataset = (dataset) => {
    if (!dataset || dataset.length === 0) {
        alert("Немає даних для завантаження! Спочатку обробіть хоча б одне відео.");
        return;
    }

    // Перетворюємо масив даних на красивий текстовий формат JSON
    const dataStr = JSON.stringify(dataset, null, 2);
    
    // Створюємо Blob (віртуальний файл у пам'яті браузера)
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Створюємо невидиме посилання і "клікаємо" по ньому для старту завантаження
    const link = document.createElement("a");
    link.href = url;
    // Назва файлу буде унікальною завдяки часу
    link.download = `lstm_dataset_${new Date().getTime()}.json`;
    
    document.body.appendChild(link);
    link.click();
    
    // Прибираємо за собою, щоб не засмічувати пам'ять браузера
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
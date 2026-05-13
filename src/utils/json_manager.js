export const downloadJSONDataset = (dataset) => {
    if (!dataset || dataset.length === 0) {
        alert("No data! Add at least 1 video");
        return;
    }

    const dataStr = JSON.stringify(dataset, null, 2);
    
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;

    link.download = `dataset_${new Date().getTime()}.json`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
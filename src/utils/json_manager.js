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

    const labels = [...new Set(dataset.map(d => d.label))].join('_');
    link.download = `dataset_${labels}.json`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
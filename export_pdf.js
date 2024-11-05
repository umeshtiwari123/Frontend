document.getElementById('export-pdf').addEventListener('click', function (event) {
    event.preventDefault();
    document.querySelectorAll('.buttons').forEach(button => {
        button.style.display = 'none';
    });
    const container = document.createElement('div');
    const elements = document.querySelectorAll('.chart-container, .chart-labels-container, .model-section');
    elements.forEach(element => container.appendChild(element.cloneNode(true)));
    const opt = {
        margin: 0.25,
        filename: 'charts.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 4 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(container).save();
    document.querySelectorAll('.buttons').forEach(button => {
        button.style.display = 'flex';
    });
});

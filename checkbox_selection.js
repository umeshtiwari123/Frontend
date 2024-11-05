document.querySelectorAll('.model-checkboxes input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        const labelText = this.nextSibling.textContent.trim();
        console.log(labelText + ' is ' + (this.checked ? 'checked' : 'unchecked'));
        const chartLabels = document.querySelector('.chart-labels-container')
        if (this.checked) {
            const label = document.createElement('div');
            label.className = 'chart-labels';
            label.id = this.id + '-chart-label';
            const credibleInterval = document.querySelector('input[name="credible-interval"]:checked').value;
            label.innerHTML = `
            <div class="forecast-column">
                <div class="label-two">Forecast median<div class="forecast-median"></div>
                </div>
                <div class="label-two">${credibleInterval}% confidence interval<div class="confidence-interval"></div>
                </div>
                <div class="label-two">Forecast name<div class="forecast-name">${labelText}</div>
                </div>
            </div>
            `;

            document.querySelectorAll('input[name="credible-interval"]').forEach(function (intervalRadio) {
                intervalRadio.addEventListener('change', function () {
                    const newCredibleInterval = this.value;
                    label.querySelector('.confidence-interval').parentNode.innerHTML = `${newCredibleInterval}% confidence interval<div class="confidence-interval"></div>`;
                });
            });
            chartLabels.appendChild(label);

        } else {
            const existingLabel = document.getElementById(this.id + '-chart-label');
            if (existingLabel) {
                chartLabels.removeChild(existingLabel);
            }
        }
    });
});


setTimeout(() => {
    document.getElementById('forecasthub-ensemble').checked = !document.getElementById('forecasthub-ensemble').checked;
    document.getElementById('forecasthub-ensemble').dispatchEvent(new Event('change'));
}, 0);


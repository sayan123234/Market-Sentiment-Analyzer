class MarketSentimentAnalyzer {
    constructor() {
        this.bullishInputs = [];
        this.bearishInputs = [];
        this.colorInputs = {};
        this.init();
    }

    init() {
        // Get all input elements
        for (let i = 1; i <= 5; i++) {
            this.bullishInputs.push(document.getElementById(`bullish${i}`));
            this.bearishInputs.push(document.getElementById(`bearish${i}`));
        }

        this.colorInputs = {
            bullish: document.getElementById('bullishColor'),
            bearish: document.getElementById('bearishColor'),
            neutral: document.getElementById('neutralColor'),
            background: document.getElementById('bgColor')
        };

        // Add event listeners
        this.addEventListeners();
        
        // Initial update
        this.updateAnalysis();
    }

    addEventListeners() {
        // Add listeners to all argument inputs
        [...this.bullishInputs, ...this.bearishInputs].forEach(input => {
            input.addEventListener('input', () => this.updateAnalysis());
        });

        // Add listeners to color inputs
        Object.values(this.colorInputs).forEach(input => {
            input.addEventListener('change', () => this.updateColors());
        });

        // Add dropdown functionality
        this.addDropdownListeners();

        // Initial color setup
        this.updateColors();
    }

    addDropdownListeners() {
        const dropdownHeaders = document.querySelectorAll('.dropdown-header');
        
        dropdownHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const arrow = header.querySelector('.dropdown-arrow');
                
                // Toggle collapsed state
                content.classList.toggle('collapsed');
                arrow.classList.toggle('rotated');
            });
        });
    }

    updateAnalysis() {
        // Count non-empty arguments
        const bullishCount = this.bullishInputs.filter(input => input.value.trim() !== '').length;
        const bearishCount = this.bearishInputs.filter(input => input.value.trim() !== '').length;
        const totalCount = bullishCount + bearishCount;

        // Update argument display
        this.updateArgumentDisplay();

        // Calculate bias
        let bias, percentage;
        if (bullishCount > bearishCount) {
            bias = 'Bullish';
            percentage = totalCount > 0 ? Math.round((bullishCount / totalCount) * 100) : 0;
        } else if (bearishCount > bullishCount) {
            bias = 'Bearish';
            percentage = totalCount > 0 ? Math.round((bearishCount / totalCount) * 100) : 0;
        } else {
            bias = 'Neutral';
            percentage = 50;
        }

        // Update UI
        this.updateBiasDisplay(bias, percentage, bullishCount, bearishCount);
    }

    updateArgumentDisplay() {
        // Update bullish arguments
        this.bullishInputs.forEach((input, index) => {
            const cell = document.getElementById(`bullish-cell-${index + 1}`);
            cell.textContent = input.value.trim();
        });

        // Update bearish arguments
        this.bearishInputs.forEach((input, index) => {
            const cell = document.getElementById(`bearish-cell-${index + 1}`);
            cell.textContent = input.value.trim();
        });
    }

    updateBiasDisplay(bias, percentage, bullishCount, bearishCount) {
        const biasHeader = document.getElementById('biasHeader');
        const biasResult = document.getElementById('biasResult');
        const biasPercentage = document.getElementById('biasPercentage');
        const biasFill = document.getElementById('biasFill');
        const bullishCountEl = document.getElementById('bullishCount');
        const bearishCountEl = document.getElementById('bearishCount');

        // Update text content
        biasResult.textContent = bias;
        biasPercentage.textContent = `${percentage}%`;
        bullishCountEl.textContent = bullishCount;
        bearishCountEl.textContent = bearishCount;

        // Update colors based on bias
        const colors = {
            bullish: this.colorInputs.bullish.value,
            bearish: this.colorInputs.bearish.value,
            neutral: this.colorInputs.neutral.value
        };

        let biasColor;
        if (bias === 'Bullish') {
            biasColor = colors.bullish;
            biasFill.style.width = `${percentage}%`;
            biasFill.style.background = `linear-gradient(90deg, ${colors.bullish}, ${this.lightenColor(colors.bullish, 20)})`;
        } else if (bias === 'Bearish') {
            biasColor = colors.bearish;
            biasFill.style.width = `${percentage}%`;
            biasFill.style.background = `linear-gradient(90deg, ${colors.bearish}, ${this.lightenColor(colors.bearish, 20)})`;
        } else {
            biasColor = colors.neutral;
            biasFill.style.width = '50%';
            biasFill.style.background = `linear-gradient(90deg, ${colors.neutral}, ${this.lightenColor(colors.neutral, 20)})`;
        }

        biasHeader.style.backgroundColor = biasColor;
        biasResult.style.color = biasColor;
    }

    updateColors() {
        const colors = {
            bullish: this.colorInputs.bullish.value,
            bearish: this.colorInputs.bearish.value,
            neutral: this.colorInputs.neutral.value,
            background: this.colorInputs.background.value
        };

        // Update table headers
        document.querySelector('.bullish-header').style.backgroundColor = colors.bullish;
        document.querySelector('.bearish-header').style.backgroundColor = colors.bearish;

        // Update table cells background
        document.querySelectorAll('.table-cell').forEach(cell => {
            cell.style.backgroundColor = colors.background;
        });

        // Update bias display
        this.updateAnalysis(); // Recalculate to apply new colors
    }

    lightenColor(color, percent) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Lighten
        const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
        const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
        const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));

        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MarketSentimentAnalyzer();
});
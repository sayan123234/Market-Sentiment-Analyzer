class MarketSentimentAnalyzer {
    constructor() {
        this.bullishInputs = [];
        this.bearishInputs = [];
        this.colorInputs = {};
        this.tickerInput = null;
        this.defaultValues = {
            bullishColor: '#27ae60',
            bearishColor: '#e74c3c',
            neutralColor: '#95a5a6',
            bgColor: '#ffffff'
        };
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

        // Get ticker input
        this.tickerInput = document.getElementById('tickerInput');

        // Get control elements
        this.resetButton = document.getElementById('resetButton');
        this.saveButton = document.getElementById('saveButton');
        this.customizationBtn = document.getElementById('customizationBtn');
        this.customizationMenu = document.getElementById('customizationMenu');
        this.loadingOverlay = document.getElementById('loadingOverlay');

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

        // Add listener to ticker input
        this.tickerInput.addEventListener('input', () => this.updateTickerDisplay());

        // Add listeners to color inputs
        Object.values(this.colorInputs).forEach(input => {
            input.addEventListener('change', () => this.updateColors());
        });

        // Add reset button listener
        this.resetButton.addEventListener('click', () => this.resetAllValues());

        // Add save button listener
        this.saveButton.addEventListener('click', () => this.saveScreenshot());

        // Add customization dropdown listeners
        this.customizationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCustomizationDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.customizationMenu.contains(e.target) && !this.customizationBtn.contains(e.target)) {
                this.closeCustomizationDropdown();
            }
        });

        // Prevent dropdown from closing when clicking inside
        this.customizationMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Add argument section dropdown functionality
        this.addArgumentDropdownListeners();

        // Initial color setup
        this.updateColors();
        this.updateTickerDisplay();
    }

    addArgumentDropdownListeners() {
        const dropdownHeaders = document.querySelectorAll('.arguments-group .dropdown-header');
        
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

    async saveScreenshot() {
        try {
            // Show loading overlay
            this.showLoadingOverlay();
            
            // Disable save button during processing
            this.saveButton.disabled = true;
            
            // Get the screenshot area element
            const screenshotArea = document.getElementById('screenshot-area');
            
            if (!screenshotArea) {
                throw new Error('Screenshot area not found');
            }

            // html2canvas options for better quality
            const options = {
                backgroundColor: '#ffffff',
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                width: screenshotArea.offsetWidth,
                height: screenshotArea.offsetHeight,
                onclone: (clonedDoc) => {
                    // Ensure cloned elements maintain their styling
                    const clonedArea = clonedDoc.getElementById('screenshot-area');
                    if (clonedArea) {
                        clonedArea.style.position = 'static';
                        clonedArea.style.transform = 'none';
                    }
                }
            };

            // Generate canvas from the screenshot area
            const canvas = await html2canvas(screenshotArea, options);
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png', 1.0);
            });

            // Generate filename
            const ticker = this.tickerInput.value.trim().toUpperCase();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = ticker 
                ? `${ticker}_Market_Analysis_${timestamp}.png`
                : `Market_Analysis_${timestamp}.png`;

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            // Show success feedback
            this.showSaveSuccess();
            
        } catch (error) {
            console.error('Error saving screenshot:', error);
            this.showSaveError(error.message);
        } finally {
            // Hide loading overlay and re-enable button
            this.hideLoadingOverlay();
            this.saveButton.disabled = false;
        }
    }

    showLoadingOverlay() {
        this.loadingOverlay.classList.add('show');
    }

    hideLoadingOverlay() {
        this.loadingOverlay.classList.remove('show');
    }

    showSaveSuccess() {
        // Add visual feedback to save button
        const originalText = this.saveButton.innerHTML;
        this.saveButton.innerHTML = '<span class="save-icon">✅</span>Saved!';
        this.saveButton.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        
        setTimeout(() => {
            this.saveButton.innerHTML = originalText;
            this.saveButton.style.background = 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)';
        }, 2000);
    }

    showSaveError(message) {
        // Add error feedback to save button
        const originalText = this.saveButton.innerHTML;
        this.saveButton.innerHTML = '<span class="save-icon">❌</span>Error';
        this.saveButton.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        
        console.error('Screenshot save error:', message);
        
        setTimeout(() => {
            this.saveButton.innerHTML = originalText;
            this.saveButton.style.background = 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)';
        }, 3000);
        
        // You could also show a more user-friendly error message here
        alert('Failed to save screenshot. Please try again.');
    }

    toggleCustomizationDropdown() {
        const isOpen = this.customizationMenu.classList.contains('show');
        
        if (isOpen) {
            this.closeCustomizationDropdown();
        } else {
            this.openCustomizationDropdown();
        }
    }

    openCustomizationDropdown() {
        this.customizationMenu.classList.add('show');
        this.customizationBtn.classList.add('active');
    }

    closeCustomizationDropdown() {
        this.customizationMenu.classList.remove('show');
        this.customizationBtn.classList.remove('active');
    }

    updateTickerDisplay() {
        const ticker = this.tickerInput.value.trim().toUpperCase();
        const tickerDisplay = document.getElementById('tickerDisplay');
        
        if (ticker) {
            tickerDisplay.textContent = ticker;
            tickerDisplay.style.display = 'block';
        } else {
            tickerDisplay.textContent = '';
            tickerDisplay.style.display = 'none';
        }
    }

    resetAllValues() {
        // Add visual feedback
        this.resetButton.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Reset all argument inputs
            [...this.bullishInputs, ...this.bearishInputs].forEach(input => {
                input.value = '';
            });

            // Reset ticker input
            this.tickerInput.value = '';

            // Reset color inputs to default values
            this.colorInputs.bullish.value = this.defaultValues.bullishColor;
            this.colorInputs.bearish.value = this.defaultValues.bearishColor;
            this.colorInputs.neutral.value = this.defaultValues.neutralColor;
            this.colorInputs.background.value = this.defaultValues.bgColor;

            // Reset argument dropdown states (expand all)
            document.querySelectorAll('.arguments-group .dropdown-content').forEach(content => {
                content.classList.remove('collapsed');
            });
            document.querySelectorAll('.arguments-group .dropdown-arrow').forEach(arrow => {
                arrow.classList.remove('rotated');
            });

            // Close customization dropdown
            this.closeCustomizationDropdown();

            // Update displays
            this.updateColors();
            this.updateAnalysis();
            this.updateTickerDisplay();

            // Reset button visual feedback
            this.resetButton.style.transform = 'scale(1)';
        }, 150);
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
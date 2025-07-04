document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips

    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // Toggle dark mode class on html element
            document.documentElement.classList.toggle('dark');
            
            // Store preference in local storage
            const isDarkMode = document.documentElement.classList.contains('dark');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        });
        
        // Set initial state based on local storage or system preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'disabled') {
            document.documentElement.classList.remove('dark');
        } else if (savedDarkMode === 'enabled') {
            document.documentElement.classList.add('dark');
        } else {
            // If no preference is stored, check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (!prefersDark) {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    // Fix menu click issues
    fixMenuClicks();

    // ========== Background Image Changer ==========
    const backgroundContainer = document.getElementById('background-container');
    const lightModeBackground = "url('/static/img/background(white).jpg')";
    const darkModeBackground = "url('/static/img/background.jpg')";

    function updateBackgroundImage() {
        if (document.documentElement.classList.contains('dark')) {
            backgroundContainer.style.backgroundImage = darkModeBackground;
        } else {
            backgroundContainer.style.backgroundImage = lightModeBackground;
        }
    }

    // Update on initial load
    updateBackgroundImage();

    // Update when dark mode is toggled
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', updateBackgroundImage);
    }
    // ========== End Background Image Changer ==========

    // ========== Restore generateProbesBtn related ==========
    const generateProbesBtn = document.getElementById('generateProbesBtn');
    const probesList = document.getElementById('probesList');
    const numProbesInput = document.getElementById('numProbes');
    const probeModelSelect = document.getElementById('probeModel');
    const valueCheckboxes = document.querySelectorAll('#valueSelectionForm .value-checkbox');
    const modelResponseSelect = document.getElementById('modelResponseSelect');
    const openEndedCheckbox = document.getElementById('format-open-ended');
    const multipleChoiceCheckbox = document.getElementById('format-multiple-choice');
        // Get other DOM elements
    // Get other DOM elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const contentViews = document.querySelectorAll('.content-view');
    const progressSteps = document.querySelectorAll('.progress-step');
    const sidebarNavLinks = document.querySelectorAll('.nav-item a');
            
    // Likert Scale Management
    const likertScaleSelect = document.getElementById('likertScale');
    const createScaleBtn = document.getElementById('createScaleBtn');
    const editScaleBtn = document.getElementById('editScaleBtn');
    const likertScaleModal = document.getElementById('likertScaleModal');
    const closeLikertScaleModal = document.getElementById('closeLikertScaleModal');
    const saveLikertScaleBtn = document.getElementById('saveLikertScaleBtn');
    const deleteLikertScaleBtn = document.getElementById('deleteLikertScaleBtn');
    const likertScaleName = document.getElementById('likertScaleName');
    const likertScaleDescription = document.getElementById('likertScaleDescription');
    const likertScaleId = document.getElementById('likertScaleId');
    const dimensionsList = document.getElementById('dimensionsList');
    const dimensionTemplate = document.getElementById('dimensionTemplate');
    const addDimensionBtn = document.getElementById('addDimensionBtn');
    
    // Human Evaluation Interface elements
    const humanEvaluationModal = document.getElementById('humanEvaluationModal');
    const closeHumanEvaluationModal = document.getElementById('closeHumanEvaluationModal');
    const evaluationProgress = document.getElementById('evaluationProgress');
    const evaluationValue = document.getElementById('evaluationValue');
    const evaluationProbe = document.getElementById('evaluationProbe');
    const evaluationResponse = document.getElementById('evaluationResponse');
    const evaluationForm = document.getElementById('evaluationForm');
    const evaluationComment = document.getElementById('evaluationComment');
    const prevItemBtn = document.getElementById('prevItemBtn');
    const nextItemBtn = document.getElementById('nextItemBtn');
    const skipItemBtn = document.getElementById('skipItemBtn');
    const finishEvaluationBtn = document.getElementById('finishEvaluationBtn');

    
    // Global variables for human evaluation
    let currentLikertScale = null;
    let currentModelResponses = null;
    let currentEvaluationIndex = 0;
    let evaluationResults = [];
        // ---> 新增代码: 为标注功能添加状态变量
    let annotationContextMenu = null;
    let annotationInputModal = null;
    let currentSelection = null;

    document.body.addEventListener('click', function(event) {
        // Check if the clicked element is the "Add Annotation" button, or its icon/text
        const annotationButton = event.target.closest('#addAnnotationButton');

        // If the click is not on this button, exit without any action
        if (!annotationButton) {
            return;
        }

        // If the code execution reaches here, the button has been clicked.
        // For debugging purposes, let's print a message to the console first.
        console.log('"Add Annotation" button was successfully clicked!');

        // --- Start executing the original logic ---
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length === 0) {
            showNotification('Please select the text to be annotated in the model response first.', 'warning');
            return;
        }

        window.currentSelection = selection;

        const annotationInputModal = document.getElementById('annotationInputModal');
        const annotatedTextPreview = document.getElementById('annotatedTextPreview');
        
        if (annotationInputModal && annotatedTextPreview) {
            annotatedTextPreview.textContent = selectedText;
            // This is the key code to show the modal
                // 1. Remove the 'hidden' class
            annotationInputModal.classList.remove('hidden');
            
            // 2. Directly force the display property with JS to ensure it's visible
            annotationInputModal.style.display = 'flex';
            
            // 3. Add a debug log to confirm this line has been executed
            console.log('Forced set modal style.display = "flex"');
        } else {
            // 如果弹窗或预览区域没找到，也在控制台报错
            console.error('无法找到批注弹窗 (annotationInputModal) 或预览区域 (annotatedTextPreview)!');
            console.error('annotationInputModal:', annotationInputModal);
            console.error('annotatedTextPreview:', annotatedTextPreview);
        }
    });

    if (generateProbesBtn) {
        generateProbesBtn.addEventListener('click', generateProbes);
    }

    function setDisabledButtonTooltip() {
        const evaluateBtn = document.getElementById('evaluateBtn');
        if (!evaluateBtn || !evaluateBtn.disabled) {
            evaluateBtn.title = 'Ready to analyze'; // Clear tooltip when enabled
            return;
        }

        const modelResponseId = document.getElementById('modelResponseId')?.value;
        const analysisType = document.querySelector('input[name="analysisType"]:checked')?.value;
        const judgeModel = document.getElementById('judgeModel')?.value;
        const judgeTemplate = document.getElementById('judgeTemplate')?.value;
        const likertScale = document.getElementById('likertScale')?.value;

        let tooltipText = 'Please complete all selections to proceed:';
        if (!modelResponseId) tooltipText += '\n- Select a model response set.';
        if (!analysisType) tooltipText += '\n- Select an analysis method (LLM Judge or Human).';
        if (analysisType === 'judge') {
            if (!judgeModel) tooltipText += '\n- Select a Judge Model.';
            if (!judgeTemplate) tooltipText += '\n- Select a Judge Template.';
        }
        if (analysisType === 'human') {
            if (!likertScale) tooltipText += '\n- Select a Likert Scale for evaluation.';
        }

        evaluateBtn.title = tooltipText;
    }
    // Get selected value dimensions
    function getSelectedValues() {
        const selectedValues = [];
        document.querySelectorAll('#valueSelectionForm .value-checkbox:checked').forEach(checkbox => {
            selectedValues.push(checkbox.value);
        });
        return selectedValues;
    }

    // New helper function to reliably extract question text from any probe format
    function getBaseProbeText(probe) {
        if (!probe) return null;
        if (typeof probe === 'string') return probe;
        if (typeof probe.question_text === 'string') return probe.question_text;
        if (probe.original) return getBaseProbeText(probe.original);
        if (Array.isArray(probe) && probe.length > 0) return getBaseProbeText(probe[0]);
        return null;
    }

    
    /**
     * @function renderMetricCards
     * @description (FIXED) Dynamically creates and renders metric cards. It now intelligently
     * handles both single-metric (LLM Judge) and multi-metric (Human Eval) summary data.
     * @param {string} containerId - The ID of the container element for the cards.
     * @param {object} summary - The analysis summary data.
     */
    function renderMetricCards(containerId, summary) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Metric container with ID "${containerId}" not found.`);
            return;
        }

        if (!summary || Object.keys(summary).length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center">No summary data available.</p>';
            return;
        }

        container.innerHTML = ''; // Clear previous cards

        const cardStyles = [
            { icon: 'fa-star', color: 'blue', neon: 'neon-blue' },
            { icon: 'fa-check-double', color: 'indigo', neon: 'indigo-400' },
            { icon: 'fa-thumbs-up', color: 'violet', neon: 'violet-400' },
            { icon: 'fa-bullseye', color: 'sky', neon: 'sky-400' },
            { icon: 'fa-award', color: 'green', neon: 'green-400' },
            { icon: 'fa-gavel', color: 'amber', neon: 'amber-400' }
        ];

        // Detect if this is a single-metric (LLM Judge) or multi-metric (Human Eval) result.
        // A single-metric result has a 'score' property directly on its first-level children.
        const isSingleMetric = summary[Object.keys(summary)[0]].hasOwnProperty('score');

        if (isSingleMetric) {
            // --- Logic for LLM Judge Results ---
            let valueIndex = 0;
            for (const valueName in summary) {
                if (Object.hasOwnProperty.call(summary, valueName)) {
                    const valueDetails = summary[valueName];
                    // Defensive check for score property
                    if (valueDetails && typeof valueDetails.score === 'number') {
                        const score = valueDetails.score;
                        const kappa = valueDetails.kappa; // Get the kappa score
                        const displayName = valueName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const style = cardStyles[valueIndex % cardStyles.length];

                        const cardHtml = `
                            <div class="frosted-card p-4 rounded-xl flex flex-col items-center text-center">
                                <div class="w-10 h-10 rounded-full bg-${style.color}-500/10 flex items-center justify-center mb-2">
                                    <i class="fas ${style.icon} text-${style.neon} text-lg"></i>
                                </div>
                                <div class="w-full">
                                    <div class="text-sm font-semibold text-gray-200 truncate" title="${displayName}">${displayName}</div>
                                    <div class="text-xs font-medium text-gray-400">LLM Judge Score</div>
                                </div>
                                <div class="text-3xl font-bold text-gray-100 font-display mt-2">${score.toFixed(2)}</div>
                                ${(kappa !== null && typeof kappa !== 'undefined') ? `<div class="text-xs text-amber-300 mt-1 font-mono" title="Inter-variant Agreement (Kappa)">κ = ${kappa.toFixed(2)}</div>` : ''}
                            </div>
                        `;
                        container.innerHTML += cardHtml;
                        valueIndex++;
                    }
                }
            }
        } else {
            // --- Logic for Human Evaluation Results (Existing Logic) ---
            let metricIndex = 0;
            for (const metricName in summary) {
                if (Object.hasOwnProperty.call(summary, metricName)) {
                    const valueDataForMetric = summary[metricName];
                    if (typeof valueDataForMetric !== 'object' || valueDataForMetric === null) continue;

                    const displayMetricName = metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    for (const valueName in valueDataForMetric) {
                        if (Object.hasOwnProperty.call(valueDataForMetric, valueName)) {
                            const valueDetails = valueDataForMetric[valueName];
                            
                            if (valueDetails && typeof valueDetails.score === 'number') {
                                const score = valueDetails.score;
                                const displayName = valueName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                const style = cardStyles[metricIndex % cardStyles.length];
                                
                                const cardHtml = `
                                    <div class="frosted-card p-4 rounded-xl flex flex-col items-center text-center">
                                        <div class="w-10 h-10 rounded-full bg-${style.color}-500/10 flex items-center justify-center mb-2">
                                            <i class="fas ${style.icon} text-${style.neon} text-lg"></i>
                                        </div>
                                        <div class="w-full">
                                            <div class="text-sm font-semibold text-gray-200 truncate" title="${displayName}">${displayName}</div>
                                            <div class="text-xs font-medium text-gray-400">${displayMetricName}</div>
                                        </div>
                                        <div class="text-3xl font-bold text-gray-100 font-display mt-2">${score.toFixed(2)}</div>
                                    </div>
                                `;
                                container.innerHTML += cardHtml;
                                metricIndex++;
                            }
                        }
                    }
                }
            }
        }
    }
   
    /**
     * @function updateDashboardMetrics
     * @description Uses analysis summary data to update the main dashboard metric cards.
     * @param {object} summary - An object containing the average values for each metric.
     */
    function updateDashboardMetrics(summary) {
        // The new renderMetricCards function can handle the full summary directly.
        renderMetricCards('dashboardMetricsContainer', summary);
    }

    /**
     * @function generateSmartDashboardChart
     * @description (FIXED) The main controller for visualizations. It detects the data structure
     * and generates a single chart for LLM Judge results or multiple charts for each metric
     * in a Human Evaluation result.
     */
    function generateSmartDashboardChart() {
        const summary = window.latestAnalysisResults?.summary;
        const container = document.getElementById('dashboardVisualization');

        if (!summary || Object.keys(summary).length === 0) {
            container.innerHTML = `<p class="text-gray-400 text-center py-8">No summary data available to generate charts.</p>`;
            return;
        }

        container.innerHTML = ''; // Clear previous chart(s)

        // Detect if this is a single-metric (LLM Judge) or multi-metric (Human Eval) result.
        const isSingleMetric = summary[Object.keys(summary)[0]].hasOwnProperty('score');

        if (isSingleMetric) {
            // --- Logic for LLM Judge Results (Single Chart) ---
            const numValues = Object.keys(summary).length;
            if (numValues === 0) return; // Don't create a chart for empty data

            const chartTitle = document.createElement('h3');
            chartTitle.className = 'text-lg font-semibold text-sky-200 font-display text-center mb-4';
            chartTitle.textContent = `LLM Judge Alignment Scores`;
            container.appendChild(chartTitle);

            const chartContainer = document.createElement('div');
            // Use a consistent ID for the single chart container
            const chartContainerId = `chart-container-llm-judge`;
            chartContainer.id = chartContainerId;
            chartContainer.className = 'w-full h-[400px] mb-8';
            container.appendChild(chartContainer);

            // The bar and radar chart functions already expect the data in this format.
            if (numValues > 2) {
                generateRadarChart(chartContainerId, summary, `LLM Judge Profile`);
            } else {
                generateBarChart(chartContainerId, summary, `LLM Judge Scores`);
            }
        } else {
            // --- Logic for Human Evaluation Results (Multiple Charts) ---
            for (const metricName in summary) {
                if (Object.hasOwnProperty.call(summary, metricName)) {
                    const metricData = summary[metricName];
                    if(typeof metricData !== 'object' || metricData === null) continue;

                    const numValues = Object.keys(metricData).length;
                    if (numValues === 0) continue;

                    const displayMetricName = metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    const chartTitle = document.createElement('h3');
                    chartTitle.className = 'text-lg font-semibold text-sky-200 font-display text-center mb-4';
                    chartTitle.textContent = `${displayMetricName} Scores`;
                    container.appendChild(chartTitle);

                    const chartContainer = document.createElement('div');
                    const chartContainerId = `chart-container-${metricName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                    chartContainer.id = chartContainerId;
                    chartContainer.className = 'w-full h-[400px] mb-8';
                    container.appendChild(chartContainer);

                    if (numValues > 2) {
                        generateRadarChart(chartContainerId, metricData, `${displayMetricName} Profile`);
                    } else {
                        generateBarChart(chartContainerId, metricData, `${displayMetricName} Scores`);
                    }
                }
            }
        }
    }


    /**
     * @function generateBarChart
     * @description (FIXED) Generates a bar chart for a single metric's results across different values.
     * @param {string} containerId - The ID of the DOM element to render the chart in.
     * @param {object} metricData - The analysis data for one metric, e.g., { "care_harm": {"score": 4.0}, ... }
     * @param {string} title - The title for the chart.
     */
    function generateBarChart(containerId, metricData, title) {
        const labels = [];
        const values = [];

        for (const valueName in metricData) {
            if (Object.hasOwnProperty.call(metricData, valueName)) {
                labels.push(valueName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                values.push(metricData[valueName]?.score || 0);
            }
        }

        const trace = {
            x: labels,
            y: values,
            type: 'bar',
            text: values.map(v => v.toFixed(2)),
            textposition: 'auto',
            hoverinfo: 'x+y',
            marker: {
                color: 'rgba(0, 243, 255, 0.6)',
                line: { color: 'rgba(0, 243, 255, 1)', width: 1.5 },
                color: values.map((_, i) => `rgba(0, ${243 - i*40}, 255, 0.6)`)
            }
        };

        const layout = {
            //title: { text: title, font: { color: '#e5e7eb' } },
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
            font: { color: '#d1d5db' },
            xaxis: { gridcolor: 'rgba(255, 255, 255, 0.1)' },
            yaxis: { title: 'Score', gridcolor: 'rgba(255, 255, 255, 0.1)', range: [0, 1] }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    }

    /**
     * @function generateRadarChart
     * @description (FIXED) Generates a radar chart for a single metric's results across multiple values.
     * @param {string} containerId - The ID of the DOM element to render the chart in.
     * @param {object} metricData - The analysis data for one metric, e.g., { "care_harm": {"score": 4}, ... }
     * @param {string} title - The title for the chart.
     */
    function generateRadarChart(containerId, metricData, title) {
        const labels = [];
        const scores = [];

        for (const valueName in metricData) {
            if (Object.hasOwnProperty.call(metricData, valueName)) {
                const displayName = valueName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                labels.push(displayName);
                scores.push(metricData[valueName]?.score || 0);
            }
        }

        if (labels.length < 3) {
            document.getElementById(containerId).innerHTML = `<p class="text-yellow-400 text-center py-8">A radar chart requires at least 3 values.</p>`;
            return;
        }

        const trace = {
            type: 'scatterpolar',
            r: [...scores, scores[0]],
            theta: [...labels, labels[0]],
            fill: 'toself',
            name: 'Score',
            marker: {
                color: 'rgba(0, 243, 255, 0.7)',
                line: { color: 'rgba(0, 243, 255, 1)' }
            }
        };

        const layout = {
            //title: { text: title, font: { color: '#e5e7eb' } },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'rgba(15, 23, 42, 0.3)',
            font: { color: '#d1d5db' },
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 1],
                    gridcolor: 'rgba(255, 255, 255, 0.2)',
                    angle: 90,
                },
                angularaxis: {
                    gridcolor: 'rgba(255, 255, 255, 0.1)',
                    tickfont: { size: 12 }
                }
            },
            showlegend: false
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    }

    // ========== NEW: Function to manage the analysis button state ==========
    function updateAnalysisButtonState() {
        const evaluateBtn = document.getElementById('evaluateBtn');
        if (!evaluateBtn) return;

        const modelResponseId = document.getElementById('modelResponseId')?.value;
        const analysisType = document.querySelector('input[name="analysisType"]:checked')?.value;

        let isReady = false;
        let reason = "Button disabled. Reason: ";

        if (modelResponseId) {
            if (analysisType === 'judge') {
                const judgeModel = document.getElementById('judgeModel')?.value;
                const judgeTemplate = document.getElementById('judgeTemplate')?.value;
                if (judgeModel && judgeTemplate) {
                    isReady = true;
                } else {
                    reason += "LLM Judge model or template not selected.";
                }
            } else if (analysisType === 'human') {
                // Since we removed the Likert Scale UI, we no longer check for it.
                // The only condition now is that a model response must be selected,
                // which is already checked by the 'modelResponseId' variable at the top of the function.
                if (modelResponseId) {
                    isReady = true;
                } else {
                    // This part will likely not be hit if the top check fails first,
                    // but it's good for completeness.
                    reason += "Model Response not selected.";
                }
            } else {
                reason += "Analysis method not selected.";
            }
        } else {
            reason += "Model Response not selected.";
        }

        evaluateBtn.disabled = false;
        
        // 日志3：报告按钮状态检查结果
        if(isReady) {
            console.log('[Debug] "Analyze" button is now ENABLED.');
        } else {
            console.log(`[Debug] "Analyze" button is DISABLED. Reason: ${reason}`);
        }
    }

        // ========== NEW: Listen to all analysis inputs to update button state ==========
    const judgeModelSelect = document.getElementById('judgeModel');
    const judgeTemplateSelect = document.getElementById('judgeTemplate');
    const likertScaleSelectForAnalysis = document.getElementById('likertScale');

    if (judgeModelSelect) judgeModelSelect.addEventListener('change', updateAnalysisButtonState);
    if (judgeTemplateSelect) judgeTemplateSelect.addEventListener('change', updateAnalysisButtonState);
    if (likertScaleSelectForAnalysis) likertScaleSelectForAnalysis.addEventListener('change', updateAnalysisButtonState);

    // Also, call it once on page load to set the initial state correctly
    updateAnalysisButtonState();

    function generateProbes() {
        showNotification('generate begins!', 'info');
        const probesList = document.getElementById('probesList');
        const selectedValues = getSelectedValues();
        
        if (selectedValues.length === 0) {
            showNotification('Please select at least one value dimension', 'warning');
            return;
        }
        
        // 先检查API配置
        // First check API configuration
        fetch('/api/check-api-config')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // API配置正常，继续生成
                    // API configuration is normal, continue generation
                    proceedWithProbeGeneration();
                } else {
                    // API配置有问题，显示错误并阻止生成
                    // API configuration has issues, show error and prevent generation
                    showNotification('Cannot generate probes: ' + data.error, 'error');
                    
                    // 打开设置面板
                    // Open settings panel
                    setTimeout(() => {
                        document.getElementById('settingsModal').classList.remove('hidden');
                        document.getElementById('apiSettingsTab').click();
                    }, 1000);
                    
                    if (probesList) {
                        probesList.innerHTML = `
                            <div class="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
                                <i class="fas fa-exclamation-triangle text-red-400 text-lg mb-2"></i>
                                <p class="text-red-300">API configuration error: ${data.error || 'Unknown error'}</p>
                                <p class="text-gray-400 mt-2">Please check API settings and ensure you have configured the correct API key.</p>
                            </div>
                        `;
                    }
                }
            })
            .catch(error => {
                console.error('Error checking API configuration:', error);
                proceedWithProbeGeneration(); // 出错时仍然尝试生成
                                              // Still try to generate when there's an error
            });
            
        // 实际生成探针的函数
        // Actual function to generate probes
        function proceedWithProbeGeneration() {
            // ---> FIX: Disable the button at the start of generation
            const nextBtn = document.getElementById('nextToResponsesBtn');
            if (nextBtn) {
                nextBtn.disabled = true;
            }

            if (probesList) {
                probesList.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-40">
                        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p class="text-center text-gray-400">Generating probe questions...</p>
                    </div>
                `;
            }
            
            // Get generation parameters
            const numProbes = parseInt(numProbesInput.value) || 5;
            
            // Get diversity option
            let diversity = 'medium'; // Default value
            document.querySelectorAll('input[name="diversity"]').forEach(radio => {
                if (radio.checked) {
                    diversity = radio.id.replace('diversity-', '');
                }
            });
            
            // Get model
            const probeModelSelect = document.getElementById('probeModel');
            const modelName = probeModelSelect ? probeModelSelect.value : '';

            // Get question format
            // Get question format
            const questionFormat = {
                type: [] // Array to store multiple selected question types
            };

            if (document.getElementById('format-open-ended').checked) {
                questionFormat.type.push('open_ended');
            }
            if (document.getElementById('format-multiple-choice').checked) {
                questionFormat.type.push('multiple_choice');
                // The options_count is now fixed to 2 and will be handled by the backend.
            }
            // If no type is selected, default to open_ended
            if (questionFormat.type.length === 0) {
                questionFormat.type.push('open_ended');
            }

            // Get validation methods
            const validationMethods = {};
            document.querySelectorAll('.validation-method:checked').forEach(checkbox => {
                if (checkbox.value === 'parallel_forms') {
                    const variationCount = parseInt(document.getElementById('parallel-forms-count').value) || 3;
                    validationMethods.parallel_forms = {
                        enabled: true,
                        variation_count: variationCount
                    };
                }
                if (checkbox.value === 'adversarial_attack') {
                    const technique = document.getElementById('adversarial-technique').value;
                    const variationCount = parseInt(document.getElementById('adversarial-count').value) || 1;
                    validationMethods.adversarial_attack = {
                        enabled: true,
                        technique: technique,
                        variation_count: variationCount
                    };
                }
                if (checkbox.value === 'position_bias') {
                    validationMethods.position_bias = {
                        enabled: true
                    };
                }
            });

            // Call backend API
            fetch('/generate_probes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selected_values: selectedValues,
                    num_probes: numProbes,
                    diversity: diversity,
                    model: modelName,
                    task_id: document.getElementById('taskId').value,
                    validation_methods: validationMethods,
                    question_format: questionFormat,
                    constraints: document.getElementById('probeConstraints')?.value || ''
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update probe list
                    displayProbes(data.probes);
                    
                    // Update task ID for subsequent operations
                    if (data.task_id) {
                        document.getElementById('taskId').value = data.task_id;
                    }
                    
                    // Update probe generation ID for subsequent operations
                    if (data.probe_generation_id) {
                        document.getElementById('probeGenerationId').value = data.probe_generation_id;
                    }
                    
                    // ---> FIX: Show success notification indicating user can proceed
                    showNotification('Probes generated successfully! You can now proceed.', 'success');

                    // ---> FIX: Enable the 'Proceed to Responses' button on success
                    if (nextBtn) {
                        nextBtn.disabled = false;
                    }
                } else {
                    // Show error message
                    showNotification('Failed to generate probe questions: ' + data.error, 'error');
                    if (probesList) {
                        probesList.innerHTML = `
                            <div class="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
                                <i class="fas fa-exclamation-triangle text-red-400 text-lg mb-2"></i>
                                <p class="text-red-300">${data.error || 'Unknown error'}</p>
                            </div>
                        `;
                    }
                }
            })
            .catch(error => {
                console.error('Error generating probes:', error);
                showNotification('Error generating probe questions', 'error');

                // ---> FIX: Ensure the button remains disabled on error
                if (nextBtn) {
                    nextBtn.disabled = true;
                }
                
                if (probesList) {
                    probesList.innerHTML = `
                        <div class="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
                            <i class="fas fa-exclamation-triangle text-red-400 text-lg mb-2"></i>
                            <p class="text-red-300">Network error, please try again later</p>
                        </div>
                    `;
                }
            });
        }
    }

    function displayProbes(probes) {
        const probesList = document.getElementById('probesList');
        if (!probesList) return;

        if (!probes || Object.keys(probes).length === 0) {
            probesList.innerHTML = `
                <div class="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30 text-center">
                    <i class="fas fa-exclamation-triangle text-yellow-400 text-lg mb-2"></i>
                    <p class="text-yellow-300">No probes generated. Please select values and try again.</p>
                </div>
            `;
            return;
        }

        let html = '';
        for (const [value, concepts] of Object.entries(probes)) {
            const displayValue = value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            html += `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-indigo-300 mb-2 font-display">${displayValue}</h3>
                    <div class="space-y-4">
            `;
            
            concepts.forEach((concept, conceptIndex) => {
                // Determine the validation method from the first variant (if it exists)
                const method = concept.variants.length > 1 ? concept.variants[1].method : 'original';
                const methodDisplay = method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                // Assign colors based on the method for better visualization
                let borderColor = 'border-blue-500';
                let textColor = 'text-blue-200';
                let bgColor = 'bg-blue-900/50';

                if (method.includes('parallel')) {
                    borderColor = 'border-indigo-500'; 
                    textColor = 'text-indigo-200'; 
                    bgColor = 'bg-indigo-900/50';
                } else if (method.includes('adversarial')) {
                    borderColor = 'border-orange-500'; 
                    textColor = 'text-orange-200'; 
                    bgColor = 'bg-orange-900/50';
                } else if (method.includes('position')) {
                    borderColor = 'border-green-500'; 
                    textColor = 'text-green-200'; 
                    bgColor = 'bg-green-900/50';
                }

                html += `
                    <div class="probe-concept-item p-4 rounded-lg bg-slate-800/70 border-l-4 ${borderColor}">
                        <div class="flex items-center mb-3">
                            <span class="font-semibold mr-3 ${textColor.replace('text-', 'text-bg-').replace('-200', '-400')}">${conceptIndex + 1}.</span>
                            <span class="text-sm px-2 py-0.5 ${bgColor} ${textColor} rounded">
                                Probe Concept (${methodDisplay})
                            </span>
                        </div>
                        <div class="space-y-3 pl-5 mt-2">
                `;
                
                // Render each variant within the concept group
                concept.variants.forEach((variant, vIndex) => {
                    const variantLabel = variant.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    html += renderQuestion(variant.question_data, vIndex, variantLabel);
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        probesList.innerHTML = html;
    }
    
    // 辅助函数：渲染不同格式的问题
    // Helper function: Render different question formats
    function renderQuestion(question, index = null, label = null) {
        let html = '';
        const titleHtml = label ? 
            `<div class="flex items-center mb-1">
                <span class="text-xs text-${index !== null ? 'indigo' : 'green'}-300 font-medium">${label} ${index !== null ? index + 1 : ''}</span>
            </div>` : '';
            
        // 如果是带格式的问题对象
        // If this is a formatted question object
        if (question && typeof question === 'object' && question.type) {
            html += `<div class="bg-slate-900/40 p-3 rounded border border-slate-700/40">
                ${titleHtml}`;
                
            if (question.type === 'multiple_choice') {
                html += `<p class="text-sm text-gray-300 mb-2">${question.question_text}</p>
                         <div class="space-y-1 mt-2 pl-3">`;
                         
                question.options.forEach((option, optIdx) => {
                    html += `<div class="flex items-start">
                        <div class="flex items-center h-5">
                            <div class="w-4 h-4 mr-2 rounded-full border border-gray-600 flex items-center justify-center text-xs text-gray-400">${String.fromCharCode(65 + optIdx)}</div>
                        </div>
                        <p class="text-sm text-gray-300">${option}</p>
                    </div>`;
                });
                         
                html += `</div>`;
            } else if (question.type === 'true_false') {
                html += `<p class="text-sm text-gray-300 mb-2">${question.question_text}</p>
                         <div class="space-x-4 mt-2 pl-3 flex">
                             <div class="flex items-center">
                                 <div class="w-4 h-4 mr-2 rounded-full border border-gray-600 flex items-center justify-center text-xs text-gray-400">T</div>
                                 <span class="text-sm text-gray-300">True</span>
                             </div>
                             <div class="flex items-center">
                                 <div class="w-4 h-4 mr-2 rounded-full border border-gray-600 flex items-center justify-center text-xs text-gray-400">F</div>
                                 <span class="text-sm text-gray-300">False</span>
                             </div>
                         </div>`;
            } else {
                // 开放式问题
                html += `<p class="text-sm text-gray-300">${question.question_text}</p>`;
            }
            
            html += `</div>`;
        } else {
            // 简单字符串
            html += `<div class="bg-slate-900/40 p-3 rounded border border-slate-700/40">
                ${titleHtml}
                <p class="text-sm text-gray-300">${question}</p>
            </div>`;
        }
        
        return html;
    }

    // ========== 恢复 generateProbesBtn 相关 ==========
    const tooltips = document.querySelectorAll('.info-tooltip');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const title = this.getAttribute('title');
            if (!title) return;
            
            // Create tooltip element
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip-popup bg-slate-800 text-gray-100 text-xs p-2 rounded max-w-xs shadow-lg z-50';
            tooltipEl.innerHTML = title;
            tooltipEl.style.position = 'absolute';
            document.body.appendChild(tooltipEl);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 10}px`;
            tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
            
            // Store reference for removal
            this.setAttribute('data-tooltip-el', true);
            this._tooltipEl = tooltipEl;
            
            // Remove title to prevent default tooltip
            this._title = title;
            this.setAttribute('title', '');
        });
        
        tooltip.addEventListener('mouseleave', function() {
            if (this._tooltipEl) {
                document.body.removeChild(this._tooltipEl);
                this._tooltipEl = null;
                
                // Restore title
                if (this._title) {
                    this.setAttribute('title', this._title);
                }
            }
        });
    });
    
    // Current step tracking
    let currentStep = 1;
    
    /**
     * Handle navigation link clicks
     */
    function handleNavLinkClick(e) {
        e.preventDefault();
        
        const viewId = this.getAttribute('data-view') + '-view';
        console.log(`[Debug] Navigating to: ${viewId}`); // 日志1：记录导航
        const contentViews = document.querySelectorAll('.content-view');
        
        // Hide all views
        contentViews.forEach(view => view.classList.remove('active'));
        
        // Show the target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update the active link in the sidebar
        const navLinks = document.querySelectorAll('.nav-item a');
        navLinks.forEach(link => {
            link.classList.remove('active-nav', 'text-blue-100');
            link.classList.add('text-gray-400');
        });
        this.classList.remove('text-gray-400');
        this.classList.add('active-nav', 'text-blue-100');
        
        const viewName = this.getAttribute('data-view');
        let step = 0;
        switch(viewName) {
            case 'values': step = 1; break;
            case 'probes': step = 2; break;
            case 'responses': step = 3; break;
            case 'analysis': step = 4; break;
            case 'visualization': step = 5; break;
            case 'tasks': step = 0; break;
            case 'templates': step = 0; break;
        }
        updateProgressStep(step);
        
        // For mobile devices, close the sidebar after navigation
        if (window.innerWidth < 1024) {
            hideSidebar();
        }
        
        // Check if we need to load specific content for this view
        if (viewId === 'tasks-view') {
            loadTaskHistory();
        } else if (viewId === 'responses-view') {
            // Check if a probe generation is already selected
            const probeGenerationId = document.getElementById('probeGenerationId')?.value;
            if (probeGenerationId) {
                // Load the probe generation details to update the UI
                fetch(`/api/probe_generations/${probeGenerationId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to load probe generation');
                        }
                        return response.json();
                    })
                    .then(probeGeneration => {
                        updateSelectedProbeGenerationInfo(probeGeneration);
                    })
                    .catch(error => {
                        console.error('Error loading probe generation:', error);
                        document.getElementById('selectedProbeGenerationInfo').innerHTML = 
                            '<div class="text-red-400"><i class="fas fa-exclamation-circle mr-2"></i>Error loading selected probe generation</div>';
                    });
            }
        } else if (viewId === 'analysis-view') {
            console.log('[Debug] Analysis view entered. Loading initial data...'); // 日志2：确认进入分析页面
            loadModelResponsesForAnalysis();
            loadLikertScales();
        } else if (viewId === 'visualization-view') {
            const resultsPlaceholder = document.getElementById('resultsPlaceholder');
            const resultsContainer = document.getElementById('results');

            // Check if analysis results are available
            if (window.latestAnalysisResults && window.latestAnalysisResults.summary) {
                if (resultsPlaceholder) resultsPlaceholder.classList.add('hidden');
                if (resultsContainer) resultsContainer.classList.remove('hidden');

                // Use a short delay to ensure the container is visible before plotting
                setTimeout(() => {
                    // Update the metric cards at the top
                    updateDashboardMetrics(window.latestAnalysisResults.summary);
                    // Generate the main chart using our new intelligent function
                    generateSmartDashboardChart();
                }, 100);
            } else {
                // If no results, show the placeholder text
                if (resultsPlaceholder) resultsPlaceholder.classList.remove('hidden');
                if (resultsContainer) resultsContainer.classList.add('hidden');
                resultsPlaceholder.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-chart-pie text-4xl text-gray-500 mb-4"></i>
                        <p class="text-gray-400">Please run analysis first to see visualizations.</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Update the progress step indicator
     */
    function updateProgressStep(step) {
        currentStep = step;
        
        const steps = document.querySelectorAll('.progress-step');
        const connectors = document.querySelectorAll('[id^="connector"]');

        steps.forEach((stepEl, index) => {
            const stepNum = parseInt(stepEl.getAttribute('data-step'));
            const circle = stepEl.querySelector('div:first-child');
            const label = stepEl.querySelector('span');

            // Reset styles
            circle.classList.remove('bg-blue-600', 'text-white', 'bg-green-600');
            circle.classList.add('bg-gray-700', 'text-gray-400');
            label.classList.remove('text-blue-400', 'text-green-400');
            label.classList.add('text-gray-500');

            if (step > 0) { // Only highlight for main steps
                if (stepNum === step) {
                    // Current step
                    circle.classList.remove('bg-gray-700', 'text-gray-400');
                    circle.classList.add('bg-blue-600', 'text-white');
                    label.classList.remove('text-gray-500');
                    label.classList.add('text-blue-400');
                } else if (stepNum < step) {
                    // Completed step
                    circle.classList.remove('bg-gray-700', 'text-gray-400');
                    circle.classList.add('bg-green-600', 'text-white');
                    label.classList.remove('text-gray-500');
                    label.classList.add('text-green-400');
                }
            }

            // Update connectors
            if (index < connectors.length) {
                if (stepNum < step) {
                    connectors[index].style.width = '100%';
            } else {
                    connectors[index].style.width = '0%';
                }
            }
        });
    }
    
    /**
     * @function updatePreviewMetrics
     * @description Uses analysis summary data to update the preview metric cards.
     * @param {object} summary - An object containing the average values for each metric.
     */
    function updatePreviewMetrics(summary) {
        const previewContainer = document.getElementById('analysisResultsPreview');
        if (!previewContainer) return;
        
        if (summary && Object.keys(summary).length > 0) {
            previewContainer.classList.remove('hidden');
            // Call the new helper function, which now knows how to handle the full summary.
            renderMetricCards('previewMetricsContainer', summary);
        } else {
            previewContainer.classList.add('hidden');
        }
    }

    /**
     * Show/hide notification
     */
    function showNotification(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toastTemplate = document.getElementById('toastTemplate');
        if (!toastTemplate) return;
        
        // Clone the template
        const toast = toastTemplate.content.cloneNode(true).querySelector('.toast-item');
        
        // Set content
        toast.querySelector('.toast-message').textContent = message;
        
        // Set color based on type
        switch (type) {
            case 'success':
                toast.classList.add('bg-green-800/90', 'text-green-100');
                toast.querySelector('.toast-icon').classList.add('bg-green-700', 'text-green-200');
                toast.querySelector('.toast-icon i').classList.add('fa-check');
                break;
            case 'danger':
                toast.classList.add('bg-red-800/90', 'text-red-100');
                toast.querySelector('.toast-icon').classList.add('bg-red-700', 'text-red-200');
                toast.querySelector('.toast-icon i').classList.add('fa-exclamation-circle');
                break;
            case 'warning':
                toast.classList.add('bg-yellow-800/90', 'text-yellow-100');
                toast.querySelector('.toast-icon').classList.add('bg-yellow-700', 'text-yellow-200');
                toast.querySelector('.toast-icon i').classList.add('fa-exclamation-triangle');
                break;
            default: // info
                toast.classList.add('bg-blue-800/90', 'text-blue-100');
                toast.querySelector('.toast-icon').classList.add('bg-blue-700', 'text-blue-200');
                toast.querySelector('.toast-icon i').classList.add('fa-info-circle');
        }
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Add close handler
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        }, 5000);
    }
    

    /**
     * Judge Templates management functions
     */
    function showTemplateEditor(templateData = null) {
        // 显示模板编辑器
        document.getElementById('noTemplateSelected').classList.add('hidden');
        document.getElementById('templateEditor').classList.remove('hidden');
        document.querySelector('.template-actions').classList.remove('hidden');
        
        if (templateData) {
            // 编辑现有模板
            document.getElementById('templateId').value = templateData.id;
            document.getElementById('templateName').value = templateData.name;
            document.getElementById('templateDescription').value = templateData.description;
            document.getElementById('templateText').value = templateData.template_text;
            
            // 如果是默认模板，禁用删除按钮
            if (templateData.is_default) {
                document.getElementById('deleteTemplateBtn').disabled = true;
                document.getElementById('deleteTemplateBtn').classList.add('opacity-50');
            } else {
                document.getElementById('deleteTemplateBtn').disabled = false;
                document.getElementById('deleteTemplateBtn').classList.remove('opacity-50');
            }
        } else {
            // 创建新模板
            document.getElementById('templateId').value = '';
            document.getElementById('templateName').value = '';
            document.getElementById('templateDescription').value = '';
            document.getElementById('templateText').value = '';
            document.getElementById('deleteTemplateBtn').disabled = true;
            document.getElementById('deleteTemplateBtn').classList.add('opacity-50');
        }
    }

    function loadTemplateDetails(templateId) {
        // 加载模板详情
        fetch(`/api/judge-templates/${templateId}`)
            .then(response => response.json())
            .then(data => {
                showTemplateEditor(data);
            })
            .catch(error => {
                console.error('Error loading template:', error);
                showNotification(`Failed to load template: ${error.message}`, 'danger');
            });
    }

    function saveTemplate() {
        // 保存模板
        const templateId = document.getElementById('templateId').value;
        const name = document.getElementById('templateName').value;
        const description = document.getElementById('templateDescription').value;
        const templateText = document.getElementById('templateText').value;
        
        if (!name || !templateText) {
            showNotification('Template name and content cannot be empty', 'danger');
            return;
        }
        
        // 验证模板是否包含必要的占位符
        fetch('/api/judge-templates/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template_text: templateText
            })
        })
            .then(response => response.json())
            .then(data => {
                if (!data.valid) {
                    showNotification(data.message, 'danger');
            return;
        }
        
                // 通过验证，保存模板
                const url = templateId ? `/api/judge-templates/${templateId}` : '/api/judge-templates';
                const method = templateId ? 'PUT' : 'POST';
                
                fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        template_text: templateText
                    })
                })
            .then(response => response.json())
            .then(data => {
                        // 显示成功消息
                        showNotification('Template saved successfully', 'success');
                        
                        // 刷新模板列表而不是整个页面
                        fetch('/api/judge-templates')
                            .then(response => response.json())
                            .then(templates => {
                                // 更新模板列表
                                const templateList = document.getElementById('templateList');
                                templateList.innerHTML = '';
                                
                                if (templates.length > 0) {
                                    templates.forEach(template => {
                                        const li = document.createElement('li');
                                        li.className = `template-item p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/30 cursor-pointer ${template.is_default ? 'border-teal-500/30 bg-teal-900/10' : ''}`;
                                        li.setAttribute('data-template-id', template.id);
                                        
                                        li.innerHTML = `
                                            <div class="flex justify-between items-center">
                                                <div>
                                                    <h4 class="font-medium text-teal-300">${template.name}</h4>
                                                    <p class="text-xs text-gray-400 mt-1">${template.description}</p>
                </div>
                                                ${template.is_default ? '<span class="px-2 py-0.5 bg-teal-900/30 text-teal-400 text-xs rounded-full">Default</span>' : ''}
                                            </div>
            `;
            
                                        templateList.appendChild(li);
            
            // 添加点击事件
                                        li.addEventListener('click', function() {
                                            const templateId = this.getAttribute('data-template-id');
                                            loadTemplateDetails(templateId);
            });
        });
                                } else {
                                    templateList.innerHTML = `
                                        <li class="text-center text-gray-400 py-4">
                                            <p>No templates found</p>
                                        </li>
                                    `;
                                }
                                
                                // 如果是新模板，加载它的详情
                                if (!templateId && data.id) {
                                    loadTemplateDetails(data.id);
                                }
                            })
                            .catch(error => {
                                console.error('Error loading templates:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error saving template:', error);
                        showNotification('Failed to save template', 'danger');
                    });
            })
            .catch(error => {
                console.error('Error validating template:', error);
                showNotification(`Error: ${error.message}`, 'danger');
            });
    }

    function validateTemplate() {
        // 验证模板
        const templateText = document.getElementById('templateText').value;
        
        if (!templateText) {
            showNotification('Template content cannot be empty', 'danger');
            return;
        }
        
        fetch('/api/judge-templates/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template_text: templateText
            })
        })
        .then(response => response.json())
        .then(data => {
                const validationResult = document.getElementById('validationResult');
                validationResult.classList.remove('hidden');
                
                if (data.valid) {
                    validationResult.classList.remove('bg-red-900/10', 'border-red-800', 'text-red-300');
                    validationResult.classList.add('bg-green-900/10', 'border-green-800', 'text-green-300');
                    validationResult.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${data.message}`;
            } else {
                    validationResult.classList.remove('bg-green-900/10', 'border-green-800', 'text-green-300');
                    validationResult.classList.add('bg-red-900/10', 'border-red-800', 'text-red-300');
                    validationResult.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i> ${data.message}`;
            }
        })
        .catch(error => {
                console.error('Error validating template:', error);
                showNotification(`Validation failed: ${error.message}`, 'danger');
            });
    }

    function deleteTemplate() {
        // 删除模板
        const templateId = document.getElementById('templateId').value;
        
        if (!templateId) {
            showNotification('Please select a template first', 'danger');
            return;
        }
        
        if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            fetch(`/api/judge-templates/${templateId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        // 显示成功消息
                        showNotification('Template deleted successfully', 'success');
                        
                        // 刷新模板列表而不是整个页面
                        fetch('/api/judge-templates')
                            .then(response => response.json())
                            .then(templates => {
                                // 更新模板列表
                                const templateList = document.getElementById('templateList');
                                templateList.innerHTML = '';
                                
                                if (templates.length > 0) {
                                    templates.forEach(template => {
                                        const li = document.createElement('li');
                                        li.className = `template-item p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/30 cursor-pointer ${template.is_default ? 'border-teal-500/30 bg-teal-900/10' : ''}`;
                                        li.setAttribute('data-template-id', template.id);
                                        
                                        li.innerHTML = `
                                            <div class="flex justify-between items-center">
                                                <div>
                                                    <h4 class="font-medium text-teal-300">${template.name}</h4>
                                                    <p class="text-xs text-gray-400 mt-1">${template.description}</p>
                                                </div>
                                                ${template.is_default ? '<span class="px-2 py-0.5 bg-teal-900/30 text-teal-400 text-xs rounded-full">Default</span>' : ''}
                                            </div>
                                        `;
                                        
                                        templateList.appendChild(li);
                                        
                                        // 添加点击事件
                                        li.addEventListener('click', function() {
                                            const templateId = this.getAttribute('data-template-id');
                                            loadTemplateDetails(templateId);
                                        });
                                    });
        } else {
                                    templateList.innerHTML = `
                                        <li class="text-center text-gray-400 py-4">
                                            <p>No templates found</p>
                                        </li>
                                    `;
            }
        })
        .catch(error => {
                                console.error('Error loading templates:', error);
                            });
            } else {
                        return response.json().then(data => {
                            throw new Error(data.error || 'Failed to delete template');
                        });
            }
        })
        .catch(error => {
                    console.error('Error deleting template:', error);
                    showNotification(`Error: ${error.message}`, 'danger');
                });
        }
    }
    
    // Add event listeners
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    
    // Sidebar Toggle for Mobile
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        sidebarBackdrop.classList.remove('hidden');
    });
    
    function hideSidebar() {
        sidebar.classList.add('-translate-x-full');
        sidebarBackdrop.classList.add('hidden');
    }
    
    closeSidebar.addEventListener('click', hideSidebar);
    sidebarBackdrop.addEventListener('click', hideSidebar);
    
    // Template editor buttons
    const createTemplateBtn = document.getElementById('createTemplateBtn');
    if (createTemplateBtn) {
        createTemplateBtn.addEventListener('click', function() {
            showTemplateEditor();
        });
    }
    
    // Template items
    document.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template-id');
            loadTemplateDetails(templateId);
        });
    });
    
    // Template action buttons
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', saveTemplate);
    }
    
    const validateTemplateBtn = document.getElementById('validateTemplateBtn');
    if (validateTemplateBtn) {
        validateTemplateBtn.addEventListener('click', validateTemplate);
    }
    
    const deleteTemplateBtn = document.getElementById('deleteTemplateBtn');
    if (deleteTemplateBtn) {
        deleteTemplateBtn.addEventListener('click', deleteTemplate);
    }
    
    // Initialize first step
    updateProgressStep(1);

    // =========================
    // Generation Model & Diversity 交互修复
    // =========================

    // Probe diversity 单选框交互修复
    const diversityRadios = document.querySelectorAll('input[name="diversity"]');
    diversityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // 只要选中就会自动高亮，peer-checked 样式已在 HTML 中定义
            // 可在此同步 temperature 参数（如有需要）
            // 例如：低=0.2，中=0.7，高=1.0
            let temp = 0.7;
            if (this.id === 'diversity-low') temp = 0.2;
            else if (this.id === 'diversity-medium') temp = 0.7;
            else if (this.id === 'diversity-high') temp = 1.0;
            // 如果有 temperature 控件，可以同步
            const tempInput = document.getElementById('apiTemperature');
            const tempValue = document.getElementById('tempValue');
            if (tempInput) tempInput.value = temp;
            if (tempValue) tempValue.textContent = temp;
        });
        // 兼容点击label时radio能切换
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) {
            label.addEventListener('click', function() {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }
    });

    // Probes per value 滑块和数字输入框双向绑定
    const numProbesRange = document.getElementById('numProbesRange');
    if (numProbesRange && numProbesInput) {
        // 滑块变化时同步到输入框
        numProbesRange.addEventListener('input', function() {
            numProbesInput.value = numProbesRange.value;
        });
        // 输入框变化时同步到滑块
        numProbesInput.addEventListener('input', function() {
            let val = parseInt(numProbesInput.value, 30);
            if (isNaN(val)) val = 1;
            if (val < parseInt(numProbesRange.min)) val = parseInt(numProbesRange.min);
            if (val > parseInt(numProbesRange.max)) val = parseInt(numProbesRange.max);
            numProbesInput.value = val;
            numProbesRange.value = val;
        });
    }

    // Generation Model 下拉框交互（如需联动，可在此补充）
    if (probeModelSelect) {
        probeModelSelect.addEventListener('change', function() {
            // 可在此处理模型切换逻辑
            // 例如：console.log('Selected model:', this.value);
        });
    }
    
    // 处理value选择
    const selectedValuesContainer = document.getElementById('selectedValues');
    
    // 更新已选择values的显示
    function updateSelectedValues() {
        // 获取所有选中的value复选框
        const selectedCheckboxes = document.querySelectorAll('#valueSelectionForm .value-checkbox:checked');
        
        // 清空当前显示
        selectedValuesContainer.innerHTML = '';
        
        if (selectedCheckboxes.length === 0) {
            // 如果没有选中的value，显示提示信息
            selectedValuesContainer.innerHTML = '<p class="empty-message text-gray-500 text-sm italic">No values selected</p>';
        } else {
            // 添加所有选中的value
            selectedCheckboxes.forEach(checkbox => {
                const valueId = checkbox.id;
                const valueText = checkbox.value;
                
                // 创建value标签
                const valueTag = document.createElement('div');
                valueTag.className = 'inline-flex items-center bg-blue-900/20 text-blue-300 rounded-lg px-3 py-1 text-sm mr-2 mb-2';
                valueTag.innerHTML = `
                    <span>${valueText.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <button type="button" class="ml-2 text-blue-400 hover:text-blue-200" data-value-id="${valueId}">
                        <i class="fas fa-times-circle"></i>
                    </button>
                `;
                
                // 添加到容器
                selectedValuesContainer.appendChild(valueTag);
                
                // 添加移除按钮点击事件
                valueTag.querySelector('button').addEventListener('click', function() {
                    const valueToUncheck = this.getAttribute('data-value-id');
                    document.getElementById(valueToUncheck).checked = false;
                    updateSelectedValues();
                });
            });
        }
    }
    
    // 为每个value复选框添加点击事件
    valueCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedValues);
    });
    
    // 初始化显示
    updateSelectedValues();
    
    // 处理framework类别的折叠/展开
    const frameworkHeaders = document.querySelectorAll('.framework-header');
    frameworkHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const values = this.nextElementSibling;
            const toggle = this.querySelector('.framework-toggle i');
            
            if (values.style.display === 'none') {
                // 展开
                values.style.display = 'block';
                toggle.classList.remove('fa-chevron-right');
                toggle.classList.add('fa-chevron-down');
            } else {
                // 折叠
                values.style.display = 'none';
                toggle.classList.remove('fa-chevron-down');
                toggle.classList.add('fa-chevron-right');
            }
        });
    });
    
    // 全选和清除按钮
    const selectAllBtn = document.querySelector('.select-all-btn');
    const clearBtn = document.querySelector('.clear-btn');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            valueCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            updateSelectedValues();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            valueCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateSelectedValues();
        });
    }
    
    // Value详情弹窗
    const infoTooltips = document.querySelectorAll('.info-tooltip[data-value]');
    const valueInfoModal = document.getElementById('valueInfoModal');
    const modalValueName = document.getElementById('modalValueName');
    const modalValueDescription = document.getElementById('modalValueDescription');
    const closeModalBtns = document.querySelectorAll('#closeModal, #modalClose, #modalOverlay');
    
    // 显示value详情弹窗
    function showValueInfoModal(valueId) {
        // 从服务器获取value详情
        fetch(`/api/values/${valueId}`)
            .then(response => response.json())
            .then(data => {
                modalValueName.textContent = valueId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                modalValueDescription.textContent = data.description || 'No description available';
                valueInfoModal.classList.remove('hidden');
                
                // 同时更新右侧的值描述显示
                const valueDescription = document.getElementById('valueDescription');
                const valueDescTitle = document.getElementById('valueDescTitle');
                const valueDescText = document.getElementById('valueDescText');
                
                valueDescTitle.textContent = valueId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                valueDescText.textContent = data.description || 'No description available';
                valueDescription.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error fetching value info:', error);
                showNotification('Failed to load value description', 'danger');
            });
    }
    
    // 为信息图标添加点击事件
    infoTooltips.forEach(tooltip => {
        tooltip.addEventListener('click', function(e) {
            e.preventDefault();
            const valueId = this.getAttribute('data-value');
            showValueInfoModal(valueId);
        });
    });
    
    // 关闭弹窗
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            valueInfoModal.classList.add('hidden');
        });
    });

    // Step 跳转按钮事件绑定

    // Response Generation 相关
    const generateResponsesBtn = document.getElementById('generateResponsesBtn');
    const generationStatus = document.getElementById('generationStatus');
    const modelResponses = document.getElementById('modelResponses');
    const selectProbeGenerationBtn = document.getElementById('selectProbeGenerationBtn');
    
    if (generateResponsesBtn) {
        generateResponsesBtn.addEventListener('click', generateModelResponses);
    }
    
    if (selectProbeGenerationBtn) {
        selectProbeGenerationBtn.addEventListener('click', openProbeGenerationModal);
    }
    
    // Modal close button
    const closeProbeGenerationModalBtn = document.getElementById('closeProbeGenerationModalBtn');
    if (closeProbeGenerationModalBtn) {
        closeProbeGenerationModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('probeGenerationSelectModal');
            if(modal) modal.classList.add('hidden');
        });
    }

    /**
     * Opens the probe generation selection modal and loads available probe sets.
     */
    function openProbeGenerationModal() {
        const modal = document.getElementById('probeGenerationSelectModal');
        if (!modal) return;
        modal.classList.remove('hidden');

        const listContainer = document.getElementById('probeGenerationsList');
        listContainer.innerHTML = '<p class="text-gray-400">Loading probe generation history...</p>';

        fetch('/api/probe_generations')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch probe generations.');
                return response.json();
            })
            .then(probeGenerations => {
                if (probeGenerations.length === 0) {
                    listContainer.innerHTML = '<p class="text-gray-400">No probe generations found in task history.</p>';
                    return;
                }

                listContainer.innerHTML = ''; // Clear loading text
                probeGenerations.forEach(pg => {
                    const pgElement = document.createElement('div');
                    pgElement.className = 'p-3 mb-2 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 cursor-pointer transition-colors';
                    pgElement.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-semibold text-blue-300">Probe Set from Task #${pg.task_id}</p>
                                <p class="text-xs text-gray-400 mt-1">Model: ${pg.model_name || 'N/A'} | Probes: ${pg.num_probes} per value | Created: ${new Date(pg.created_at).toLocaleString()}</p>
                            </div>
                            <button class="select-pg-btn tech-button text-xs px-2 py-1">Select</button>
                        </div>
                    `;
                    
                    pgElement.querySelector('.select-pg-btn').addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent event bubbling to the parent div
                        selectProbeGeneration(pg);
                    });

                    pgElement.addEventListener('click', () => {
                         selectProbeGeneration(pg);
                    });
                    
                    listContainer.appendChild(pgElement);
                });
            })
            .catch(error => {
                console.error('Error fetching probe generations:', error);
                listContainer.innerHTML = '<p class="text-red-400">Error loading probe generations.</p>';
            });
    }

    /**
     * Handles the selection of a probe generation from the modal.
     * @param {object} pg - The selected probe generation object.
     */
    function selectProbeGeneration(pg) {
        // Store the ID
        document.getElementById('probeGenerationId').value = pg.id;
        document.getElementById('taskId').value = pg.task_id;
        
        // Update the info display on the page
        updateSelectedProbeGenerationInfo(pg);
        
        // Hide the modal
        const modal = document.getElementById('probeGenerationSelectModal');
        if(modal) modal.classList.add('hidden');
        
        // Show notification
        showNotification('Probe generation selected.', 'success');
    }
    
    /**
     * Generate model responses
     */
    function generateModelResponses() {
        showNotification('Response generation begins!', 'info');
        // ---> FIX: Disable the 'Proceed to Analysis' button at the start
        const analysisBtn = document.getElementById('goToAnalysisBtn');
        if (analysisBtn) {
            analysisBtn.disabled = true;
        }

        // Check for selected probe generation
        const probeGenerationId = document.getElementById('probeGenerationId')?.value;
        if (!probeGenerationId) {
            showNotification('No probe generation selected. Please select a probe generation from Task History or generate new probes.', 'warning');
            document.getElementById('selectedProbeGenerationInfo').innerHTML = 
                '<div class="text-yellow-400"><i class="fas fa-exclamation-triangle mr-2"></i>Please select a probe generation first</div>';
            return;
        }
        
        // Get generation type
        const isApi = document.getElementById('generationApi')?.checked;

        // Prepare parameters for the API call
        let params = { temperature: parseFloat(document.getElementById('apiTemperature')?.value) };

        if (isApi) {
            params.model = document.getElementById('apiModel')?.value;
        } else {
            params.model = document.getElementById('modelPath')?.value;
            if (!params.model) {
                showNotification('Please select a model or enter a model path', 'warning');
                return;
            }
        }
        
        // Ensure model is a string
        params.model = String(params.model);
        
        // Add probe generation ID
        params.probe_generation_id = probeGenerationId;
        
        // Get task ID if available
        const taskId = document.getElementById('taskId')?.value;
        if (taskId) {
            params.task_id = taskId;
        }

        generationStatus.innerHTML = '<div class="flex items-center text-blue-300"><div class="loader mr-2"></div>Generating responses...</div>';

        fetch('/generate_responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...params, probe_generation_id: probeGenerationId, task_id: document.getElementById('taskId').value })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                generationStatus.innerHTML = '<p class="text-green-400">Successfully generated responses.</p>';
                
                // ---> FIX: Show success notification indicating user can proceed
                showNotification('Model responses generated! You can now proceed to analysis.', 'success');

                // ---> FIX: Enable the 'Proceed to Analysis' button on success
                if (analysisBtn) {
                    analysisBtn.disabled = false;
                }
                
                const resultInfo = document.getElementById('responseResultInfo');
                if(resultInfo) {
                    resultInfo.innerHTML = `
                        <p class="text-green-400 font-semibold">Responses generated successfully!</p>
                        <p class="text-sm mt-2">You can now proceed to the Analysis step, or view the full results in the Task History.</p>
                        <p class="text-xs text-gray-400 mt-1">Task ID: ${data.task_id} | Model Response ID: ${data.model_response_id}</p>
                        <button class="view-in-history-btn mt-3 tech-button text-xs px-2 py-1 bg-gray-500/10 hover:bg-gray-500/20">
                            <i class="fas fa-eye mr-1"></i> View in Task History
                        </button>
                    `;
                    resultInfo.querySelector('.view-in-history-btn').addEventListener('click', function() {
                        const tasksLink = document.querySelector('.nav-item a[data-view="tasks"]');
                        if (tasksLink) {
                            tasksLink.click();
                            setTimeout(() => loadTaskDetails(data.task_id), 100);
                        }
                    });
                }
                
                document.getElementById('modelResponseId').value = data.model_response_id;
            } else {
                const errorMsg = `Error generating responses: ${data.error || 'Unknown error'}`;
                generationStatus.innerHTML = `<p class="text-red-400">${errorMsg}</p>`;
                showNotification(errorMsg, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMsg = 'An unexpected error occurred. Please check the console.';
            generationStatus.innerHTML = `<p class="text-red-400">${errorMsg}</p>`;
            showNotification(errorMsg, 'danger');

            // ---> FIX: Ensure the button remains disabled on error
            if (analysisBtn) {
                analysisBtn.disabled = true;
            }
        });
    }

    function goToStep(step) {
        updateProgressStep(step);

        // Show corresponding view
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        let viewId;
        switch(step) {
            case 1: viewId = 'values-view'; break;
            case 2: viewId = 'probes-view'; break;
            case 3: viewId = 'responses-view'; break;
            case 4: viewId = 'analysis-view'; break;
            case 5: viewId = 'visualization-view'; break;
        }

        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {
            viewToShow.classList.add('active');
            viewToShow.style.display = 'block';
            
            // Check if we need to load specific content for this view
            if (step === 3) { // responses view
                // Check if a probe generation is already selected
                const probeGenerationId = document.getElementById('probeGenerationId')?.value;
                if (probeGenerationId) {
                    // Load the probe generation details to update the UI
                    fetch(`/api/probe_generations/${probeGenerationId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to load probe generation');
                            }
                            return response.json();
                        })
                        .then(probeGeneration => {
                            updateSelectedProbeGenerationInfo(probeGeneration);
                        })
                        .catch(error => {
                            console.error('Error loading probe generation:', error);
                            const infoContainer = document.getElementById('selectedProbeGenerationInfo');
                            if (infoContainer) {
                                infoContainer.innerHTML = 
                                    '<div class="text-red-400"><i class="fas fa-exclamation-circle mr-2"></i>Error loading selected probe generation</div>';
                            }
                        });
                }
            }
        }
    }

            // ========== NEW: Custom Probe Upload Logic ==========
    const uploadProbesBtn = document.getElementById('uploadProbesBtn');
    const uploadProbesInput = document.getElementById('uploadProbesInput');
    const probesListContainer = document.getElementById('probesList'); // Use existing container

    if (uploadProbesBtn && uploadProbesInput) {
        // When the user clicks the pretty button, trigger the hidden file input
        uploadProbesBtn.addEventListener('click', () => {
            uploadProbesInput.click();
        });

        // When the user selects a file in the dialog
        uploadProbesInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return; // User cancelled the dialog
            }

            if (file.type !== 'application/json') {
                showNotification('Please upload a valid .json file.', 'error');
                return;
            }

            const reader = new FileReader();

            reader.onload = function(e) {
                const fileContent = e.target.result;
                let parsedProbes;

                // 1. Try to parse the JSON
                try {
                    parsedProbes = JSON.parse(fileContent);
                } catch (error) {
                    console.error("JSON Parsing Error:", error);
                    const errorHtml = `
                        <div class="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
                            <i class="fas fa-times-circle text-red-400 text-lg mb-2"></i>
                            <p class="text-red-300 font-semibold">JSON Parsing Error</p>
                            <p class="text-gray-400 mt-1 text-sm">The selected file is not valid JSON. Please check the file content and try again.</p>
                        </div>
                    `;
                    if (probesListContainer) probesListContainer.innerHTML = errorHtml;
                    return;
                }

                // 2. (Optional but recommended) Basic validation of the structure
                if (typeof parsedProbes !== 'object' || Array.isArray(parsedProbes) || parsedProbes === null) {
                    const errorHtml = `
                         <div class="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
                            <i class="fas fa-exclamation-triangle text-red-400 text-lg mb-2"></i>
                            <p class="text-red-300 font-semibold">Invalid Probe Format</p>
                            <p class="text-gray-400 mt-1 text-sm">The JSON must be an object with keys representing values (e.g., "care_harm").</p>
                        </div>
                    `;
                    if (probesListContainer) probesListContainer.innerHTML = errorHtml;
                    return;
                }

                // 3. Send the valid JSON to the backend to create a DB record
                fetch('/api/probes/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedProbes)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Custom probes loaded successfully!', 'success');
                        
                        // Use the existing function to display the probes
                        displayProbes(data.probes);

                        // Store the new IDs from the backend
                        if (data.task_id) document.getElementById('taskId').value = data.task_id;
                        if (data.probe_generation_id) document.getElementById('probeGenerationId').value = data.probe_generation_id;
                        
                        // Enable the next step
                        if (nextToResponsesBtn) nextToResponsesBtn.disabled = false;
                    } else {
                        // Display backend validation error
                        const errorHtml = `
                            <div class="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
                                <i class="fas fa-exclamation-triangle text-red-400 text-lg mb-2"></i>
                                <p class="text-red-300 font-semibold">Error from Server</p>
                                <p class="text-gray-400 mt-1 text-sm">${data.error || 'An unknown error occurred.'}</p>
                            </div>
                        `;
                        if (probesListContainer) probesListContainer.innerHTML = errorHtml;
                    }
                })
                .catch(error => {
                    console.error("Error uploading probes:", error);
                    showNotification('An error occurred while uploading probes.', 'error');
                });
            };

            reader.readAsText(file);

            // Reset file input to allow uploading the same file again after an error
            event.target.value = ''; 
        });
    }
    // ========== END: Custom Probe Upload Logic ==========

    window.goToStep = goToStep;
    const nextToResponsesBtn = document.getElementById('nextToResponsesBtn');
    if (nextToResponsesBtn) {
        // ---> FIX: Replaced goToStep(3) with a programmatic click
        nextToResponsesBtn.addEventListener('click', function() {
            const targetNavLink = document.querySelector('.nav-item a[data-view="responses"]');
            if (targetNavLink) {
                targetNavLink.click();
            }
        });
    }

    const goToAnalysisBtn = document.getElementById('goToAnalysisBtn');
    if (goToAnalysisBtn) {
        // ---> FIX: Replaced goToStep(4) with a programmatic click
        goToAnalysisBtn.addEventListener('click', function() {
            const targetNavLink = document.querySelector('.nav-item a[data-view="analysis"]');
            if (targetNavLink) {
                targetNavLink.click();
            }
        });
    }

    const goToVisualizationBtn = document.getElementById('goToVisualizationBtn');
    if (goToVisualizationBtn) {
        // This button now simply navigates to the visualization tab.
        // The logic to render the charts is now handled by handleNavLinkClick.
        goToVisualizationBtn.addEventListener('click', function() {
            // As long as the analysis summary exists, consider the analysis complete and allow navigation
            if (window.latestAnalysisResults && window.latestAnalysisResults.summary) {
                const targetNavLink = document.querySelector('.nav-item a[data-view="visualization"]');
                if (targetNavLink) {
                    targetNavLink.click(); // Click to navigate to the Visualization tab
                }
            } else {
                // Only show this notification if there are truly no analysis results
                showNotification('Please run analysis first to see visualizations.', 'warning');
            }
        });
    }

    // 问题格式选择逻辑
    // Question format selection logic
    const formatCheckboxes = document.querySelectorAll('.question-format-checkbox');
    //const multipleChoiceOptions = document.getElementById('multiple-choice-options');
    //const positionBiasCheckbox = document.getElementById('validation-position-bias');
    function updateQuestionFormatOptions() {
        // 确保至少有一个复选框被选中
        if (!openEndedCheckbox.checked && !multipleChoiceCheckbox.checked) {
            // 'this' 在事件监听器上下文中指向触发事件的元素
            if (this && typeof this.checked !== 'undefined') {
               this.checked = true;
            } else {
                // 如果是直接调用，则默认勾选 open-ended
                openEndedCheckbox.checked = true;
            }
        }
        
        // --- START OF FIX ---
        // 直接在函数内部获取元素，确保它不是 null
        const positionBiasCheckbox = document.getElementById('validation-position-bias');
        const multipleChoiceCheckbox = document.getElementById('format-multiple-choice');

        // 安全检查：如果找不到元素，就打印错误并退出，避免崩溃
        if (!positionBiasCheckbox || !multipleChoiceCheckbox) {
            console.error("Could not find 'validation-position-bias' or 'format-multiple-choice' checkbox.");
            return;
        }

        const parentContainer = positionBiasCheckbox.closest('.p-3');
        if (!parentContainer) {
            console.error("Could not find the '.p-3' parent container for the position bias checkbox.");
            return;
        }
        // --- END OF FIX ---

        // 根据"Multiple-Choice"是否被选中，来启用或禁用"Option Position Bias"
        if (multipleChoiceCheckbox.checked) {
            positionBiasCheckbox.disabled = false;
            // 同时移除父元素的半透明效果，使其看起来可用
            parentContainer.classList.remove('opacity-50');
        } else {
            positionBiasCheckbox.disabled = true;
            positionBiasCheckbox.checked = false; // 如果多选题被取消，也取消它的勾选
            // 增加半透明效果
            parentContainer.classList.add('opacity-50');
        }
    }
    // 为两个复选框绑定同一个处理函数
    if (openEndedCheckbox) openEndedCheckbox.addEventListener('change', updateQuestionFormatOptions);
    if (multipleChoiceCheckbox) multipleChoiceCheckbox.addEventListener('change', updateQuestionFormatOptions);
    updateQuestionFormatOptions();
    // 确保初始状态是正确的

    // ========== API配置检查按钮 ==========
    // ========== API Configuration Check Button ==========
    const checkApiConfigBtn = document.getElementById('checkApiConfigBtn');
    if (checkApiConfigBtn) {
        checkApiConfigBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show loading state
            checkApiConfigBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Checking...';
            checkApiConfigBtn.disabled = true;
            
            // Send request to check API configuration
            fetch('/api/check-api-config')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // API configuration is normal
                        showNotification('API configuration is valid. You can generate probes now.', 'success');
                        
                        // Update button state
                        checkApiConfigBtn.innerHTML = '<i class="fas fa-check-circle mr-1"></i> API Ready';
                        checkApiConfigBtn.classList.remove('text-yellow-300', 'bg-yellow-500/10', 'border-yellow-500/20', 'hover:bg-yellow-500/20');
                        checkApiConfigBtn.classList.add('text-green-300', 'bg-green-500/10', 'border-green-500/20', 'hover:bg-green-500/20');
                    } else {
                        // API configuration has issues
                        showNotification('API configuration issue: ' + data.error, 'error');
                        
                        // Update button state
                        checkApiConfigBtn.innerHTML = '<i class="fas fa-times-circle mr-1"></i> API Not Configured';
                        checkApiConfigBtn.classList.remove('text-yellow-300', 'bg-yellow-500/10', 'border-yellow-500/20', 'hover:bg-yellow-500/20');
                        checkApiConfigBtn.classList.add('text-red-300', 'bg-red-500/10', 'border-red-500/20', 'hover:bg-red-500/20');
                        
                        // Open settings panel
                        setTimeout(() => {
                            document.getElementById('settingsModal').classList.remove('hidden');
                            document.getElementById('apiSettingsTab').click();
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('Error checking API config:', error);
                    showNotification('Error checking API configuration', 'error');
                    
                    // Reset button state
                    checkApiConfigBtn.innerHTML = '<i class="fas fa-key mr-1"></i> Check API Configuration';
                    checkApiConfigBtn.disabled = false;
                });
        });
    }

    // Task History functionality
    function loadTaskHistory() {
        // Get the task table element
        const taskTable = document.getElementById('taskTable');
        if (!taskTable) return;
        
        // Show loading indicator
        taskTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading tasks...</td></tr>';
        
        // Fetch tasks from the server
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                if (tasks.length === 0) {
                    taskTable.innerHTML = '<tr class="border-b border-gray-700"><td colspan="5" class="px-6 py-4 text-center text-gray-400">No tasks found</td></tr>';
                    return;
                }
                
                // Clear the table
                taskTable.innerHTML = '';
                
                // Add each task to the table
                tasks.forEach(task => {
                    const row = document.createElement('tr');
                    row.className = 'border-b border-gray-700 hover:bg-slate-800/30';
                    
                    // Determine task type based on name
                    let taskType = 'Task';
                    let taskTypeClass = 'text-gray-400';
                    if (task.name.includes('Probe Generation')) {
                        taskType = 'Probe Generation';
                        taskTypeClass = 'text-blue-400';
                    } else if (task.name.includes('Model Response')) {
                        taskType = 'Model Response';
                        taskTypeClass = 'text-violet-400';
                    } else if (task.name.includes('Analysis')) {
                        taskType = 'Analysis';
                        taskTypeClass = 'text-green-400';
                    }
                    
                    // Format the date
                    const createdDate = new Date(task.created_at);
                    const formattedDate = createdDate.toLocaleString();
                    
                    row.innerHTML = `
                        <td class="px-6 py-4">${task.id}</td>
                        <td class="px-6 py-4">
                            <div class="flex flex-col">
                                <span>${task.name}</span>
                                <span class="text-xs ${taskTypeClass}">${taskType}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 rounded-full text-xs 
                                ${task.status === 'completed' ? 'bg-green-900/30 text-green-400' : 
                                task.status === 'failed' ? 'bg-red-900/30 text-red-400' : 
                                task.status === 'running' ? 'bg-blue-900/30 text-blue-400' : 
                                'bg-gray-800 text-gray-400'}">
                                ${task.status}
                            </span>
                        </td>
                        <td class="px-6 py-4">${formattedDate}</td>
                        <td class="px-6 py-4">
                            <div class="flex space-x-2">
                                <button class="task-details-btn px-2 py-1 text-xs rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-900/40" data-task-id="${task.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="task-delete-btn px-2 py-1 text-xs rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40" data-task-id="${task.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    taskTable.appendChild(row);
                });
                
                // Add event listeners for detail and delete buttons
                attachTaskEventListeners();
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
                taskTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-400">Error loading tasks: ' + error.message + '</td></tr>';
            });
    }
    function useResponsesForAnalysis(modelResponseId) {
        // 1. Navigate to the Analysis view
        const analysisLink = document.querySelector('a[data-view="analysis"]');
        if (analysisLink) {
            analysisLink.click();
        }

        // 2. A short delay to allow the view to switch
        setTimeout(() => {
            // 3. Set the value in the model response dropdown
            const modelResponseSelect = document.getElementById('modelResponseSelect');
            if (modelResponseSelect) {
                modelResponseSelect.value = modelResponseId;
                
                // 4. Manually trigger the 'change' event to update the UI and button state
                modelResponseSelect.dispatchEvent(new Event('change'));
                
                showNotification(`Loaded Model Response ID ${modelResponseId} for analysis.`, 'info');
            }
        }, 200); // 200ms delay
    }
    function loadTaskDetails(taskId) {
        const taskDetails = document.getElementById('taskDetails');
        if (!taskDetails) return;
        taskDetails.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin mr-2"></i>Loading task details...</div>';
        
        fetch(`/api/tasks/${taskId}`)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch task details: ${response.statusText}`);
                return response.json();
            })
            .then(task => {
                let detailsHtml = `
                    <div class="flex justify-between items-start mb-4">
                        <div>
                        <h4 class="text-lg font-semibold text-amber-300 mb-2">${task.name}</h4>
                        <p class="text-sm text-gray-300">${task.description || 'No description available'}</p>
                        <div class="flex items-center mt-2">
                            <span class="text-xs text-gray-400">Status: </span>
                                <span class="ml-2 px-2 py-0.5 rounded-full text-xs ${task.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}">${task.status}</span>
                        </div>
                        </div>
                        <button id="exportTaskBtn" class="tech-button text-xs px-3 py-1.5 bg-gray-500/10 hover:bg-gray-500/20" data-task-id="${task.id}">
                            <i class="fas fa-file-export mr-1"></i> Export JSON
                        </button>
                    </div>
                `;
                
                if (task.probe_generations && task.probe_generations.length > 0) {
                    const pg = task.probe_generations[0];
                            detailsHtml += `
                                <div class="frosted-dark rounded-xl p-4 mb-4">
                                    <h5 class="text-sm font-semibold text-blue-300 mb-2">Probe Generation Details</h5>
                                    <div class="grid grid-cols-2 gap-4">
                                <div><p class="text-xs text-gray-400">Model:</p><p class="text-sm text-gray-300">${pg.model_name}</p></div>
                                <div><p class="text-xs text-gray-400">Probes per Value:</p><p class="text-sm text-gray-300">${pg.num_probes}</p></div>
                                        </div>
                                        </div>
                                <div class="mt-4 flex justify-end">
                            <button class="use-probes-btn tech-button" data-probe-generation-id="${pg.id}" data-task-id="${task.id}"><i class="fas fa-reply-all mr-1.5"></i> Use for Response Generation</button>
                                </div>
                            `;
                }

                if (task.model_responses && task.model_responses.length > 0) {
                    const mr = task.model_responses[0];
                            detailsHtml += `
                                <div class="frosted-dark rounded-xl p-4 mb-4">
                                    <h5 class="text-sm font-semibold text-violet-300 mb-2">Model Response Details</h5>
                                    <div class="grid grid-cols-2 gap-4">
                                <div><p class="text-xs text-gray-400">Model:</p><p class="text-sm text-gray-300">${mr.model_name}</p></div>
                                <div><p class="text-xs text-gray-400">Temperature:</p><p class="text-sm text-gray-300">${mr.temperature}</p></div>
                                        </div>
                                        </div>
                        <div class="frosted-dark rounded-xl p-4 mt-4">
                            <h5 class="text-sm font-semibold text-violet-300 mb-2">Generated Responses</h5>
                            <div class="max-h-96 overflow-y-auto space-y-4 p-2">
                                ${JSON.parse(mr.responses).map(res => `
                                    <div class="bg-slate-900/30 p-3 rounded-lg border border-slate-700/40">
                                        <div class="mb-2"><p class="text-xs text-gray-400 font-semibold mb-1">Probe:</p>${renderQuestion(res.probe)}</div>
                                        <div class="mt-2 border-t border-slate-700/50 pt-2"><p class="text-xs text-gray-400 font-semibold mb-1">Response:</p><p class="text-sm text-green-300 whitespace-pre-wrap">${String(res.response || '').replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></div>
                                        </div>
                                `).join('')}
                                    </div>
                                </div>
                                <div class="mt-4 flex justify-end">
                            <button class="use-responses-btn tech-button" data-model-response-id="${mr.id}" data-task-id="${task.id}"><i class="fas fa-chart-bar mr-1.5"></i> Use for Analysis</button>
                                </div>
                            `;
                }

                if (task.analyses && task.analyses.length > 0) {
                    const an = task.analyses[0];
                            detailsHtml += `
                                <div class="frosted-dark rounded-xl p-4 mb-4">
                                    <h5 class="text-sm font-semibold text-green-300 mb-2">Analysis Details</h5>
                                    <div class="grid grid-cols-2 gap-4">
                                <div><p class="text-xs text-gray-400">Type:</p><p class="text-sm text-gray-300">${an.analysis_type}</p></div>
                                ${an.judge_model ? `<div><p class="text-xs text-gray-400">Judge Model:</p><p class="text-sm text-gray-300">${an.judge_model}</p></div>` : ''}
                                        </div>
                                        </div>
                                <div class="mt-4 flex justify-end">
                            <button class="view-analysis-btn tech-button" data-analysis-id="${an.id}"><i class="fas fa-chart-line mr-1.5"></i> View Visualization</button>
                                </div>
                            `;
                }
                            
                taskDetails.innerHTML = detailsHtml;
                const useForAnalysisBtn = taskDetails.querySelector('.use-responses-btn');
                    if (useForAnalysisBtn) {
                        useForAnalysisBtn.addEventListener('click', function() {
                            const modelResponseId = this.getAttribute('data-model-response-id');
                            useResponsesForAnalysis(modelResponseId);
                        });
                    }
                attachActionButtonsEventListeners(task.id);
                })
                .catch(error => {
                    console.error('Error loading task details:', error);
                    taskDetails.innerHTML = '<div class="text-center text-red-400 p-4">Error loading task details.</div>';
            });
    }
    
    function attachActionButtonsEventListeners(taskId) {
        const exportBtn = document.getElementById('exportTaskBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => exportTaskAsJSON(taskId));
        }
        // ... attach other listeners for use-probes-btn, etc.
    }

    // ---> 新增代码: 纯前端导出函数 <---
    /**
     * @function exportResultsFromFrontend
     * @description 直接从前端内存中的 window.latestAnalysisResults 导出包含标注的评估详情
     */
    function exportResultsFromFrontend() {
        showNotification('Exporting...', 'info');

        // 数据源是全局变量 window.latestAnalysisResults
        // 我们在后端修改建议中，将完整评估结果存在了 .details 字段下
        const resultsToExport = window.latestAnalysisResults?.details;

        if (!resultsToExport || resultsToExport.length === 0) {
            showNotification('Not Found Files to export!', 'error');
            console.error('Export failed: window.latestAnalysisResults.details is empty or does not exist.');
            return;
        }

        try {
            // 将包含标注的评估结果转换为JSON字符串
            const jsonString = JSON.stringify(resultsToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            // 为文件命名
            a.download = `frontend_evaluation_with_annotations.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('The assessment results including annotations have been exported!', 'success');
        } catch (error) {
            console.error('Error exporting frontend results:', error);
            showNotification('Error exporting frontend results.', 'error');
        }
    }

    /**
     * @function exportTaskAsJSON
     * @description Exports task data. If the task includes a human evaluation,
     * it reconstructs a detailed report matching the format from the visualization export.
     * Otherwise, it exports the raw task data. This ensures consistency across the application.
     * All user-facing notifications are in English.
     */
    async function exportTaskAsJSON(taskId) {
        showNotification('Preparing export data...', 'info');
        try {
            // Step 1: Fetch the main task data from the server
            const taskResponse = await fetch(`/api/tasks/${taskId}`);
            if (!taskResponse.ok) {
                throw new Error('Failed to fetch task data.');
            }
            const taskData = await taskResponse.json();

            // Step 2: Check if the task contains a completed human evaluation analysis
            const analysis = taskData.analyses?.find(an => an.analysis_type === 'human_evaluation');

            // If no human evaluation is found, export the raw task data as a fallback
            if (!analysis || !analysis.results || !analysis.results.evaluation_results) {
                showNotification('No detailed evaluation found. Exporting raw task data.', 'info');
                const rawJsonString = JSON.stringify(taskData, null, 2);
                const blob = new Blob([rawJsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `task_${taskId}_details.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showNotification('Raw task data exported successfully.', 'success');
                return;
            }

            // Step 3: If human evaluation exists, reconstruct the detailed report
            showNotification('Found human evaluation, reconstructing detailed report...', 'info');

            const modelResponse = taskData.model_responses?.find(mr => mr.id === analysis.model_response_id);
            if (!modelResponse) {
                throw new Error('Could not find the associated model response for the analysis.');
            }

            const originalResponses = JSON.parse(modelResponse.responses);
            const evaluationResultsData = analysis.results.evaluation_results;

            // Recreate the structured format by combining original responses with their evaluations
            const detailedResultsForExport = originalResponses.map((item, index) => {
                const result = evaluationResultsData.find(res => res.probe_index === index);

                if (!result) {
                    return null; // This item was not evaluated, so exclude it
                }

                return {
                    probe: item.probe,
                    response: item.response,
                    evaluation: {
                        ratings: result.ratings || {},
                        comment: result.comment || '',
                        annotations: result.annotations || []
                    }
                };
            }).filter(item => item !== null);

            // Step 4: Stringify and trigger the download for the reconstructed detailed report
            const detailedJsonString = JSON.stringify(detailedResultsForExport, null, 2);
            const blob = new Blob([detailedJsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `human_evaluation_export_task_${taskId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Detailed human evaluation report exported successfully.', 'success');

        } catch (error) {
            console.error('Error during task export:', error);
            showNotification(`Failed to export task data: ${error.message}`, 'error');
        }
    }
    
    function deleteTask(taskId) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }
        
        // Delete the task
        fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                return response.json();
            })
            .then(data => {
                showNotification('Task deleted successfully', 'success');
                loadTaskHistory();
                
                // Clear task details
                const taskDetails = document.getElementById('taskDetails');
                if (taskDetails) {
                    taskDetails.innerHTML = '<div class="text-center text-gray-400"><p>Select a task to view details</p></div>';
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                showNotification('Error deleting task: ' + error.message, 'danger');
            });
    }
    
    function attachTaskEventListeners() {
        // Add event listeners for detail buttons
        document.querySelectorAll('.task-details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');
                loadTaskDetails(taskId);
                
                // Highlight the selected row
                document.querySelectorAll('#taskTable tr').forEach(row => {
                    row.classList.remove('bg-amber-900/10', 'border-amber-500/30');
                });
                this.closest('tr').classList.add('bg-amber-900/10', 'border-amber-500/30');
            });
        });
        
        // Add event listeners for delete buttons
        document.querySelectorAll('.task-delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');
                deleteTask(taskId);
            });
        });
    }
    
    // Initialize task history when the tasks view is shown
    document.querySelectorAll('.nav-item a').forEach(link => {
        if (link.getAttribute('data-view') === 'tasks') {
            link.addEventListener('click', function() {
                loadTaskHistory();
            });
        }
    });
    
    // Modify the existing functions to record task history properly
    
    // Update generateProbes function to preserve taskId
    const originalGenerateProbes = generateProbes;
    generateProbes = function() {
        const taskId = document.getElementById('taskId')?.value || null;
        
        // Call the original function with the task ID
        originalGenerateProbes(taskId);
    };
    
    // Ensure that when users go to different steps, the appropriate task IDs are maintained

    // ========== Analysis/Evaluation Button ==========
    const evaluateBtn = document.getElementById('evaluateBtn');
    if (evaluateBtn) {
        evaluateBtn.addEventListener('click', function() {
            console.log('[Debug] "Analyze Responses" button clicked!'); // 日志4：确认按钮点击事件触发
            this.disabled = true;

            const analysisTypeRadio = document.querySelector('input[name="analysisType"]:checked');
            if (!analysisTypeRadio) {
                showNotification('Please select an analysis method.', 'warning');
                this.disabled = false;
                return;
            }
            const analysisType = analysisTypeRadio.value;
            
            console.log(`[Debug] Selected analysis type: ${analysisType}`); // 日志5：报告分析类型
            
            if (analysisType === 'judge') {
                runAnalysis();
            } else if (analysisType === 'human') {
                startHumanEvaluation();
            }
        });
    }

    // Function to update the selected probe generation info display
    function updateSelectedProbeGenerationInfo(probeGeneration) {
        const infoContainer = document.getElementById('selectedProbeGenerationInfo');
        if (!infoContainer) return;
        
        if (!probeGeneration) {
            infoContainer.innerHTML = 'No probe generation selected. Please select one from Task History or generate new probes.';
            infoContainer.className = 'text-sm text-gray-400';
            return;
        }
        
        // Create a clean display of the probe generation details
        let html = `
            <div class="text-sm text-violet-300 font-medium">Selected Probe Generation:</div>
            <div class="grid grid-cols-2 gap-2 mt-2">
                <div>
                    <span class="text-xs text-gray-400">Model:</span>
                    <span class="text-sm text-gray-300 ml-1">${probeGeneration.model_name}</span>
                </div>
                <div>
                    <span class="text-xs text-gray-400">Probes per Value:</span>
                    <span class="text-sm text-gray-300 ml-1">${probeGeneration.num_probes}</span>
                </div>
                <div>
                    <span class="text-xs text-gray-400">Values:</span>
                    <span class="text-sm text-gray-300 ml-1">${probeGeneration.selected_values.length}</span>
                </div>
                <div>
                    <span class="text-xs text-gray-400">Created:</span>
                    <span class="text-sm text-gray-300 ml-1">${new Date(probeGeneration.created_at).toLocaleString()}</span>
                </div>
            </div>
        `;
        
        infoContainer.innerHTML = html;
        infoContainer.className = 'text-sm';
    }
    // ========== 新增：设置弹窗动态功能 ==========

    const settingsModal = document.getElementById('settingsModal');
    const settingsLink = document.querySelector('a[href="#"] i.fa-sliders-h')?.parentElement;
    const settingsContainer = document.getElementById('settingsContainer');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const providerTemplate = document.getElementById('providerTemplate');

    /**
     * 功能 1: 从后端加载 conf.yaml 配置并动态渲染UI
     * 当用户点击设置图标时触发。
     */
    function loadAndRenderSettings() {
        if (!settingsContainer || !providerTemplate) return;

        settingsContainer.innerHTML = '<div class="text-center p-8 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Loading settings from conf.yaml...</div>';

        fetch('/api/settings')
            .then(response => response.json())
            .then(config => {
                settingsContainer.innerHTML = ''; 
                const providers = config.llm_providers || {};
                
                // --- 新增：排序逻辑 ---
                const fixedOrder = ['openai', 'claude', 'gemini'];
                const allProviderNames = Object.keys(providers);
                
                const fixedProviders = fixedOrder.filter(p => allProviderNames.includes(p));
                const otherProviders = allProviderNames.filter(p => !fixedOrder.includes(p)).sort();
                
                const finalOrder = [...fixedProviders, ...otherProviders];
                // --- 排序逻辑结束 ---

                // 使用排序后的列表来渲染
                finalOrder.forEach(providerName => {
                    const providerConf = providers[providerName];
                    renderProviderBlock(providerName, providerConf);
                });
                
                // --- 新增："添加新Provider"按钮 ---
                const addButtonContainer = document.createElement('div');
                addButtonContainer.className = 'mt-6 pt-6 border-t border-slate-700/50 flex justify-center';
                addButtonContainer.innerHTML = `
                    <button id="addNewProviderBtn" class="tech-button text-sm px-4 py-2 rounded-lg text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                        <i class="fas fa-plus mr-2"></i> Add New Compatible Provider
                    </button>
                `;
                settingsContainer.appendChild(addButtonContainer);
                
                document.getElementById('addNewProviderBtn').addEventListener('click', () => {
                    renderProviderBlock(null, null); // 传入null来渲染一个空模板
                    addButtonContainer.remove(); // 添加后移除按钮，防止重复添加
                });

            })
            .catch(error => {
                console.error('Error loading settings:', error);
                settingsContainer.innerHTML = `<div class="text-center p-8 text-red-400"><i class="fas fa-exclamation-triangle mr-2"></i>Failed to load settings.</div>`;
            });
    }

    // 新增一个辅助函数，用于渲染单个Provider模块 (无论是已存在的还是新的)
    function renderProviderBlock(providerName, providerConf) {
        const isNew = !providerName; // 如果没有providerName，说明是新添加的
        const providerClone = providerTemplate.content.cloneNode(true);
        const providerBlock = providerClone.querySelector('.provider-block');

        if (isNew) {
            providerBlock.dataset.isNew = "true"; // 标记为新模块
            providerClone.querySelector('.provider-name').textContent = "New OpenAI-Compatible Provider";
            providerClone.querySelector('.new-provider-name-container').classList.remove('hidden');
            providerClone.querySelector('.provider-base-url-container').classList.remove('hidden'); 
            providerClone.querySelector('.provider-enabled').checked = true; 
            // vvvvvvvv 新增这行代码 vvvvvvvv
            providerClone.querySelector('.new-model-form').classList.remove('hidden');
        } else {
            providerBlock.dataset.providerName = providerName;
            providerClone.querySelector('.provider-name').textContent = providerName;
            const statusLight = providerClone.querySelector('.provider-status-light');
            if (providerConf.enabled) statusLight.classList.add('bg-green-500'); else statusLight.classList.add('bg-red-500');

            const enabledCheckbox = providerClone.querySelector('.provider-enabled');
            enabledCheckbox.checked = providerConf.enabled || false;
            
            providerClone.querySelector('.provider-api-key').value = providerConf.api_key || '';

            if (providerConf.provider_type === 'openai_compatible' && providerConf.base_url) {
                providerClone.querySelector('.provider-base-url-container').classList.remove('hidden');
                providerClone.querySelector('.provider-base-url').value = providerConf.base_url || '';
            }
            
            const modelsContainer = providerClone.querySelector('.provider-models-list');
            const allPossibleModels = providerConf.models || [];
            if (Array.isArray(allPossibleModels)) {
                allPossibleModels.forEach(modelName => {
                const modelId = `model-${providerName}-${modelName.replace(/[.\/:]/g, '-')}`;
                const modelWrapper = document.createElement('div');
                modelWrapper.className = 'flex items-center mb-2'; // Added margin for better spacing
                
                // **FIX:** The innerHTML now includes the <i class="fas fa-check"></i> icon element.
                modelWrapper.innerHTML = `
                    <input id="${modelId}" type="checkbox" class="model-checkbox peer hidden" value="${modelName}">
                    <label for="${modelId}" class="flex items-center cursor-pointer">
                        <div class="w-5 h-5 border-2 border-slate-500 rounded-md flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-colors">
                            <i class="fas fa-check text-white text-xs opacity-0 peer-checked:opacity-100"></i>
                        </div>
                        <span class="ml-3 text-sm font-medium text-gray-300">${modelName}</span>
                    </label>
                `;
                
                const checkbox = modelWrapper.querySelector('input');
                
                // Set the initial checked state based on the configuration
                if (providerConf.models && providerConf.models.includes(modelName)) {
                    checkbox.checked = true;
                }
                
                modelsContainer.appendChild(modelWrapper);
            });
            }
        }
        
        settingsContainer.appendChild(providerClone);
    }
    /**
     * 功能 2: 保存用户的修改到 conf.yaml
     * 当用户点击"保存"按钮时触发。
     */
    async function saveSettings() {
        if (!settingsContainer) return;
        
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Could not fetch current settings before saving.');
            const currentConfig = await response.json();

            const newProvidersConfig = currentConfig.llm_providers || {};
            let validationError = null;

            const providerBlocks = settingsContainer.querySelectorAll('.provider-block');

            providerBlocks.forEach(block => {
                let providerName = block.dataset.providerName;
                const isNew = block.dataset.isNew === "true";

                // 如果是新添加的模块，需要读取并验证其名称
                if (isNew) {
                    providerName = block.querySelector('.new-provider-name-input').value.trim();
                    if (!providerName) {
                        validationError = "New provider name cannot be empty.";
                        return;
                    }
                    if (newProvidersConfig[providerName]) {
                        validationError = `Provider name "${providerName}" already exists. Please use a unique name.`;
                        return;
                    }
                    // 为新Provider设置默认结构
                    newProvidersConfig[providerName] = {
                        provider_type: "openai_compatible",
                        system_prompt: "You are a helpful AI assistant.",
                        temperature: 0.7,
                        max_tokens: 1000
                    };
                }
                
                const originalProviderConf = newProvidersConfig[providerName] || {};
                
                const enabled = block.querySelector('.provider-enabled').checked;
                const apiKey = block.querySelector('.provider-api-key').value;
                const baseUrlInput = block.querySelector('.provider-base-url');

                const selectedModels = [];
                block.querySelectorAll('.provider-models-list input[type="checkbox"]:checked').forEach(checkbox => {
                    selectedModels.push(checkbox.value);
                });
                
                newProvidersConfig[providerName] = {
                    ...originalProviderConf,
                    enabled: enabled,
                    api_key: apiKey,
                    models: selectedModels,
                };
                
                if (baseUrlInput && !baseUrlInput.parentElement.classList.contains('hidden')) {
                     newProvidersConfig[providerName].base_url = baseUrlInput.value;
                }
            });

            // 如果有验证错误，则停止保存并提示用户
            if (validationError) {
                showNotification(validationError, 'error');
                return;
            }

            currentConfig.llm_providers = newProvidersConfig;

            const saveResponse = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentConfig),
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || 'Failed to save settings.');
            }

            const result = await saveResponse.json();
            if (result.success) {
                showNotification('Settings saved successfully! The page will now refresh.', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                throw new Error(result.error || 'An unknown error occurred.');
            }

        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification(`Error saving settings: ${error.message}`, 'error');
        }
    }

    /**
     * 功能 3: 绑定所有相关的事件监听器
     */
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            settingsModal.classList.remove('hidden');
            loadAndRenderSettings(); // 打开弹窗时加载配置
        });
    }

    // 关闭设置弹窗
    document.querySelectorAll('#closeSettingsModal, #settingsModalOverlay').forEach(el => {
        el.addEventListener('click', () => {
            if(settingsModal) settingsModal.classList.add('hidden');
        });
    });

    // "保存"按钮
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }

    // 为动态生成的"显示/隐藏密码"按钮设置事件代理
    if (settingsContainer) {
        settingsContainer.addEventListener('click', function(e) {
            const toggleButton = e.target.closest('.toggle-password');
            if (toggleButton) {
                const input = toggleButton.previousElementSibling;
                const icon = toggleButton.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    }
    if (settingsContainer) {
        settingsContainer.addEventListener('click', function(e) {
            // 检查点击的是否是"Add Model"按钮
            const addBtn = e.target.closest('.add-model-btn');
            if (!addBtn) return;
            
            // 找到相关的元素
            const providerBlock = addBtn.closest('.provider-block');
            const modelInput = providerBlock.querySelector('.new-model-input');
            const modelsList = providerBlock.querySelector('.provider-models-list');
            
            const modelName = modelInput.value.trim();
            
            // 如果输入不为空
            if (modelName) {
                // 1. 创建新的模型复选框和标签
                const modelId = `model-new-${modelName.replace(/[.\/:]/g, '-')}-${Date.now()}`;
                const modelWrapper = document.createElement('div');
                modelWrapper.className = 'flex items-center';
                modelWrapper.innerHTML = `
                    <input id="${modelId}" type="checkbox" class="value-checkbox absolute opacity-0 w-5 h-5" value="${modelName}" checked>
                    <div class="checkbox-custom w-5 h-5 border-2 border-neon-blue bg-blue-900/20 rounded flex items-center justify-center">
                        <i class="fas fa-check text-neon-blue opacity-100"></i>
                    </div>
                    <label for="${modelId}" class="ml-3 text-sm font-medium text-gray-300">${modelName}</label>
                `;
                
                // 2. 将新创建的元素添加到列表中
                modelsList.appendChild(modelWrapper);
                
                // 3. 清空输入框以便继续添加
                modelInput.value = '';
                modelInput.focus();
            }
        });
    }

    // ========== NEW: Analysis Page Logic ==========

    function loadModelResponsesForAnalysis() {
        const modelResponseSelect = document.getElementById('modelResponseSelect');
        if (!modelResponseSelect) {
            console.error("Critical Error: 'modelResponseSelect' dropdown not found.");
            return;
        }

        modelResponseSelect.innerHTML = '<option value="">Loading responses...</option>';
        modelResponseSelect.disabled = true;
        console.log('[Debug] Fetching model responses...'); // 日志

        fetch('/api/model_responses')
            .then(response => {
                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
                return response.json();
            })
            .then(responses => {
                modelResponseSelect.disabled = false;
                modelResponseSelect.innerHTML = '<option value="">-- Select a response set --</option>';

                if (responses && responses.length > 0) {
                    responses.forEach(res => {
                        const option = document.createElement('option');
                        option.value = res.id;
                        option.textContent = `ID: ${res.id} - ${res.model_name} (${new Date(res.created_at).toLocaleString()})`;
                        option.dataset.info = `Task ID: ${res.task_id} | Temp: ${res.temperature}`;
                        modelResponseSelect.appendChild(option);
                    });
                    console.log('[Debug] Successfully loaded model responses.'); // 日志
                } else {
                    modelResponseSelect.innerHTML = '<option value="">No response sets found</option>';
                    console.log('[Debug] No model responses found.'); // 日志
                }

                // VVV 关键修复 VVV
                // 数据加载完毕后，立即调用一次状态检查
                updateAnalysisButtonState();
                // ^^^ 关键修复 ^^^

            })
            .catch(error => {
                console.error('Failed to load model responses:', error);
                modelResponseSelect.innerHTML = `<option value="">Error loading responses.</option>`;
                updateAnalysisButtonState(); // 即使出错也要更新状态
            });
    }

    // Load responses when analysis tab is shown
    
    // ========== END: Analysis Page Logic ==========

    // ========== Human Evaluation Feature ==========
    
    
    const analysisTypeRadios = document.querySelectorAll('input[name="analysisType"]');
    const judgeSettings = document.getElementById('judgeSettings');
    const humanSettings = document.getElementById('humanSettings');

    function setAnalysisPanelVisibility() {
        const selectedRadio = document.querySelector('input[name="analysisType"]:checked');
        if (!selectedRadio || !judgeSettings || !humanSettings) return;

        if (selectedRadio.value === 'judge') {
            judgeSettings.classList.remove('hidden');
            humanSettings.classList.add('hidden');
        } else {
            judgeSettings.classList.add('hidden');
            humanSettings.classList.remove('hidden');
            loadLikertScales();
        }
        updateAnalysisButtonState();
    }

    analysisTypeRadios.forEach(radio => {
        radio.addEventListener('change', setAnalysisPanelVisibility);
    });

    // Load Likert scales from the server
    function loadLikertScales() {
        const likertScaleSelect = document.getElementById('likertScale');
        if (!likertScaleSelect) return;
        
        likertScaleSelect.innerHTML = '<option value="">Loading scales...</option>';
        console.log('[Debug] Fetching Likert scales...'); // 日志

        fetch('/api/likert-scales')
            .then(response => response.json())
            .then(scales => {
                likertScaleSelect.innerHTML = '';
                
                if (scales.length === 0) {
                    likertScaleSelect.innerHTML = '<option value="">No scales available</option>';
                    console.log('[Debug] No Likert scales found.'); // 日志
                } else {
                    scales.forEach(scale => {
                        const option = document.createElement('option');
                        option.value = scale.id;
                        option.textContent = scale.name;
                        if (scale.is_default) {
                            option.textContent += ' (Default)';
                            option.selected = true;
                        }
                        likertScaleSelect.appendChild(option);
                    });
                    console.log('[Debug] Successfully loaded Likert scales.'); // 日志
                }
                
                // VVV 关键修复 VVV
                // 数据加载完毕后，立即调用一次状态检查
                updateAnalysisButtonState();
                // ^^^ 关键修复 ^^^
            })
            .catch(error => {
                console.error('Error loading Likert scales:', error);
                likertScaleSelect.innerHTML = '<option value="">Error loading scales</option>';
                updateAnalysisButtonState(); // 即使出错也要更新状态
            });
    }
    
    // ---> 新增代码: 用于一次性初始化标注相关的弹窗和按钮 <---
    function initializeAnnotationModals() {
        const annotationInputModal = document.getElementById('annotationInputModal');
        const commentInput = document.getElementById('annotationCommentInput');

        if (!annotationInputModal) {
            console.warn('Annotation modal not found in DOM. Annotation features will be disabled.');
            return;
        }

        // Use a single, reliable listener on the modal's parent container
        annotationInputModal.addEventListener('click', function(event) {
            const target = event.target;

            // Check if the "Save" button (or something inside it) was clicked
            if (target.closest('#saveAnnotationBtn')) {
                console.log('[Debug] Save button successfully clicked via delegation.');
                saveAnnotation();
            }

            // Check if the "Cancel" button (or something inside it) was clicked
            if (target.closest('#cancelAnnotationBtn')) {
                console.log('[Debug] Cancel button successfully clicked via delegation.');
                if (commentInput) {
                    commentInput.value = '';
                }
                annotationInputModal.classList.add('hidden');
                annotationInputModal.style.display = 'none'; // <-- 同样在这里新增一行
            }
        });

        console.log('[DEBUG] Annotation modal listeners initialized using event delegation.');
    }
    initializeAnnotationModals();

    /**
     * @function exportFullAnalysis
     * @description Exports the complete analysis results (for both LLM Judge and Human Eval)
     * from the front-end state (window.latestAnalysisResults). It constructs a detailed
     * JSON file as per the user's requirements.
     */
    function exportFullAnalysis() {
        showNotification('Preparing detailed report for export...', 'info');

        const results = window.latestAnalysisResults;

        if (!results || (!results.summary && !results.details)) {
            showNotification('No analysis results found to export.', 'error');
            console.error('Export failed: window.latestAnalysisResults is empty or invalid.');
            return;
        }

        let dataToExport;
        let fileName = `value_probing_analysis_${new Date().toISOString().split('T')[0]}.json`;

        // Case 1: Human Evaluation Results
        // The 'details' key is a flag for human eval results, which are pre-structured.
        if (results.details) {
            dataToExport = results.details;
            fileName = `human_evaluation_report.json`;
        }
        // Case 2: LLM Judge Results
        // These results are typically in a 'full_results' key.
        else if (results.full_results) {
            dataToExport = results.full_results;
            fileName = `llm_judge_report.json`;

            // The logic for LLM Judge reliability/robustness scoring you mentioned
            // (averaging paraphrased/attacked questions) happens on the backend.
            // The `full_results` from the backend should already contain this structure.
            // This front-end function just ensures that this detailed structure is what gets exported.
        }
        // Fallback: If neither specific key exists, export the whole object
        else {
            showNotification('Exporting raw analysis data as a fallback.', 'warning');
            dataToExport = results;
        }

        try {
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Analysis report exported successfully!', 'success');
        } catch (error) {
            console.error('Error during JSON export:', error);
            showNotification('An error occurred during export.', 'error');
        }
    }

    /**
     * @function saveAnnotation
     * @description Saves the annotation data and closes the modal.
     * @bugfix This version adds validation to prevent a TypeError if the evaluationResults
     * state is not ready. This ensures the function does not crash and can always
     * safely close the modal.
     */
    function saveAnnotation() {
        const annotatedTextPreview = document.getElementById('annotatedTextPreview');
        const commentInput = document.getElementById('annotationCommentInput');
        const modal = document.getElementById('annotationInputModal');

        // 1. Get data from the modal
        const selectedText = annotatedTextPreview.textContent;
        const comment = commentInput.value.trim();

        // 2. Basic validation
        if (!comment) {
            showNotification('Please enter a comment for the annotation.', 'warning');
            return;
        }

        // 3. Validate the application's state before trying to use it
        if (evaluationResults && evaluationResults[currentEvaluationIndex]) {
            // State is valid, proceed with saving
            const annotation = {
                text: selectedText,
                comment: comment
            };

            if (!evaluationResults[currentEvaluationIndex].annotations) {
                evaluationResults[currentEvaluationIndex].annotations = [];
            }
            evaluationResults[currentEvaluationIndex].annotations.push(annotation);
            
            showNotification('Annotation saved!', 'success');
            showEvaluationItem(currentEvaluationIndex); // Re-render to show highlight

        } else {
            // State is invalid, report an error but DO NOT crash
            console.error('Save Annotation failed: evaluationResults state is invalid.');
            showNotification('Error: Could not save annotation due to an internal state issue.', 'error');
        }
        
        // 4. Always cleanup and close the modal
        commentInput.value = '';
        modal.classList.add('hidden');
        modal.style.display = 'none'; // <-- 新增这一行来强制隐藏
    }


    /**
     * @function renderAnnotations
     * @description Renders existing annotations when an item is displayed.
     * @bugfix The original function failed to display multiple highlights for identical text
     * because `String.prototype.replace()` would only replace the first occurrence.
     * This new version uses a two-pass placeholder strategy to ensure all annotations are
     * rendered correctly, even if their text content is the same.
     */
    function renderAnnotations(index) {
        const responseEl = document.getElementById('evaluationResponse');
        // Always start with the original, clean response text
        let processedHTML = currentModelResponses[index].response || "No response available";
        const annotations = evaluationResults[index]?.annotations || [];

        if (annotations.length > 0) {
            const replacements = [];

            // First pass: Replace each annotated text with a unique placeholder
            annotations.forEach((ann, i) => {
                // Ensure the text exists in the current state of the HTML before trying to replace
                if (processedHTML.includes(ann.text)) {
                    const placeholder = `__ANNOTATION_${i}__`;
                    const highlightedVersion = `<span class="annotated-text" title="${ann.comment}">${ann.text}</span>`;

                    // Replace the first available occurrence with the unique placeholder
                    processedHTML = processedHTML.replace(ann.text, placeholder);
                    
                    // Store the final HTML replacement for the second pass
                    replacements.push({ placeholder: placeholder, finalHTML: highlightedVersion });
                }
            });

            // Second pass: Replace the unique placeholders with the final highlighted HTML
            replacements.forEach(rep => {
                processedHTML = processedHTML.replace(rep.placeholder, rep.finalHTML);
            });
        }

        // Set the final, fully processed HTML to the DOM
        responseEl.innerHTML = processedHTML;
    }

    // Show Likert scale editor
    function showLikertScaleEditor(scaleData = null) {
        // Clear the form
        likertScaleName.value = '';
        likertScaleDescription.value = '';
        likertScaleId.value = '';
        dimensionsList.innerHTML = '';
        
        if (scaleData) {
            // Edit existing scale
            likertScaleName.value = scaleData.name;
            likertScaleDescription.value = scaleData.description || '';
            likertScaleId.value = scaleData.id;
            
            // Add dimensions
            if (scaleData.scale_definition && Array.isArray(scaleData.scale_definition)) {
                scaleData.scale_definition.forEach(dimension => {
                    addDimension(dimension);
                });
            }
            
            // Enable/disable delete button
            if (scaleData.is_default) {
                deleteLikertScaleBtn.disabled = true;
                deleteLikertScaleBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                deleteLikertScaleBtn.disabled = false;
                deleteLikertScaleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            // Create new scale
            // Add one empty dimension by default
            addDimension();
            
            // Disable delete button
            deleteLikertScaleBtn.disabled = true;
            deleteLikertScaleBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        // Show the modal
        likertScaleModal.classList.remove('hidden');
    }
    
    // Add a dimension to the dimensions list
    function addDimension(dimensionData = null) {
        // Clone the template
        const dimensionItem = dimensionTemplate.querySelector('.dimension-item').cloneNode(true);
        
        // Update dimension number
        const dimensionNumber = dimensionItem.querySelector('.dimension-number');
        dimensionNumber.textContent = dimensionsList.children.length + 1;
        
        // Set values if provided
        if (dimensionData) {
            dimensionItem.querySelector('.dimension-name').value = dimensionData.name || '';
            dimensionItem.querySelector('.dimension-description').value = dimensionData.description || '';
            dimensionItem.querySelector('.dimension-min').value = dimensionData.min || 1;
            dimensionItem.querySelector('.dimension-max').value = dimensionData.max || 5;
            dimensionItem.querySelector('.dimension-min-label').value = dimensionData.min_label || '';
            dimensionItem.querySelector('.dimension-max-label').value = dimensionData.max_label || '';
        }
        
        // Add delete button handler
        dimensionItem.querySelector('.delete-dimension-btn').addEventListener('click', function() {
            dimensionItem.remove();
            // Update dimension numbers
            dimensionsList.querySelectorAll('.dimension-item').forEach((item, index) => {
                item.querySelector('.dimension-number').textContent = index + 1;
            });
        });
        
        // Add to list
        dimensionsList.appendChild(dimensionItem);
    }
    
    // Save Likert scale
    function saveLikertScale() {
        // Validate form
        if (!likertScaleName.value) {
            showNotification('Scale name is required', 'warning');
            return;
        }
        
        if (dimensionsList.children.length === 0) {
            showNotification('At least one dimension is required', 'warning');
            return;
        }
        
        // Collect dimensions
        const dimensions = [];
        dimensionsList.querySelectorAll('.dimension-item').forEach(item => {
            const dimensionName = item.querySelector('.dimension-name').value;
            
            if (!dimensionName) {
                showNotification('All dimensions must have a name', 'warning');
                return;
            }
            
            dimensions.push({
                name: dimensionName,
                description: item.querySelector('.dimension-description').value,
                min: parseInt(item.querySelector('.dimension-min').value),
                max: parseInt(item.querySelector('.dimension-max').value),
                min_label: item.querySelector('.dimension-min-label').value,
                max_label: item.querySelector('.dimension-max-label').value
            });
        });
        
        // Prepare data
        const scaleData = {
            name: likertScaleName.value,
            description: likertScaleDescription.value,
            scale_definition: dimensions
        };
        
        // Determine if creating or updating
        const isUpdate = likertScaleId.value ? true : false;
        
        // API endpoint and method
        const url = isUpdate ? `/api/likert-scales/${likertScaleId.value}` : '/api/likert-scales';
        const method = isUpdate ? 'PUT' : 'POST';
        
        // Save to server
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scaleData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to save scale');
                    });
                }
                return response.json();
            })
            .then(data => {
                showNotification(`Scale ${isUpdate ? 'updated' : 'created'} successfully`, 'success');
                
                // Reload Likert scales
                loadLikertScales();
                
                // Close modal
                likertScaleModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Error saving Likert scale:', error);
                showNotification(`Error: ${error.message}`, 'danger');
            });
    }
    
    // Delete Likert scale
    function deleteLikertScale() {
        if (!likertScaleId.value) {
            showNotification('No scale selected', 'warning');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this scale? This action cannot be undone.')) {
            return;
        }
        
        fetch(`/api/likert-scales/${likertScaleId.value}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to delete scale');
                    });
                }
                return response.json();
            })
            .then(data => {
                showNotification('Scale deleted successfully', 'success');
                
                // Reload Likert scales
                loadLikertScales();
                
                // Close modal
                likertScaleModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Error deleting Likert scale:', error);
                showNotification(`Error: ${error.message}`, 'danger');
            });
    }
    
    // Load Likert scale details
    function loadLikertScaleDetails(scaleId) {
        fetch(`/api/likert-scales/${scaleId}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to load scale');
                    });
                }
                return response.json();
            })
            .then(scale => {
                showLikertScaleEditor(scale);
            })
            .catch(error => {
                console.error('Error loading Likert scale:', error);
                showNotification(`Error: ${error.message}`, 'danger');
            });
    }
    
    /**
     * @function startHumanEvaluation
     * @description Fetches all necessary data (evaluation items and the selected Likert scale definition)
     * before showing the human evaluation modal. This fixes the "No valid Likert Scale" error.
     */
    function startHumanEvaluation() {
        const modelResponseId = document.getElementById('modelResponseId')?.value;
        const likertScaleId = document.getElementById('likertScale')?.value; // Get the selected scale ID

        // --- Validation ---
        if (!modelResponseId) {
            showNotification('Please select a model response set.', 'warning');
            return;
        }
        if (!likertScaleId) {
            showNotification('Please select an evaluation scale.', 'warning');
            return;
        }

        // --- Data Fetching ---
        // Use Promise.all to fetch both the scale definition and the evaluation items concurrently.
        Promise.all([
            // Fetch 1: The definition of the selected Likert Scale
            fetch(`/api/likert-scales/${likertScaleId}`).then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Failed to load the selected evaluation scale.') });
                }
                return res.json();
            }),
            // Fetch 2: The list of items (probe/response pairs) to evaluate
            fetch(`/api/human-evaluations/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model_response_id: modelResponseId })
            }).then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Failed to load evaluation items.') });
                }
                return res.json();
            })
        ])
        .then(([scaleData, evaluationItems]) => {
            // --- State Initialization ---
            // Both fetch requests were successful. Now, set up the global state.
            if (!Array.isArray(evaluationItems) || evaluationItems.length === 0) {
                throw new Error("No evaluation items were returned from the server.");
            }
            
            // This is the critical fix: setting currentLikertScale with the fetched data.
            currentLikertScale = scaleData;
            currentModelResponses = evaluationItems;
            currentEvaluationIndex = 0;
            
            // Prepare the results array where user ratings will be stored.
            evaluationResults = currentModelResponses.map((item, index) => ({
                probe_index: index,
                ratings: {}, // Will be populated with { metric_name: score }
                comment: '',
                annotations: [],
                skipped: false
            }));

            // --- Show Modal ---
            // Now that all data is ready, it is safe to show the modal.
            resetEvaluationForm();
            showEvaluationItem(0); // This will now correctly render the form.
            humanEvaluationModal.classList.remove('hidden');
        })
        .catch(error => {
            // Handle any errors that occurred during the fetching process.
            console.error('Failed to start human evaluation:', error);
            showNotification(`Error preparing evaluation: ${error.message}`, 'error');
        });
    }
    // Replace the old prepareEvaluationItems function with this one
    function prepareEvaluationItems() {
        // Initialize evaluation results for each response item
        evaluationResults = currentModelResponses.map((item, index) => ({
            probe_index: index,
            ratings: {},
            comment: '',
            annotations: [], // Add an array for annotations
            skipped: false
        }));

        // Exit if the detailed probe generation data isn't available
        if (!window.probeGenerationData || !window.probeGenerationData.probes) {
            console.warn("Probe generation data not preloaded. Value names may not be available.");
            return;
        }

        const probesByValue = window.probeGenerationData.probes;

        // Create a reverse map for faster lookups: maps a probe's text to its value name
        const probeValueMap = new Map();
        for (const [value, questionsList] of Object.entries(probesByValue)) {
            for (const question of questionsList) {
                const text = getBaseProbeText(question); // Use the reliable helper function
                if (text && !probeValueMap.has(text)) {
                    probeValueMap.set(text, value);
                }
            }
        }

        // Enhance each model response with its corresponding value name
        currentModelResponses.forEach(item => {
            const probeText = getBaseProbeText(item.probe); // Use the helper here as well

            if (probeText && probeValueMap.has(probeText)) {
                const foundValue = probeValueMap.get(probeText);

                // Ensure the probe is an object before adding the 'value' property to it
                if (typeof item.probe !== 'object' || item.probe === null) {
                    item.probe = { question_text: probeText };
                }
                item.probe.value = foundValue; // This correctly attaches the value name
            }
        });
    }
    // Show evaluation item
    // ---> 替换代码: 这是修复右键问题的核心 <---
    // 替换旧的 showEvaluationItem 函数
    function showEvaluationItem(index) {
        if (index < 0 || index >= currentModelResponses.length) return;

        currentEvaluationIndex = index;
        const item = currentModelResponses[index];
        
        // 从后端准备好的干净数据中直接获取 Value 和 Probe
        const valueName = item.value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const probeText = item.probe?.question_text || "Probe text not available.";

        // 更新UI元素
        evaluationProgress.textContent = `Item ${index + 1} of ${currentModelResponses.length}`;
        evaluationValue.textContent = valueName; // <-- Bug 修复
        evaluationProbe.textContent = probeText;
        evaluationResponse.innerHTML = item.response || "No response available";
        evaluationComment.value = evaluationResults[index]?.comment || '';

        // 渲染动态表单和标注
        renderEvaluationForm(index);
        renderAnnotations(index);

        // 更新导航按钮状态
        prevItemBtn.disabled = index === 0;
        nextItemBtn.disabled = index === currentModelResponses.length - 1;
    }

    
    /**
     * Renders a simplified evaluation form with a single 1-5 rating scale.
     */
    // The new, cleaner function that ONLY renders HTML
    function renderEvaluationForm(index) {
        evaluationForm.innerHTML = ''; // Clear the form first

        // Ensure we have a loaded Likert scale with a definition
        if (!currentLikertScale || !Array.isArray(currentLikertScale.scale_definition)) {
            evaluationForm.innerHTML = '<p class="text-red-400">Error: No valid Likert Scale definition loaded.</p>';
            return;
        }

        const savedRatings = evaluationResults[index]?.ratings || {};

        // Loop through each metric (dimension) in the scale and create a form item for it
        currentLikertScale.scale_definition.forEach(dimension => {
            const metricName = dimension.name;
            const savedRating = savedRatings[metricName];
            
            const formItemHTML = `
                <div class="dimension-container mb-4">
                    <h4 class="text-base font-semibold text-gray-200 mb-2">
                        Rate for: <span class="text-green-300 font-bold">${metricName}</span>
                    </h4>
                    <p class="text-xs text-gray-400 mb-3">
                        ${dimension.description || `Score the model's response on a scale of 1-5.`}
                    </p>
                    <div class="rating-container flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <span class="text-sm text-gray-400 w-1/5 text-center">${dimension.min_label || 'Weak'}</span>
                        <div class="rating-buttons flex-grow flex justify-center space-x-2 md:space-x-3">
                            ${[1, 2, 3, 4, 5].map(i => {
                                const isSelected = savedRating === i;
                                const selectedClass = isSelected ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-700 text-gray-300 hover:bg-slate-600';
                                // IMPORTANT: Add data-metric attribute
                                return `<button type="button" class="rating-button w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${selectedClass}" data-value="${i}" data-metric="${metricName}">${i}</button>`;
                            }).join('')}
                        </div>
                        <span class="text-sm text-gray-400 w-1/5 text-center">${dimension.max_label || 'Strong'}</span>
                    </div>
                </div>
            `;
            evaluationForm.innerHTML += formItemHTML;
        });
    }
    
    // Reset evaluation form
    function resetEvaluationForm() {
        evaluationForm.innerHTML = '';
        evaluationComment.value = '';
    }

    // Complete human evaluation and submit results
    function completeHumanEvaluation() {
        // Check if we have any ratings
        if (evaluationResults.length === 0) {
            showNotification('No evaluation data to submit', 'warning');
            return;
        }

        const hasRatings = evaluationResults.some(item => Object.keys(item.ratings || {}).length > 0 && !item.skipped);
        
        if (!hasRatings) {
            showNotification('Please rate at least one item before submitting', 'warning');
            return;
        }
        
        // Inside completeHumanEvaluation function

        // Get parameters
        const modelResponseId = document.getElementById('modelResponseId')?.value;
        // const likertScaleId = document.getElementById('likertScale')?.value; // We no longer need this line.
        const evaluatorId = document.getElementById('evaluatorId')?.value;
        const batchLabel = document.getElementById('batchLabel')?.value;
        
        // Prepare data
        const data = {
            model_response_id: parseInt(modelResponseId),
            // likert_scale_id is no longer sent from the frontend. The backend will handle it.
            evaluator_id: evaluatorId,
            batch_label: batchLabel,
            evaluation_results: evaluationResults.filter(item => !item.skipped)
        };
        // Update status
        const analysisStatus = document.getElementById('analysisStatus');
        if (analysisStatus) {
            analysisStatus.innerHTML = `
                <div class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                    <p>Submitting evaluation results...</p>
                </div>
            `;
        }
        
        // Submit to server
        fetch('/api/human-evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to submit evaluation');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.warning) {
                showNotification(data.warning, 'warning');
            } else {
                showNotification('Evaluation submitted successfully', 'success');
            }

            // Close modal
            humanEvaluationModal.classList.add('hidden');

            // +++ 新增代码 +++
            // 在这里，我们手动构建包含所有细节的完整结果，以供导出功能使用。
            const detailedResultsForExport = currentModelResponses.map((item, index) => {
                const result = evaluationResults[index];
                // 如果条目被跳过，则不在导出结果中包含它
                if (!result || result.skipped) {
                    return null;
                }
                return {
                    probe: item.probe, // 包含原始问题、类型、所属value等
                    response: item.response, // 模型的原始回复
                    evaluation: { // 人工评估的结果
                        ratings: result.ratings,
                        comment: result.comment,
                        annotations: result.annotations || [] // 包含所有批注
                    }
                };
            }).filter(item => item !== null); // 过滤掉被跳过的条目

            // Fetch the full analysis record to get summary and visualizations
            if (data.analysis_id) {
                fetch(`/api/analyses/${data.analysis_id}`)
                    .then(res => res.json())
                    .then(analysisData => {
                        if (analysisData && analysisData.results) {
                            // 存储从后端获取的基础分析结果 (summary 和 visualizations)
                            window.latestAnalysisResults = analysisData.results;

                            // +++ 关键修改 +++
                            // 将我们刚刚构建的详细结果附加到全局变量上
                            window.latestAnalysisResults.details = detailedResultsForExport;
                            
                            if (analysisStatus) {
                                analysisStatus.innerHTML = `
                                    <div class="text-green-400">
                                        <i class="fas fa-check-circle mr-2"></i>
                                        <span>Evaluation submitted successfully. Analysis ID: ${data.analysis_id}</span>
                                    </div>
                                `;
                            }
                            
                            if (analysisData.results.summary) {
                                updatePreviewMetrics(analysisData.results.summary);
                            }
                            
                            const vizBtn = document.getElementById('goToVisualizationBtn');
                            if (vizBtn) vizBtn.disabled = false;
                            
                            showNotification('You can now view the results in the Visualization tab.', 'info');
                        }
                    });
            }
        })
        .catch(error => {
            console.error('Error submitting evaluation:', error);
            if (analysisStatus) {
                analysisStatus.innerHTML = `
                    <div class="text-red-400">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span>Error: ${error.message}</span>
                    </div>
                `;
            }
            showNotification(`Error: ${error.message}`, 'danger');
        });
    }
    
    // Event listeners for Likert scale management
    if (createScaleBtn) {
        createScaleBtn.addEventListener('click', function() {
            showLikertScaleEditor();
        });
    }
    
    if (editScaleBtn) {
        editScaleBtn.addEventListener('click', function() {
            const selectedScaleId = likertScaleSelect.value;
            if (selectedScaleId) {
                loadLikertScaleDetails(selectedScaleId);
            } else {
                showNotification('Please select a scale to edit', 'warning');
            }
        });
    }
    
    if (likertScaleSelect) {
        likertScaleSelect.addEventListener('change', function() {
            const selectedScaleId = this.value;
            if (selectedScaleId) {
                fetch(`/api/likert-scales/${selectedScaleId}`)
                    .then(response => response.json())
                    .then(scale => {
                        currentLikertScale = scale;
                    })
                    .catch(error => {
                        console.error('Error loading Likert scale:', error);
                    });
            }
        });
    }
    
    if (closeLikertScaleModal) {
        closeLikertScaleModal.addEventListener('click', function() {
            likertScaleModal.classList.add('hidden');
        });
    }
    
    if (saveLikertScaleBtn) {
        saveLikertScaleBtn.addEventListener('click', saveLikertScale);
    }
    
    if (deleteLikertScaleBtn) {
        deleteLikertScaleBtn.addEventListener('click', deleteLikertScale);
    }
    
    if (addDimensionBtn) {
        addDimensionBtn.addEventListener('click', function() {
            addDimension();
        });
    }
    
    // Event listeners for human evaluation
    if (closeHumanEvaluationModal) {
        closeHumanEvaluationModal.addEventListener('click', function() {
            if (humanEvaluationModal) {
                humanEvaluationModal.classList.add('hidden');
                humanEvaluationModal.style = '';
                console.log('Human evaluation modal closed by user.');

                // --- START FIX ---
                // Re-enable the analyze button when the modal is manually closed.
                const evaluateBtn = document.getElementById('evaluateBtn');
                if (evaluateBtn) {
                    evaluateBtn.disabled = false;
                }
                // --- END FIX ---
            }
        });
    }
    
    // 为模态窗口背景添加点击事件，允许通过点击背景关闭窗口
    if (humanEvaluationModal) {
        humanEvaluationModal.addEventListener('click', function(event) {
            if (event.target === humanEvaluationModal) {
                humanEvaluationModal.classList.add('hidden');
                humanEvaluationModal.style = '';

                // --- START FIX ---
                // Also re-enable the button when closing via background click.
                const evaluateBtn = document.getElementById('evaluateBtn');
                if (evaluateBtn) {
                    evaluateBtn.disabled = false;
                }
                // --- END FIX ---
            }
        });
    }
        
    if (evaluationComment) {
        evaluationComment.addEventListener('input', function() {
            // Save comment
            if (currentEvaluationIndex >= 0 && currentEvaluationIndex < evaluationResults.length) {
                evaluationResults[currentEvaluationIndex].comment = this.value;
            }
        });
    }
    
    if (prevItemBtn) {
        prevItemBtn.addEventListener('click', function() {
            // Navigate to previous item
            if (currentEvaluationIndex > 0) {
                showEvaluationItem(currentEvaluationIndex - 1);
            }
        });
    }
    
    if (nextItemBtn) {
        nextItemBtn.addEventListener('click', function() {
            // Navigate to next item
            if (currentEvaluationIndex < currentModelResponses.length - 1) {
                showEvaluationItem(currentEvaluationIndex + 1);
            }
        });
    }
    
    if (skipItemBtn) {
        skipItemBtn.addEventListener('click', function() {
            // Mark current item as skipped
            if (currentEvaluationIndex >= 0 && currentEvaluationIndex < evaluationResults.length) {
                evaluationResults[currentEvaluationIndex].skipped = true;
                evaluationResults[currentEvaluationIndex].ratings = {};
                
                // Show next item, or the last item if already at the end
                if (currentEvaluationIndex < currentModelResponses.length - 1) {
                    showEvaluationItem(currentEvaluationIndex + 1);
                } else {
                    showNotification('This is the last item. You can submit your evaluation now.', 'info');
                }
            }
        });
    }
    
    if (finishEvaluationBtn) {
        finishEvaluationBtn.addEventListener('click', function() {
            // 在完成前，检查当前评估项的状态
            if (currentEvaluationIndex >= 0 && currentEvaluationIndex < evaluationResults.length) {
                const currentItemResult = evaluationResults[currentEvaluationIndex];
                
                // --- START FIX ---
                // 之前的检查逻辑是错误的，它在寻找一个不存在的 'value_score'。
                const ratingsGiven = currentItemResult.ratings || {};
                const hasRating = Object.keys(ratingsGiven).length > 0;
                // --- END FIX ---

                // 如果当前项既没有被评分，也没有被跳过，则弹出确认框。
                if (!hasRating && !currentItemResult.skipped) {
                    if (!confirm('You have not rated the current item. Are you sure you want to finish and submit your evaluation?')) {
                        return; // 如果用户点击"取消"，则停止后续操作。
                    }
                }
            }
            
            // 如果检查通过（或用户在确认框中点击了"确定"），则继续提交评估。
            completeHumanEvaluation();
        });
    }
    if (evaluationForm) {
        evaluationForm.addEventListener('click', function(e) {
            // Check if a rating button was the actual target of the click
            const button = e.target.closest('.rating-button');
            if (button) {
                const value = parseInt(button.dataset.value, 10);
                const metricName = button.dataset.metric; // <-- Get the metric name

                if (!metricName) {
                    console.error("Clicked rating button is missing 'data-metric' attribute.");
                    return;
                }

                // Ensure the ratings object exists
                if (!evaluationResults[currentEvaluationIndex].ratings) {
                    evaluationResults[currentEvaluationIndex].ratings = {};
                }
                
                // Save the score under its metric name
                evaluationResults[currentEvaluationIndex].ratings[metricName] = value;

                // Update the visual state ONLY for buttons of the same metric
                const allMetricButtons = button.closest('.rating-container').querySelectorAll(`.rating-button[data-metric="${metricName}"]`);
                allMetricButtons.forEach(btn => {
                    btn.classList.remove('bg-indigo-600', 'text-white', 'scale-110');
                    btn.classList.add('bg-slate-700', 'text-gray-300', 'hover:bg-slate-600');
                });
                button.classList.add('bg-indigo-600', 'text-white', 'scale-110');
            }
        });
    }
    // ---> 新增代码: 为 "Visualization" 页面的 "Export Results" 按钮添加事件监听 <---
    const exportResultsBtn = document.getElementById('exportResultsBtn');
    if (exportResultsBtn) {
        // A robust way to replace an event listener is to clone the node and add the new listener
        const newBtn = exportResultsBtn.cloneNode(true);
        exportResultsBtn.parentNode.replaceChild(newBtn, exportResultsBtn);

        newBtn.addEventListener('click', exportFullAnalysis);
    }
        // Initialize human evaluation components on page load (现在直接放在外层)
    const analysisLink = document.querySelector('.nav-item a[data-view="analysis"]');
    if (analysisLink) {
        // 为"Analysis"导航链接添加点击事件
        analysisLink.addEventListener('click', function() {
            // 当用户点击进入分析页面时，加载Likert量表
            // 使用 setTimeout 是为了给页面切换留出一点时间，是合理的
            setTimeout(() => {
                loadLikertScales();
            }, 500);
        });
    }

    function runAnalysis() {
        // This function is now only for 'judge' analysis.
        const evaluateBtn = document.getElementById('evaluateBtn'); // Get the button reference
        const modelResponseId = document.getElementById('modelResponseId')?.value;

        if (!modelResponseId) {
            showNotification('No model response selected. Please select a response.', 'warning');
            if (evaluateBtn) evaluateBtn.disabled = false; // Re-enable button on failure
            return;
        }

        const judgeModel = document.getElementById('judgeModel')?.value;
        const judgeTemplate = document.getElementById('judgeTemplate')?.value;
        if (!judgeModel || !judgeTemplate) {
            showNotification('Please select a Judge Model and Template.', 'warning');
            if (evaluateBtn) evaluateBtn.disabled = false; // Re-enable button on failure
            return;
        }

        let params = {
            analysis_type: 'judge',
            model_response_id: modelResponseId,
            judge_model: judgeModel,
            judge_template_id: judgeTemplate
        };

        const taskId = document.getElementById('taskId')?.value;
        if (taskId) {
            params.task_id = taskId;
        }

        const analysisStatus = document.getElementById('analysisStatus');
        if (analysisStatus) {
            analysisStatus.innerHTML = `
                <div class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                    <p>Analyzing responses...</p>
                </div>
            `;
        }

        fetch('/api/evaluate_responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            if (analysisStatus) {
                analysisStatus.innerHTML = `
                    <div class="text-green-400">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span>Analysis completed successfully!</span>
                    </div>
                `;
            }

            window.latestAnalysisResults = data.results;
            if (data.results && data.results.summary) {
                updatePreviewMetrics(data.results.summary);
            }

            showNotification('Analysis complete. You can now view the full visualizations.', 'success');
            
            const goToVizBtn = document.getElementById('goToVisualizationBtn');
            if(goToVizBtn) {
                goToVizBtn.disabled = false;
            }

        })
        .catch(error => {
            console.error('Error during analysis:', error);
            if (analysisStatus) {
                analysisStatus.innerHTML = `<div class="text-red-400"><i class="fas fa-exclamation-circle mr-2"></i><span>Error: ${error.message}</span></div>`;
            }
            showNotification(`Failed to analyze responses: ${error.message}`, 'error');
            if (evaluateBtn) evaluateBtn.disabled = false; // Re-enable button on fetch failure
        });
    }
});

// Function to fix menu clicks
function fixMenuClicks() {
    // Get all menu items
    const navItems = document.querySelectorAll('.nav-item a');
    
    // Remove existing event listeners
    navItems.forEach(link => {
        // Clone the node to remove all event listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Re-add click event listener
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const viewId = this.getAttribute('data-view') + '-view';
            console.log(`[Debug] Menu click fixed: Navigating to ${viewId}`);
            
            // Hide all views
            document.querySelectorAll('.content-view').forEach(view => {
                view.classList.remove('active');
            });
            
            // Show target view
            const targetView = document.getElementById(viewId);
            if (targetView) {
                targetView.classList.add('active');
            }
            
            // Update active link styling
            document.querySelectorAll('.nav-item a').forEach(navLink => {
                navLink.classList.remove('active-nav', 'text-blue-100');
                navLink.classList.add('text-gray-400');
            });
            
            this.classList.remove('text-gray-400');
            this.classList.add('active-nav', 'text-blue-100');
            
            // Update progress step if applicable
            const viewName = this.getAttribute('data-view');
            let step = 0;
            switch(viewName) {
                case 'values': step = 1; break;
                case 'probes': step = 2; break;
                case 'responses': step = 3; break;
                case 'analysis': step = 4; break;
                case 'visualization': step = 5; break;
                case 'tasks': case 'templates': step = 0; break;
            }
            
            if (typeof updateProgressStep === 'function') {
                updateProgressStep(step);
            }
            
            // Close sidebar on mobile
            if (window.innerWidth < 1024) {
                const sidebar = document.getElementById('sidebar');
                const sidebarBackdrop = document.getElementById('sidebarBackdrop');
                if (sidebar && sidebarBackdrop) {
                    sidebar.classList.add('-translate-x-full');
                    sidebarBackdrop.classList.add('hidden');
                }
            }
            
            // Load specific content if needed
            if (viewId === 'tasks-view' && typeof loadTaskHistory === 'function') {
                loadTaskHistory();
            } else if (viewId === 'analysis-view') {
                if (typeof loadModelResponsesForAnalysis === 'function') {
                    loadModelResponsesForAnalysis();
                }
                if (typeof loadLikertScales === 'function') {
                    loadLikertScales();
                }
            }
        }, { capture: true });
    });
}

function setupVisualization(analysisData) {
    console.log("Setting up visualization with data:", analysisData);
    
    // Clear previous visualizations
    const visualizationContainer = document.getElementById('visualizationContainer');
    visualizationContainer.innerHTML = '';
    
    // Check if we have data
    if (!analysisData || !analysisData.type) {
        visualizationContainer.innerHTML = '<div class="p-4 text-center text-gray-400">No visualization data available</div>';
        return;
    }
    
    // Handle different analysis types
    if (analysisData.type === 'metrics') {
        renderMetricsVisualization(analysisData);
    } else if (analysisData.type === 'judge') {
        renderJudgeVisualization(analysisData);
    } else if (analysisData.type === 'human_evaluation') {
        renderHumanEvaluationVisualization(analysisData);
    } else {
        visualizationContainer.innerHTML = `<div class="p-4 text-center text-gray-400">Unsupported visualization type: ${analysisData.type}</div>`;
    }
}

// Render Human Evaluation Visualization
function renderHumanEvaluationVisualization(data) {
    console.log("Rendering human evaluation visualization:", data);
    
    const visualizationContainer = document.getElementById('visualizationContainer');
    visualizationContainer.innerHTML = '';
    
    // Check if we have summary data
    if (!data.summary || Object.keys(data.summary).length === 0) {
        visualizationContainer.innerHTML = '<div class="p-4 text-center text-gray-400">No human evaluation data available</div>';
        return;
    }
    
    // Create visualization header
    const header = document.createElement('div');
    header.className = 'mb-6 text-center';
    header.innerHTML = `
        <h2 class="text-xl font-semibold text-green-300 mb-2">Human Evaluation Results</h2>
        <p class="text-gray-400 text-sm">The chart below shows the average ratings from human evaluators</p>
    `;
    visualizationContainer.appendChild(header);
    
    // Create the radar chart container
    const radarContainer = document.createElement('div');
    radarContainer.className = 'mx-auto max-w-2xl h-[400px] bg-slate-800/30 rounded-lg p-4 border border-slate-700/50';
    visualizationContainer.appendChild(radarContainer);
    
    // Create the bar chart container for detailed view
    const barChartContainer = document.createElement('div');
    barChartContainer.className = 'mx-auto max-w-2xl mt-8 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50';
    barChartContainer.innerHTML = `
        <h3 class="text-lg font-semibold text-blue-300 mb-4">Dimension Ratings</h3>
        <div id="dimensionsBarChart" class="h-[300px]"></div>
    `;
    visualizationContainer.appendChild(barChartContainer);
    
    // Create the summary stats container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'mx-auto max-w-2xl mt-8 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50';
    summaryContainer.innerHTML = `
        <h3 class="text-lg font-semibold text-purple-300 mb-4">Summary Statistics</h3>
        <div id="summaryStats" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    `;
    visualizationContainer.appendChild(summaryContainer);
    
    // Extract dimension names and average scores for the radar chart
    const dimensions = Object.keys(data.summary);
    const averageScores = dimensions.map(dim => data.summary[dim].average);
    
    // Get max value for the radar chart scale
    let maxValue = 5; // Default max value
    dimensions.forEach(dim => {
        if (data.summary[dim].average > maxValue) {
            maxValue = Math.ceil(data.summary[dim].average);
        }
    });
    
    // Render the radar chart
    renderRadarChart(radarContainer, dimensions, averageScores, maxValue);
    
    // Render the bar chart
    renderDimensionsBarChart(dimensions, data.summary);
    
    // Render summary statistics
    renderSummaryStats(dimensions, data.summary);
}

// Render radar chart for human evaluation
function renderRadarChart(container, dimensions, scores, maxValue) {
    // Set up the radar chart data
    const radarData = {
        labels: dimensions,
        datasets: [{
            label: 'Average Rating',
            data: scores,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(16, 185, 129)'
        }]
    };
    
    // Set up the radar chart options
    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    backdropColor: 'transparent',
                    stepSize: 1,
                    min: 0,
                    max: maxValue
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        }
    };
    
    // Create the radar chart
    const radarCanvas = document.createElement('canvas');
    radarCanvas.id = 'radarChart';
    container.appendChild(radarCanvas);
    
    new Chart(radarCanvas, {
        type: 'radar',
        data: radarData,
        options: radarOptions
    });
}

// Render bar chart for dimension ratings
function renderDimensionsBarChart(dimensions, summary) {
    // Extract data for the bar chart
    const averages = dimensions.map(dim => summary[dim].average);
    const stdDevs = dimensions.map(dim => summary[dim].std_dev || 0);
    
    // Set up the bar chart data
    const barData = {
        labels: dimensions,
        datasets: [{
            label: 'Average Rating',
            data: averages,
            backgroundColor: 'rgba(79, 70, 229, 0.6)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
        }]
    };
    
    // Add error bars if we have standard deviations
    if (stdDevs.some(std => std > 0)) {
        barData.datasets[0].errorBars = {
            label: 'Standard Deviation',
            plus: stdDevs,
            minus: stdDevs,
            color: 'rgba(255, 255, 255, 0.6)'
        };
    }
    
    // Set up the bar chart options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        }
    };
    
    // Create the bar chart
    const barCanvas = document.createElement('canvas');
    barCanvas.id = 'dimensionsBarChart';
    document.getElementById('dimensionsBarChart').appendChild(barCanvas);
    
    new Chart(barCanvas, {
        type: 'bar',
        data: barData,
        options: barOptions
    });
}

// Render summary statistics
function renderSummaryStats(dimensions, summary) {
    const statsContainer = document.getElementById('summaryStats');
    statsContainer.innerHTML = '';
    
    dimensions.forEach(dim => {
        const dimData = summary[dim];
        const statCard = document.createElement('div');
        statCard.className = 'bg-slate-700/30 rounded-lg p-3 border border-slate-600/50';
        
        // Format numbers
        const average = dimData.average.toFixed(2);
        const stdDev = (dimData.std_dev || 0).toFixed(2);
        const count = dimData.count || 0;
        
        statCard.innerHTML = `
            <h4 class="text-sm font-semibold text-blue-300 mb-2">${dim}</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex flex-col">
                    <span class="text-gray-400">Average:</span>
                    <span class="text-white font-medium text-lg">${average}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-gray-400">Std Dev:</span>
                    <span class="text-white font-medium text-lg">${stdDev}</span>
                </div>
                <div class="flex flex-col col-span-2">
                    <span class="text-gray-400">Sample Size:</span>
                    <span class="text-white font-medium">${count} ratings</span>
                </div>
            </div>
        `;
        
        statsContainer.appendChild(statCard);
    });
} 
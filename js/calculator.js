document.addEventListener('DOMContentLoaded', () => {
  // Select calculator elements
  const principalInput = document.getElementById('calc-principal');
  const principalVal = document.getElementById('val-principal');
  
  const monthlyInput = document.getElementById('calc-monthly');
  const monthlyVal = document.getElementById('val-monthly');
  
  const rateInput = document.getElementById('calc-rate');
  const rateVal = document.getElementById('val-rate');
  
  const yearsInput = document.getElementById('calc-years');
  const yearsVal = document.getElementById('val-years');

  const finalBalanceEl = document.getElementById('result-final-balance');
  const totalContributionsEl = document.getElementById('result-contributions');
  const totalInterestEl = document.getElementById('result-interest');

  const svgChart = document.getElementById('growth-chart');

  // Verify elements exist
  if (!principalInput || !monthlyInput || !rateInput || !yearsInput || !svgChart) return;

  // Format currency helpers
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCompact = (value) => {
    if (value >= 1e6) {
      return '$' + (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
      return '$' + (value / 1e3).toFixed(0) + 'K';
    }
    return '$' + value;
  };

  // Main Calculation & Render Function
  function updateCalculator() {
    const principal = parseFloat(principalInput.value);
    const monthly = parseFloat(monthlyInput.value);
    const rate = parseFloat(rateInput.value);
    const years = parseInt(yearsInput.value);

    // Update slider value displays
    principalVal.textContent = formatCurrency(principal);
    monthlyVal.textContent = formatCurrency(monthly);
    rateVal.textContent = rate + '%';
    yearsVal.textContent = years + ' yrs';

    // Calculation history
    const history = [];
    let balance = principal;
    let totalContributed = principal;
    const monthlyRate = (rate / 100) / 12;

    history.push({
      year: 0,
      contributed: totalContributed,
      balance: balance,
      interest: 0
    });

    for (let y = 1; y <= years; y++) {
      if (monthlyRate > 0) {
        for (let m = 1; m <= 12; m++) {
          balance = balance * (1 + monthlyRate) + monthly;
          totalContributed += monthly;
        }
      } else {
        balance += (monthly * 12);
        totalContributed += (monthly * 12);
      }
      
      const interest = Math.max(0, balance - totalContributed);
      history.push({
        year: y,
        contributed: totalContributed,
        balance: balance,
        interest: interest
      });
    }

    const finalBalance = balance;
    const totalContributedFinal = totalContributed;
    const totalInterestFinal = Math.max(0, finalBalance - totalContributedFinal);

    // Update UI text results
    finalBalanceEl.textContent = formatCurrency(finalBalance);
    totalContributionsEl.textContent = formatCurrency(totalContributedFinal);
    totalInterestEl.textContent = formatCurrency(totalInterestFinal);

    // Render the SVG Chart
    renderChart(history, years);
  }

  function renderChart(history, years) {
    const svgWidth = svgChart.clientWidth || 600;
    const svgHeight = 280;
    
    // Set viewport coordinates
    svgChart.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const maxVal = history[history.length - 1].balance;
    
    // Clear SVG content first
    svgChart.innerHTML = '';

    // Create defs for gradients and filters
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <!-- Total wealth area gradient -->
      <linearGradient id="emerald-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#144930" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#144930" stop-opacity="0.05"/>
      </linearGradient>
      <!-- Contributions area gradient -->
      <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.01"/>
      </linearGradient>
    `;
    svgChart.appendChild(defs);

    // Draw horizontal grid lines and Y axis labels
    const gridLinesCount = 4;
    for (let i = 0; i <= gridLinesCount; i++) {
      const yVal = (maxVal / gridLinesCount) * i;
      const yPos = padding.top + chartHeight - (yVal / maxVal) * chartHeight;

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', yPos);
      line.setAttribute('x2', padding.left + chartWidth);
      line.setAttribute('y2', yPos);
      line.setAttribute('stroke', '#E2E8F0');
      line.setAttribute('stroke-width', '1');
      if (i > 0) line.setAttribute('stroke-dasharray', '4 4');
      svgChart.appendChild(line);

      // Y Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', yPos + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', '#718096');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', 'Outfit, sans-serif');
      text.textContent = formatCompact(yVal);
      svgChart.appendChild(text);
    }

    // Draw X-axis label points (every 5 years or based on total years)
    const xInterval = years <= 10 ? 1 : (years <= 20 ? 5 : 10);
    history.forEach((d) => {
      if (d.year % xInterval === 0 || d.year === years) {
        const xPos = padding.left + (d.year / years) * chartWidth;
        
        // Year text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xPos);
        text.setAttribute('y', padding.top + chartHeight + 22);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#718096');
        text.setAttribute('font-size', '11');
        text.setAttribute('font-family', 'Outfit, sans-serif');
        text.textContent = `Yr ${d.year}`;
        svgChart.appendChild(text);
      }
    });

    // Build the SVG path commands for coordinates
    const pointsTotal = [];
    const pointsContributed = [];

    history.forEach((d) => {
      const x = padding.left + (d.year / years) * chartWidth;
      const yTotal = padding.top + chartHeight - (d.balance / maxVal) * chartHeight;
      const yContributed = padding.top + chartHeight - (d.contributed / maxVal) * chartHeight;

      pointsTotal.push({ x, y: yTotal, d });
      pointsContributed.push({ x, y: yContributed, d });
    });

    // Total balance area & line path
    let dTotalLine = `M ${pointsTotal[0].x} ${pointsTotal[0].y}`;
    let dTotalArea = `M ${pointsTotal[0].x} ${padding.top + chartHeight} L ${pointsTotal[0].x} ${pointsTotal[0].y}`;
    
    // Contributed area & line path
    let dContLine = `M ${pointsContributed[0].x} ${pointsContributed[0].y}`;
    let dContArea = `M ${pointsContributed[0].x} ${padding.top + chartHeight} L ${pointsContributed[0].x} ${pointsContributed[0].y}`;

    for (let i = 1; i < pointsTotal.length; i++) {
      dTotalLine += ` L ${pointsTotal[i].x} ${pointsTotal[i].y}`;
      dTotalArea += ` L ${pointsTotal[i].x} ${pointsTotal[i].y}`;

      dContLine += ` L ${pointsContributed[i].x} ${pointsContributed[i].y}`;
      dContArea += ` L ${pointsContributed[i].x} ${pointsContributed[i].y}`;
    }

    dTotalArea += ` L ${pointsTotal[pointsTotal.length - 1].x} ${padding.top + chartHeight} Z`;
    dContArea += ` L ${pointsContributed[pointsContributed.length - 1].x} ${padding.top + chartHeight} Z`;

    // 1. Draw Total Value Area
    const pathTotalArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathTotalArea.setAttribute('d', dTotalArea);
    pathTotalArea.setAttribute('fill', 'url(#emerald-grad)');
    svgChart.appendChild(pathTotalArea);

    // 2. Draw Total Value Line
    const pathTotalLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathTotalLine.setAttribute('d', dTotalLine);
    pathTotalLine.setAttribute('fill', 'none');
    pathTotalLine.setAttribute('stroke', '#144930');
    pathTotalLine.setAttribute('stroke-width', '3');
    pathTotalLine.setAttribute('stroke-linecap', 'round');
    svgChart.appendChild(pathTotalLine);

    // 3. Draw Contributed Area (overlap)
    const pathContArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathContArea.setAttribute('d', dContArea);
    pathContArea.setAttribute('fill', 'url(#gold-grad)');
    svgChart.appendChild(pathContArea);

    // 4. Draw Contributed Line
    const pathContLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathContLine.setAttribute('d', dContLine);
    pathContLine.setAttribute('fill', 'none');
    pathContLine.setAttribute('stroke', '#D4AF37');
    pathContLine.setAttribute('stroke-width', '2');
    pathContLine.setAttribute('stroke-linecap', 'round');
    svgChart.appendChild(pathContLine);

    // Interactive Hover Tracking elements
    const hoverLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hoverLine.setAttribute('y1', padding.top);
    hoverLine.setAttribute('y2', padding.top + chartHeight);
    hoverLine.setAttribute('stroke', '#718096');
    hoverLine.setAttribute('stroke-width', '1');
    hoverLine.setAttribute('stroke-dasharray', '2 2');
    hoverLine.setAttribute('class', 'opacity-0');
    svgChart.appendChild(hoverLine);

    const circleTotal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleTotal.setAttribute('r', '6');
    circleTotal.setAttribute('fill', '#144930');
    circleTotal.setAttribute('stroke', '#FFFFFF');
    circleTotal.setAttribute('stroke-width', '2');
    circleTotal.setAttribute('class', 'opacity-0');
    svgChart.appendChild(circleTotal);

    const circleCont = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleCont.setAttribute('r', '5');
    circleCont.setAttribute('fill', '#D4AF37');
    circleCont.setAttribute('stroke', '#FFFFFF');
    circleCont.setAttribute('stroke-width', '2');
    circleCont.setAttribute('class', 'opacity-0');
    svgChart.appendChild(circleCont);

    // Create Tooltip Overlay
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.className = 'absolute bg-emerald-deep text-white px-3 py-2 rounded-lg text-xs shadow-xl hidden font-sans pointer-events-none z-10 border border-gold-primary/20 leading-snug';
      // Append to the parent container of the SVG
      svgChart.parentElement.appendChild(tooltip);
    }

    // Track mouse movements
    svgChart.addEventListener('mousemove', (e) => {
      const rect = svgChart.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      
      // Calculate normalized X within chart dimensions
      const chartX = mouseX - padding.left;
      if (chartX >= 0 && chartX <= chartWidth) {
        // Find the closest year index
        const pct = chartX / chartWidth;
        const index = Math.min(years, Math.max(0, Math.round(pct * years)));
        
        const ptTotal = pointsTotal[index];
        const ptCont = pointsContributed[index];

        if (ptTotal && ptCont) {
          // Position lines and markers
          hoverLine.setAttribute('x1', ptTotal.x);
          hoverLine.setAttribute('x2', ptTotal.x);
          hoverLine.classList.remove('opacity-0');

          circleTotal.setAttribute('cx', ptTotal.x);
          circleTotal.setAttribute('cy', ptTotal.y);
          circleTotal.classList.remove('opacity-0');

          circleCont.setAttribute('cx', ptCont.x);
          circleCont.setAttribute('cy', ptCont.y);
          circleCont.classList.remove('opacity-0');

          // Position and update HTML tooltip
          tooltip.style.left = `${ptTotal.x - 30}px`;
          tooltip.style.top = `${Math.min(ptTotal.y, ptCont.y) - 85}px`;
          tooltip.classList.remove('hidden');
          tooltip.innerHTML = `
            <div class="font-bold border-b border-gold-primary/20 pb-0.5 mb-1 text-gold-light">Year ${ptTotal.d.year}</div>
            <div>Total Wealth: <strong class="text-white">${formatCurrency(ptTotal.d.balance)}</strong></div>
            <div>Contributed: <span class="text-stone-300">${formatCurrency(ptTotal.d.contributed)}</span></div>
            <div>Interest: <span class="text-gold-primary">${formatCurrency(ptTotal.d.interest)}</span></div>
          `;
        }
      } else {
        hideTooltip();
      }
    });

    svgChart.addEventListener('mouseleave', hideTooltip);

    function hideTooltip() {
      hoverLine.classList.add('opacity-0');
      circleTotal.classList.add('opacity-0');
      circleCont.classList.add('opacity-0');
      tooltip.classList.add('hidden');
    }
  }

  // Set up event listeners for real-time dynamic inputs
  const inputs = [principalInput, monthlyInput, rateInput, yearsInput];
  inputs.forEach(input => {
    input.addEventListener('input', updateCalculator);
  });

  // Run initial update on load
  updateCalculator();

  // Redraw chart on window resize for responsiveness
  window.addEventListener('resize', updateCalculator);
});

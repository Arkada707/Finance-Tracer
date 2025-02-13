const DateTime = luxon.DateTime;
let currentDate = DateTime.local();
let financialState = {
    monthlyIncome: 0,
    monthlyBills: 0,
    balances: { bank: 0, cash: 0 },
    familySupport: { liveWithFamily: false, foodSupport: false },
    spendingData: {},
    savings: {
        enabled: false,
        percentage: 20,
        dailySavings: {},
        totalSaved: 0
    },
    incomePaymentDate: DateTime.local().toISODate(),
    billsPaid: false
};

let balanceChart, expenseChart;

// Calendar initialization
function createCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    const daysInMonth = currentDate.daysInMonth;
    const firstDay = currentDate.startOf('month').weekday; // 1 (Monday) to 7 (Sunday)

    // Create empty placeholder days for the first week
    for (let i = 1; i < firstDay; i++) {
        calendar.appendChild(createEmptyDay());
    }

    // Create days for the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.day = day;
        
        const date = currentDate.set({ day });
        const isPast = date < DateTime.local().startOf('day');
        const isIncomeDay = date.toISODate() === financialState.incomePaymentDate;
        
        dayElement.innerHTML = `
            <div class="day-header ${isIncomeDay ? 'income-day' : ''}">${day}</div>
            <div class="day-content">
                ${financialState.spendingData[day] ? `
                    <div class="spent">$${financialState.spendingData[day]}</div>
                    ${financialState.savings.dailySavings[day] ? `
                        <div class="saved">+$${financialState.savings.dailySavings[day]}</div>
                    ` : ''}
                ` : ''}
            </div>
        `;

        if (isPast) dayElement.classList.add('past-day');
        if (isIncomeDay) dayElement.classList.add('income-day');
        
        dayElement.addEventListener('click', () => handleDayClick(day));
        calendar.appendChild(dayElement);
    }

    document.getElementById('current-month').textContent = currentDate.toFormat('MMMM yyyy');
}

function createEmptyDay() {
    const emptyDay = document.createElement('div');
    emptyDay.classList.add('calendar-day', 'empty-day');
    return emptyDay;
}

function handleDayClick(day) {
    const spent = financialState.spendingData[day] || 0;
    const input = prompt(`Enter daily spending for ${currentDate.set({ day }).toFormat('dd/MM')}:`, spent);
    
    if (input !== null) {
        const amount = parseFloat(input) || 0;
        financialState.spendingData[day] = amount;
        updateSavingsCalculations();
        createCalendar();
        updateExpenseChart();
    }
}

// Enhanced planning algorithm
function generateFinancialPlan() {
    const incomeDate = DateTime.fromISO(financialState.incomePaymentDate);
    const today = DateTime.local();
    
    // Calculate available funds
    let availableFunds = financialState.balances.bank + financialState.balances.cash;
    
    if (today >= incomeDate.startOf('day')) {
        availableFunds += financialState.monthlyIncome;
    }
    
    if (!financialState.billsPaid) {
        availableFunds -= financialState.monthlyBills;
    }
    
    // Calculate remaining days
    const daysInMonth = currentDate.daysInMonth;
    const daysPassed = Math.min(today.day, daysInMonth);
    const remainingDays = daysInMonth - daysPassed;

    // Calculate daily allowance
    const spent = Object.values(financialState.spendingData).reduce((a, b) => a + b, 0);
    const dailyAllowance = (availableFunds - spent) / remainingDays;
    
    // Calculate savings
    const savingsPercentage = financialState.savings.enabled ? 
        financialState.savings.percentage / 100 : 0;
    
    let totalPotentialSavings = 0;
    financialState.savings.dailySavings = {};

    document.querySelectorAll('.calendar-day').forEach(dayEl => {
        const day = parseInt(dayEl.dataset.day);
        if (day <= daysPassed) return;

        const spent = financialState.spendingData[day] || 0;
        const maxSpend = dailyAllowance * (1 - savingsPercentage);
        const savings = Math.max(dailyAllowance - spent, 0) * savingsPercentage;
        
        financialState.savings.dailySavings[day] = savings.toFixed(2);
        totalPotentialSavings += savings;

        dayEl.classList.remove('green', 'orange', 'red');
        
        if (spent <= maxSpend * 0.75) {
            dayEl.classList.add('green');
        } else if (spent <= maxSpend) {
            dayEl.classList.add('orange');
        } else {
            dayEl.classList.add('red');
        }
    });

    financialState.savings.totalSaved = totalPotentialSavings.toFixed(2);
    updateSavingsDisplay();
}

function updateSavingsDisplay() {
    const savingsHtml = `
        <div class="savings-report">
            <h3>Savings Projection</h3>
            <p>Daily Savings Target: ${financialState.savings.percentage}%</p>
            <p>Projected Monthly Savings: $${financialState.savings.totalSaved}</p>
        </div>
    `;
    document.getElementById('savings-summary').innerHTML = savingsHtml;
}

// Data persistence
function saveFinancialState() {
    const state = {
        ...financialState,
        incomePaymentDate: financialState.incomePaymentDate,
        currentDate: currentDate.toISO()
    };
    
    localStorage.setItem('financialState', JSON.stringify(state));
    showStatus('Data saved successfully!', 'success');
}

function loadFinancialState() {
    const savedState = localStorage.getItem('financialState');
    if (!savedState) return;

    const state = JSON.parse(savedState);
    currentDate = DateTime.fromISO(state.currentDate);
    
    // Restore form values
    document.getElementById('monthly-income').value = state.monthlyIncome;
    document.getElementById('monthly-bills').value = state.monthlyBills;
    document.getElementById('bank-balance').value = state.balances.bank;
    document.getElementById('cash-balance').value = state.balances.cash;
    document.getElementById('income-date').value = state.incomePaymentDate;
    document.getElementById('bills-paid').checked = state.billsPaid;
    document.getElementById('live-with-family').checked = state.familySupport.liveWithFamily;
    document.getElementById('family-support-food').checked = state.familySupport.foodSupport;
    document.getElementById('enable-saving').checked = state.savings.enabled;
    document.getElementById('saving-percent').value = state.savings.percentage;

    financialState = state;
    createCalendar();
    updateCharts();
    showStatus('Previous session restored!', 'success');
}

// Enhanced CSV handling
function exportToCSV() {
    const csvContent = [
        ['Category', 'Value'],
        ['Monthly Income', financialState.monthlyIncome],
        ['Monthly Bills', financialState.monthlyBills],
        ['Bank Balance', financialState.balances.bank],
        ['Cash Balance', financialState.balances.cash],
        ['Savings Percentage', financialState.savings.percentage],
        ['Projected Savings', financialState.savings.totalSaved],
        ['Day,Spent,Saved']
    ].concat(
        Object.entries(financialState.spendingData).map(([day, spent]) => [
            day,
            spent,
            financialState.savings.dailySavings[day] || '0.00'
        ])
    ).map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `financial_report_${currentDate.toFormat('yyyy-MM')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// UI Helpers
function showStatus(message, type = 'info') {
    const statusBar = document.getElementById('status-bar');
    statusBar.textContent = message;
    statusBar.className = `status-${type}`;
    setTimeout(() => statusBar.className = '', 3000);
}

// Event Listeners
document.getElementById('plan-button').addEventListener('click', () => {
    financialState.monthlyIncome = parseFloat(document.getElementById('monthly-income').value) || 0;
    financialState.monthlyBills = parseFloat(document.getElementById('monthly-bills').value) || 0;
    financialState.balances.bank = parseFloat(document.getElementById('bank-balance').value) || 0;
    financialState.balances.cash = parseFloat(document.getElementById('cash-balance').value) || 0;
    financialState.incomePaymentDate = document.getElementById('income-date').value;
    financialState.billsPaid = document.getElementById('bills-paid').checked;
    financialState.familySupport.liveWithFamily = document.getElementById('live-with-family').checked;
    financialState.familySupport.foodSupport = document.getElementById('family-support-food').checked;
    financialState.savings.enabled = document.getElementById('enable-saving').checked;
    financialState.savings.percentage = parseFloat(document.getElementById('saving-percent').value) || 20;

    generateFinancialPlan();
});

document.getElementById('enable-saving').addEventListener('change', (e) => {
    document.getElementById('saving-percent').disabled = !e.target.checked;
});

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate = currentDate.minus({ months: 1 });
    createCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate = currentDate.plus({ months: 1 });
    createCalendar();
});

document.getElementById('save-button').addEventListener('click', saveFinancialState);
document.getElementById('download-button').addEventListener('click', exportToCSV);

// Initialize
function init() {
    loadFinancialState();
    createCalendar();
    initCharts();
}

window.onload = init;
let monthlyIncome = 0;
let monthlyBills = 0;
let familySupport = { liveWithFamily: false, foodSupport: false };
let spendingData = {};
let balance = { bank: 0, cash: 0 };
let balanceChart, expenseChart;
let enableSaving = false;

// Initialize charts
function initCharts() {
    // Balance Meter (Gauge Chart)
    const balanceCtx = document.getElementById('balanceChart').getContext('2d');
    balanceChart = new Chart(balanceCtx, {
        type: 'doughnut',
        data: {
            labels: ['Bank', 'Cash'],
            datasets: [{
                data: [balance.bank, balance.cash],
                backgroundColor: ['#4CAF50', '#2196F3']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Current Balance'
                }
            }
        }
    });

    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expense Distribution'
                }
            }
        }
    });
}

// Calendar functions
function createCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const daysInMonth = 31;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        if (spendingData[day]) {
            dayElement.innerHTML += `<br>$${spendingData[day]}`;
        }

        dayElement.addEventListener('click', () => {
            const amount = prompt(`Enter amount spent on day ${day}:`, spendingData[day] || '');
            if (amount !== null) {
                spendingData[day] = Number(amount);
                dayElement.innerHTML = `${day}<br>$${amount}`;
                updateExpenseChart();
            }
        });
        
        calendar.appendChild(dayElement);
    }
}

function updateExpenseChart() {
    const amounts = Object.values(spendingData);
    const total = amounts.reduce((sum, num) => sum + num, 0);
    
    expenseChart.data.labels = Object.keys(spendingData).map(d => `Day ${d}`);
    expenseChart.data.datasets[0].data = amounts;
    expenseChart.data.datasets[0].backgroundColor = amounts.map(() => 
        `#${Math.floor(Math.random()*16777215).toString(16)}`
    );
    
    expenseChart.update();
}

// Planning function
function generatePlan() {
    const income = Number(document.getElementById('monthly-income').value) || 0;
    const bills = Number(document.getElementById('monthly-bills').value) || 0;
    const daysLeft = 31 - new Date().getDate();
    let available = income - bills;
    
    // Adjust for family support
    if (familySupport.foodSupport) available += (300); // Assuming $300 food cost
    
    // Deduct existing spending
    const spent = Object.values(spendingData).reduce((a, b) => a + b, 0);
    available -= spent;
    
    // Calculate daily allowance
    let dailyAllowance = available / daysLeft;
    if (enableSaving) dailyAllowance *= 0.8; // Save 20%

    // Color coding logic
    const today = new Date().getDate();
    document.querySelectorAll('.calendar-day').forEach(dayEl => {
        const day = parseInt(dayEl.textContent);
        if (day < today) return;

        const spent = spendingData[day] || 0;
        const remaining = dailyAllowance - spent;
        
        dayEl.classList.remove('green', 'orange', 'red');
        if (remaining >= dailyAllowance * 0.5) {
            dayEl.classList.add('green');
        } else if (remaining > 0) {
            dayEl.classList.add('orange');
        } else {
            dayEl.classList.add('red');
        }
    });
}

// Data persistence
function saveData() {
    const data = {
        monthlyIncome: document.getElementById('monthly-income').value,
        monthlyBills: document.getElementById('monthly-bills').value,
        familySupport,
        spendingData,
        balance,
        enableSaving
    };
    
    document.cookie = `financeData=${JSON.stringify(data)}; expires=${new Date(Date.now() + 86400e3).toUTCString()}`;
    updateBalanceChart();
    alert('Data saved!');
}

function loadData() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('financeData='));
    if (!cookie) return;
    
    const data = JSON.parse(cookie.split('=')[1]);
    document.getElementById('monthly-income').value = data.monthlyIncome;
    document.getElementById('monthly-bills').value = data.monthlyBills;
    familySupport = data.familySupport;
    spendingData = data.spendingData;
    balance = data.balance;
    enableSaving = data.enableSaving;
    
    document.getElementById('bank-balance').value = balance.bank;
    document.getElementById('cash-balance').value = balance.cash;
    document.getElementById('enable-saving').checked = enableSaving;
    document.getElementById('live-with-family').checked = familySupport.liveWithFamily;
    document.getElementById('family-support-food').checked = familySupport.foodSupport;
    
    createCalendar();
    updateBalanceChart();
}

function updateBalanceChart() {
    balance.bank = Number(document.getElementById('bank-balance').value) || 0;
    balance.cash = Number(document.getElementById('cash-balance').value) || 0;
    
    balanceChart.data.datasets[0].data = [balance.bank, balance.cash];
    balanceChart.update();
}

// CSV handling
function downloadCSV() {
    const csvContent = [
        ['Monthly Income', monthlyIncome],
        ['Monthly Bills', monthlyBills],
        ['Bank Balance', balance.bank],
        ['Cash Balance', balance.cash],
        ['Days,Amount']
    ].concat(
        Object.entries(spendingData).map(([day, amount]) => [day, amount])
    ).map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial_data.csv';
    a.click();
}

// Event listeners
document.getElementById('save-button').addEventListener('click', saveData);
document.getElementById('download-button').addEventListener('click', downloadCSV);
document.getElementById('plan-button').addEventListener('click', generatePlan);
document.getElementById('enable-saving').addEventListener('change', (e) => {
    enableSaving = e.target.checked;
});
document.getElementById('live-with-family').addEventListener('change', (e) => {
    familySupport.liveWithFamily = e.target.checked;
});
document.getElementById('family-support-food').addEventListener('change', (e) => {
    familySupport.foodSupport = e.target.checked;
});

// Initialization
initCharts();
loadData();
createCalendar();
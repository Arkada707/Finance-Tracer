document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const incomeInput = document.getElementById('income');
    const incomeDateInput = document.getElementById('income-date');
    const expensesList = document.getElementById('expenses-list');
    const addExpenseButton = document.getElementById('add-expense-button');
    const savingsGoalInput = document.getElementById('savings-goal');
    const savingsTargetDateInput = document.getElementById('savings-target-date');
    const savingsSummary = document.getElementById('savings-summary');
    const summarySection = document.getElementById('summary');
    const suggestionsSection = document.getElementById('suggestions');
    const balanceMeterFill = document.getElementById('balance-fill');
    const balanceAmount = document.getElementById('balance-amount');
    const calendar = document.getElementById('calendar');
    const spendingChartCanvas = document.getElementById('spending-chart');

    // Initialize data
    let expenses = [];
    let savingsGoal = 0;
    let targetDate = null;
    let income = 0;
    let incomeDate = null;
    let currentMonth = new Date();

    // Function to update the balance meter
    const updateBalanceMeter = () => {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingBalance = income - totalExpenses;
        const percentage = income > 0 ? Math.max(0, Math.min(1, remainingBalance / income)) * 100 : 0;

        balanceMeterFill.style.width = `${percentage}%`;
        balanceAmount.textContent = `$${remainingBalance.toFixed(2)}`;
    };

    // Function to add an expense
    const addExpense = () => {
        const expenseName = prompt('Enter expense name:');
        if (!expenseName) return;
        const expenseAmount = parseFloat(prompt('Enter expense amount:'));
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            alert('Please enter a valid expense amount.');
            return;
        }

        expenses.push({ name: expenseName, amount: expenseAmount, date: incomeDate });
        renderExpenses();
        updateSummary();
        updateSuggestions();
        updateBalanceMeter();
        updateSpendingChart();
        renderCalendar();
    };

    // Function to render expenses
    const renderExpenses = () => {
        expensesList.innerHTML = '';
        expenses.forEach((expense, index) => {
            const expenseItem = document.createElement('div');
            expenseItem.classList.add('expense-item');
            expenseItem.innerHTML = `
                <span>${expense.name}: $${expense.amount.toFixed(2)}</span>
                <button data-index="${index}">Delete</button>
            `;
            expensesList.appendChild(expenseItem);

            // Add event listener to delete button
            expenseItem.querySelector('button').addEventListener('click', (e) => {
                const indexToDelete = parseInt(e.target.dataset.index);
                expenses.splice(indexToDelete, 1);
                renderExpenses();
                updateSummary();
                updateSuggestions();
                updateBalanceMeter();
                updateSpendingChart();
                renderCalendar();
            });
        });
    };

    // Function to update the financial summary
    const updateSummary = () => {
        income = parseFloat(incomeInput.value) || 0;
        incomeDate = incomeDateInput.value;
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingBalance = income - totalExpenses;

        summarySection.innerHTML = `
            <h2>Financial Summary</h2>
            <p>Income: $${income.toFixed(2)}</p>
            <p>Total Expenses: $${totalExpenses.toFixed(2)}</p>
            <p>Remaining Balance: $${remainingBalance.toFixed(2)}</p>
        `;
    };

    // Function to update savings summary
    const updateSavingsSummary = () => {
        savingsGoal = parseFloat(savingsGoalInput.value) || 0;
        targetDate = savingsTargetDateInput.value;

        if (savingsGoal && targetDate) {
            savingsSummary.innerHTML = `
                <h2>Savings Summary</h2>
                <p>Savings Goal: $${savingsGoal.toFixed(2)}</p>
                <p>Target Date: ${targetDate}</p>
                <p>Progress: Calculating...</p>
            `;
            // Add savings progress calculation here
            calculateSavingsProgress();
        } else {
            savingsSummary.innerHTML = '';
        }
    };

    // Function to calculate savings progress
    const calculateSavingsProgress = () => {
        const income = parseFloat(incomeInput.value) || 0;
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingBalance = income - totalExpenses;
        const savings = remainingBalance; // Simplified savings calculation

        const savingsSummaryElement = document.getElementById('savings-summary');
        if (savingsSummaryElement) {
            savingsSummaryElement.innerHTML = `
                <h2>Savings Summary</h2>
                <p>Savings Goal: $${savingsGoal.toFixed(2)}</p>
                <p>Target Date: ${targetDate}</p>
                <p>Current Savings: $${savings.toFixed(2)}</p>
                <p>Progress: ${((savings / savingsGoal) * 100).toFixed(2)}%</p>
            `;
        }
    };

    // Function to generate suggestions
    const updateSuggestions = () => {
        const income = parseFloat(incomeInput.value) || 0;
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingBalance = income - totalExpenses;

        let suggestionsHTML = '<h2>Suggestions</h2>';
        if (remainingBalance < 0) {
            suggestionsHTML += '<p>Consider reducing expenses or finding additional income sources.</p>';
        } else if (remainingBalance > 500) {
            suggestionsHTML += '<p>You have a healthy balance. Consider saving or investing.</p>';
        } else {
            suggestionsHTML += '<p>Keep up the good work!</p>';
        }

        if (savingsGoal && targetDate) {
            const savings = remainingBalance;
            if (savings < savingsGoal * 0.25) {
                suggestionsHTML += '<p>Consider increasing your savings contributions.</p>';
            }
        }

        suggestionsSection.innerHTML = suggestionsHTML;
    };

    // Function to render the calendar
    const renderCalendar = () => {
        calendar.innerHTML = '';
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

        // Add empty days for the beginning of the month
        for (let i = 0; i < startingDay; i++) {
            const dayElement = document.createElement('div');
            calendar.appendChild(dayElement);
        }

        // Add days for the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;

            // Color-code the day based on spending
            const spendingAmount = calculateDailySpending(day);
            if (spendingAmount === 0) {
                dayElement.classList.add('low-spending');
            } else if (spendingAmount <= 50) {
                dayElement.classList.add('moderate-spending');
            } else {
                dayElement.classList.add('high-spending');
            }

            calendar.appendChild(dayElement);
        }
    };

    // Function to calculate daily spending
    const calculateDailySpending = (day) => {
        const expensesForDay = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getDate() === day && expenseDate.getMonth() === currentMonth.getMonth() && expenseDate.getFullYear() === currentMonth.getFullYear();
        });
        return expensesForDay.reduce((sum, expense) => sum + expense.amount, 0);
    };

    // Function to update the spending chart
    const updateSpendingChart = () => {
        // Group expenses by category (for a more detailed chart, you'd categorize expenses)
        const categoryExpenses = {};
        expenses.forEach(expense => {
            const category = expense.name; // Assuming expense name is the category
            categoryExpenses[category] = (categoryExpenses[category] || 0) + expense.amount;
        });

        const categories = Object.keys(categoryExpenses);
        const amounts = Object.values(categoryExpenses);

        // Create or update the chart
        if (window.spendingChart) {
            window.spendingChart.data.labels = categories;
            window.spendingChart.data.datasets[0].data = amounts;
            window.spendingChart.update();
        } else {
            const ctx = spendingChartCanvas.getContext('2d');
            window.spendingChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: categories,
                    datasets: [{
                        data: amounts,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                        ],
                        borderColor: 'rgba(255, 255, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Spending by Category'
                        }
                    }
                }
            });
        }
    };

    // Event listeners
    addExpenseButton.addEventListener('click', addExpense);
    incomeInput.addEventListener('input', () => {
        updateSummary();
        updateBalanceMeter();
        updateSuggestions();
    });
    incomeDateInput.addEventListener('input', () => {
        updateSummary();
        updateBalanceMeter();
    });
    savingsGoalInput.addEventListener('input', updateSavingsSummary);
    savingsTargetDateInput.addEventListener('input', updateSavingsSummary);

    // Initial render
    updateSummary();
    updateSavingsSummary();
    updateSuggestions();
    updateBalanceMeter();
    renderCalendar();
    updateSpendingChart();
});

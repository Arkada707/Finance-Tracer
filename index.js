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

    // Initialize data
    let expenses = [];
    let savingsGoal = 0;
    let targetDate = null;
    let income = 0;
    let incomeDate = null;

    // Function to add an expense
    const addExpense = () => {
        const expenseName = prompt('Enter expense name:');
        if (!expenseName) return;
        const expenseAmount = parseFloat(prompt('Enter expense amount:'));
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            alert('Please enter a valid expense amount.');
            return;
        }

        expenses.push({ name: expenseName, amount: expenseAmount });
        renderExpenses();
        updateSummary();
        updateSuggestions();
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

    // Event listeners
    addExpenseButton.addEventListener('click', addExpense);
    incomeInput.addEventListener('input', updateSummary);
    incomeDateInput.addEventListener('input', updateSummary);
    savingsGoalInput.addEventListener('input', updateSavingsSummary);
    savingsTargetDateInput.addEventListener('input', updateSavingsSummary);

    // Initial render
    updateSummary();
    updateSavingsSummary();
    updateSuggestions();
});

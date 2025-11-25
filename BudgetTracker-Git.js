import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, Plus, Trash2, Menu, X } from 'lucide-react';

export default function BudgetTracker() {
  const [currentPage, setCurrentPage] = useState('home');
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await window.storage.get('budget-entries');
      if (result && result.value) {
        setEntries(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing data found');
    }
  };

  const saveData = async (newEntries) => {
    try {
      await window.storage.set('budget-entries', JSON.stringify(newEntries));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    
    if (!validateForm()) {
      return;
    }

    const newEntry = {
      id: Date.now(),
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date
    };

    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    saveData(newEntries);

    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    setEntries(newEntries);
    saveData(newEntries);
  };

  const calculateTotals = () => {
    const income = entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const expenses = entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const getCategoryTotals = () => {
    const categoryMap = {};
    
    entries.forEach(entry => {
      if (!categoryMap[entry.category]) {
        categoryMap[entry.category] = { income: 0, expense: 0 };
      }
      
      if (entry.type === 'income') {
        categoryMap[entry.category].income += entry.amount;
      } else {
        categoryMap[entry.category].expense += entry.amount;
      }
    });
    
    return categoryMap;
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totals = calculateTotals();
  const categoryTotals = getCategoryTotals();

  const Navigation = () => (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-8 h-8" />
            <span className="text-xl font-bold">Budget Tracker</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'home' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('tracker')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'tracker' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Budget Tracker
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'reports' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Reports
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                setCurrentPage('home');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'home' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentPage('tracker');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'tracker' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Budget Tracker
            </button>
            <button
              onClick={() => {
                setCurrentPage('reports');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'reports' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Reports
            </button>
          </div>
        )}
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Budget Tracker</h1>
        <p className="text-lg text-gray-600 mb-6">
          Take control of your finances with our easy-to-use budget tracking system
        </p>
        <button
          onClick={() => setCurrentPage('tracker')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Start Tracking</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">Total Income</h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${totals.income.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">Total Expenses</h3>
            <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${totals.expenses.toFixed(2)}</p>
        </div>

        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
          totals.balance >= 0 ? 'border-blue-500' : 'border-orange-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">Balance</h3>
            <DollarSign className={`w-6 h-6 ${
              totals.balance >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`} />
          </div>
          <p className={`text-3xl font-bold ${
            totals.balance >= 0 ? 'text-gray-800' : 'text-orange-600'
          }`}>
            ${totals.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Track Income & Expenses</h3>
            <p className="text-gray-600">Log all your financial transactions with detailed categorization</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📈 View Reports</h3>
            <p className="text-gray-600">Analyze your spending patterns with category breakdowns</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">💾 Export Data</h3>
            <p className="text-gray-600">Download your budget data as JSON for backup or analysis</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📱 Responsive Design</h3>
            <p className="text-gray-600">Access your budget from any device, anywhere</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TrackerPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Transaction</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Groceries, Salary"
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of the transaction"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h2>
        
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet. Add your first transaction above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{entry.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{entry.category}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.description}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const ReportsPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">Total Income</h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${totals.income.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">Total Expenses</h3>
            <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${totals.expenses.toFixed(2)}</p>
        </div>

        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
          totals.balance >= 0 ? 'border-blue-500' : 'border-orange-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-semibold">Net Balance</h3>
            <DollarSign className={`w-6 h-6 ${
              totals.balance >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`} />
          </div>
          <p className={`text-3xl font-bold ${
            totals.balance >= 0 ? 'text-gray-800' : 'text-orange-600'
          }`}>
            ${totals.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800">Category Breakdown</h2>
          <button
            onClick={exportToJSON}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export to JSON</span>
          </button>
        </div>

        {Object.keys(categoryTotals).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available. Start adding transactions!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Income</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Expenses</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryTotals).map(([category, amounts]) => (
                  <tr key={category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{category}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ${amounts.income.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      ${amounts.expense.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      (amounts.income - amounts.expense) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${(amounts.income - amounts.expense).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-800">{entries.length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 mb-1">Categories Tracked</p>
            <p className="text-2xl font-bold text-gray-800">{Object.keys(categoryTotals).length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 mb-1">Average Transaction</p>
            <p className="text-2xl font-bold text-gray-800">
              ${entries.length > 0 ? ((totals.income + totals.expenses) / entries.length).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 mb-1">Savings Rate</p>
            <p className="text-2xl font-bold text-gray-800">
              {totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'tracker' && <TrackerPage />}
        {currentPage === 'reports' && <ReportsPage />}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2024 Budget Tracker | Web Development Project</p>
          <p className="text-xs text-gray-400 mt-2">Built with React, Tailwind CSS, and persistent storage</p>
        </div>
      </footer>
    </div>
  );
}
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  loadCollection,
  saveCollection,
  loadSetting,
  saveSetting
} from './database';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  PiggyBank, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Accessibility, 
  Eye, 
  Activity, 
  Volume2,
  VolumeX, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Utensils, 
  Car, 
  Zap, 
  Film, 
  HeartPulse, 
  Briefcase, 
  PlusCircle, 
  MinusCircle
} from 'lucide-react';

// --- ANIMATED NUMBER COUNTER HOOK ---
function useAnimatedNumber(targetValue, duration = 800, disabled = false) {
  const [current, setCurrent] = useState(targetValue);

  useEffect(() => {
    if (disabled) {
      setCurrent(targetValue);
      return;
    }

    let startTimestamp = null;
    const startValue = current;
    const change = targetValue - startValue;

    if (Math.abs(change) < 0.01) {
      setCurrent(targetValue);
      return;
    }

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 2);
      setCurrent(startValue + change * easeOut);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration, disabled]);

  return current;
}

// --- INITIAL MOCK DATA & CONSTANTS ---
const CATEGORIES = ['Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Health', 'Income'];

function CategoryIcon({ category, className = "w-4 h-4" }) {
  switch (category) {
    case 'Food & Dining':
      return <Utensils className={className} />;
    case 'Transportation':
      return <Car className={className} />;
    case 'Utilities':
      return <Zap className={className} />;
    case 'Entertainment':
      return <Film className={className} />;
    case 'Health':
      return <HeartPulse className={className} />;
    case 'Income':
      return <Briefcase className={className} />;
    default:
      return <DollarSign className={className} />;
  }
}

const INITIAL_TRANSACTIONS = [
  { id: 1, description: 'Organic Grocery Market', amount: 84.50, category: 'Food & Dining', type: 'expense', date: '2026-03-28', note: 'Weekly produce & pantry items' },
  { id: 2, description: 'Metro Travel Pass', amount: 60.00, category: 'Transportation', type: 'expense', date: '2026-03-27', note: 'Monthly subway refill' },
  { id: 3, description: 'Client Consulting Retainer', amount: 1250.00, category: 'Income', type: 'income', date: '2026-03-25', note: 'Q1 UI Audits' },
  { id: 4, description: 'Electric Power Bill', amount: 95.20, category: 'Utilities', type: 'expense', date: '2026-03-22', note: 'Seasonal heating' },
  { id: 5, description: 'Cinema & Snack Package', amount: 28.99, category: 'Entertainment', type: 'expense', date: '2026-03-20', note: 'Weekend movie ticket' }
];

const INITIAL_BUDGETS = [
  { id: 1, category: 'Food & Dining', limit: 350 },
  { id: 2, category: 'Transportation', limit: 120 },
  { id: 3, category: 'Utilities', limit: 150 },
  { id: 4, category: 'Entertainment', limit: 100 },
  { id: 5, category: 'Health', limit: 80 }
];

const INITIAL_SAVINGS_GOALS = [
  { id: 1, title: 'MacBook Pro M3', current: 1450, target: 2200, category: 'Tech', targetDate: '2026-06-30' },
  { id: 2, title: 'Emergency Reserve', current: 3200, target: 5000, category: 'Safety', targetDate: '2026-12-31' },
  { id: 3, title: 'Summer Travel Fund', current: 650, target: 1500, category: 'Travel', targetDate: '2026-08-15' }
];

export default function App() {
  // Navigation & Core State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState(INITIAL_SAVINGS_GOALS);
  const [toast, setToast] = useState(null);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  // Appearance Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Accessibility & Visual Preferences
  const [isA11yMenuOpen, setIsA11yMenuOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showVisualLabels, setShowVisualLabels] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadDatabase = async () => {
      try {
        const [
          storedTransactions,
          storedBudgets,
          storedSavingsGoals,
          isInitialized,
          storedDarkMode,
          storedHighContrast,
          storedFontSize,
          storedReduceMotion,
          storedShowVisualLabels
        ] = await Promise.all([
          loadCollection('transactions'),
          loadCollection('budgets'),
          loadCollection('savingsGoals'),
          loadSetting('initialized'),
          loadSetting('darkMode'),
          loadSetting('highContrast'),
          loadSetting('fontSize'),
          loadSetting('reduceMotion'),
          loadSetting('showVisualLabels')
        ]);

        if (cancelled) return;

        if (!isInitialized) {
          await Promise.all([
            saveCollection('transactions', INITIAL_TRANSACTIONS),
            saveCollection('budgets', INITIAL_BUDGETS),
            saveCollection('savingsGoals', INITIAL_SAVINGS_GOALS),
            saveSetting('initialized', true)
          ]);
        } else {
          setTransactions(storedTransactions);
          setBudgets(storedBudgets);
          setSavingsGoals(storedSavingsGoals);
        }

        if (typeof storedDarkMode === 'boolean') setDarkMode(storedDarkMode);
        if (typeof storedHighContrast === 'boolean') setHighContrast(storedHighContrast);
        if (storedFontSize) setFontSize(storedFontSize);
        if (typeof storedReduceMotion === 'boolean') setReduceMotion(storedReduceMotion);
        if (typeof storedShowVisualLabels === 'boolean') setShowVisualLabels(storedShowVisualLabels);
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('Failed to load EcoBudget database:', error);
        setToast({ message: 'Could not load saved data', type: 'error' });
        setIsDatabaseReady(true);
      }
    };

    loadDatabase();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDatabaseReady) return;
    saveCollection('transactions', transactions).catch((error) =>
      console.error('Failed to save transactions:', error)
    );
  }, [transactions, isDatabaseReady]);

  useEffect(() => {
    if (!isDatabaseReady) return;
    saveCollection('budgets', budgets).catch((error) =>
      console.error('Failed to save budgets:', error)
    );
  }, [budgets, isDatabaseReady]);

  useEffect(() => {
    if (!isDatabaseReady) return;
    saveCollection('savingsGoals', savingsGoals).catch((error) =>
      console.error('Failed to save savings goals:', error)
    );
  }, [savingsGoals, isDatabaseReady]);

  useEffect(() => {
    if (!isDatabaseReady) return;
    Promise.all([
      saveSetting('darkMode', darkMode),
      saveSetting('highContrast', highContrast),
      saveSetting('fontSize', fontSize),
      saveSetting('reduceMotion', reduceMotion),
      saveSetting('showVisualLabels', showVisualLabels)
    ]).catch((error) => console.error('Failed to save preferences:', error));
  }, [
    darkMode,
    highContrast,
    fontSize,
    reduceMotion,
    showVisualLabels,
    isDatabaseReady
  ]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Modals & Action States
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTxId, setDeletingTxId] = useState(null);
  
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [transferGoal, setTransferGoal] = useState(null);
  const [transferType, setTransferType] = useState('deposit');
  const [transferAmount, setTransferAmount] = useState('');

  // Dynamic Toast Notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Pre-load voices cleanly across all browsers
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Sliding Apple Nav Indicator
  const navContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Update sliding indicator position
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeEl = navContainerRef.current.querySelector(`[data-tab="${activeTab}"]`);
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1
      });
    }
  }, [activeTab]);

  // Text-to-speech is controlled only by the page reader button.
  const speakText = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel(); // Stop current queue

      // Format text for natural pronunciation
      const cleanText = text
        .replace(/\$/g, ' dollars ')
        .replace(/(\d+)\.(\d{2})/g, '$1 dollars and $2 cents');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-GB';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const englishVoices = voices.filter(v =>
          v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('en')
        );
        const preferredVoice =
          englishVoices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith('en-gb')) ||
          englishVoices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith('en-us')) ||
          englishVoices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn("Speech error:", e);
        setIsSpeaking(false);
      };

      // Force resume audio context if browser paused speech
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis exception:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getPageSpeechSummary = () => {
    if (activeTab === 'transactions') {
      const transactionList = filteredTransactions
        .slice(0, 10)
        .map((transaction) => `${transaction.description}, ${transaction.category}, ${transaction.amount.toFixed(2)} dollars`)
        .join('. ');
      return `Transactions page. ${filteredTransactions.length} transactions found. ${transactionList || 'No transactions found.'}`;
    }

    if (activeTab === 'budget') {
      const budgetList = budgets
        .map((budget) => {
          const spent = transactions
            .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
          return `${budget.category}: ${spent.toFixed(2)} dollars spent of ${budget.limit.toFixed(2)} dollars`;
        })
        .join('. ');
      return `Budget Manager page. ${budgetList}`;
    }

    if (activeTab === 'savings') {
      const goalList = savingsGoals
        .map((goal) => `${goal.title}: ${goal.current.toFixed(2)} dollars saved of ${goal.target.toFixed(2)} dollars`)
        .join('. ');
      return `Savings Goals page. ${goalList || 'No savings goals found.'}`;
    }

    return `EcoBudget Financial Summary. Total Balance is ${metrics.totalBalance.toFixed(2)} dollars. Monthly spending is ${metrics.totalExpense.toFixed(2)} dollars. Total savings goals total ${metrics.totalSaved.toFixed(2)} dollars. Your budget health index is ${metrics.healthIndex} out of 100.`;
  };

  const togglePageReader = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    speakText(getPageSpeechSummary());
  };

  const handleTabSwitch = (tabId, tabName) => {
    setActiveTab(tabId);
    if (isSpeaking) stopSpeaking();
  };

  // --- DERIVED METRICS ---
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current, 0);
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);

    const spentInBudgetCategories = transactions
      .filter(t => t.type === 'expense' && budgets.some(b => b.category === t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const healthIndex = Math.max(0, Math.min(100, Math.round(100 - (spentInBudgetCategories / (totalBudgetLimit || 1)) * 100)));

    return {
      totalIncome,
      totalExpense,
      totalBalance,
      totalSaved,
      totalBudgetLimit,
      spentInBudgetCategories,
      healthIndex
    };
  }, [transactions, budgets, savingsGoals]);

  const animBalance = useAnimatedNumber(metrics.totalBalance, 800, reduceMotion);
  const animExpense = useAnimatedNumber(metrics.totalExpense, 800, reduceMotion);
  const animSaved = useAnimatedNumber(metrics.totalSaved, 800, reduceMotion);
  const animHealth = useAnimatedNumber(metrics.healthIndex, 800, reduceMotion);

  // Action Handlers
  const handleSaveTransaction = (txData) => {
    if (editingTx) {
      setTransactions(transactions.map(t => t.id === editingTx.id ? { ...t, ...txData } : t));
      showToast('Transaction updated');
    } else {
      const newTx = { id: Date.now(), ...txData };
      setTransactions([newTx, ...transactions]);
      showToast('New transaction added');
    }
    setIsAddTxModalOpen(false);
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setDeletingTxId(null);
    showToast('Transaction removed', 'info');
  };

  const handleUpdateBudget = (id, newLimit) => {
    const val = parseFloat(newLimit) || 0;
    setBudgets(budgets.map(b => b.id === id ? { ...b, limit: val } : b));
    showToast('Budget updated');
  };

  const handleCreateGoal = (goalData) => {
    const newGoal = { id: Date.now(), current: 0, ...goalData };
    setSavingsGoals([...savingsGoals, newGoal]);
    setIsAddGoalModalOpen(false);
    showToast('Savings goal created');
  };

  const handleGoalTransferSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || !transferGoal) return;

    setSavingsGoals(savingsGoals.map(g => {
      if (g.id === transferGoal.id) {
        const updated = transferType === 'deposit' ? g.current + amt : Math.max(0, g.current - amt);
        return { ...g, current: updated };
      }
      return g;
    }));

    showToast(`${transferType === 'deposit' ? 'Deposited' : 'Withdrew'} $${amt.toFixed(2)} for ${transferGoal.title}`);
    setTransferGoal(null);
    setTransferAmount('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesType = selectedType === 'All' || t.type === selectedType;
      return matchesSearch && matchesCat && matchesType;
    });
  }, [transactions, searchQuery, selectedCategory, selectedType]);

  const fontClass = fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';

  const cardClass = highContrast
    ? (darkMode ? 'bg-black border-2 border-yellow-400 text-white' : 'bg-white border-2 border-black text-black shadow-none')
    : (darkMode ? 'bg-[#2C2C2E] border border-[#3A3A3C] shadow-sm text-[#F2F2F7]' : 'bg-white border border-[#E5E5EA] shadow-sm text-[#1C1C1E]');

  const headerClass = highContrast
    ? (darkMode ? 'bg-black border-b-2 border-yellow-400 text-white' : 'bg-white border-b-2 border-black text-black')
    : (darkMode ? 'bg-[#1C1C1E]/90 border-b border-[#3A3A3C] backdrop-blur-md text-white' : 'bg-[#F5F5F7]/90 border-b border-[#E5E5EA] backdrop-blur-md text-[#1C1C1E]');

  return (
    <div className={`min-h-screen transition-colors ${reduceMotion ? '' : 'duration-300'} ${darkMode ? 'bg-[#1C1C1E] text-[#F2F2F7]' : 'bg-[#F5F5F7] text-[#1C1C1E]'} ${fontClass}`}>
      
      {/* Toast Notification */}
      {toast && (
        <div 
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-medium border ${
            toast.type === 'info' 
              ? 'bg-[#007AFF] text-white border-blue-400' 
              : 'bg-[#34C759] text-white border-green-400'
          } ${reduceMotion ? '' : 'animate-bounce'}`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Persistent Navigation Bar */}
      <header className={`sticky top-0 z-40 px-4 lg:px-8 py-3 ${headerClass}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#007AFF] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                🌱
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight leading-none">EcoBudget</h1>
                <p className="text-xs opacity-60">Smart HCI Financial Manager</p>
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={togglePageReader}
                className={`p-2 rounded-lg ${isSpeaking ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                aria-label={isSpeaking ? 'Stop page reader' : 'Read page aloud'}
                title={isSpeaking ? 'Stop reading' : 'Read page aloud'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsA11yMenuOpen(!isA11yMenuOpen)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
                aria-label="Accessibility Settings"
              >
                <Accessibility className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav 
            ref={navContainerRef}
            className={`relative flex items-center p-1 rounded-xl gap-1 overflow-x-auto ${
              darkMode ? 'bg-[#2C2C2E]' : 'bg-[#E5E5EA]'
            }`}
          >
            <div
              className={`absolute top-1 bottom-1 rounded-lg transition-all ${
                reduceMotion ? 'duration-0' : 'duration-300 ease-out'
              } ${darkMode ? 'bg-[#3A3A3C]' : 'bg-white shadow-sm'}`}
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity
              }}
            />

            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'transactions', label: 'Transactions', icon: Receipt },
              { id: 'budget', label: 'Budget Manager', icon: PieChart },
              { id: 'savings', label: 'Savings Goals', icon: PiggyBank }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => handleTabSwitch(tab.id, tab.label)}
                  className={`relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                    isActive
                      ? (darkMode ? 'text-white' : 'text-[#1C1C1E]')
                      : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black')
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={togglePageReader}
              className={`p-2.5 rounded-xl border transition-all ${
                isSpeaking
                  ? 'bg-red-600 text-white border-red-500'
                  : (darkMode ? 'bg-[#2C2C2E] border-[#3A3A3C] text-[#F2F2F7]' : 'bg-white border-[#E5E5EA] text-gray-700')
              }`}
              aria-label={isSpeaking ? 'Stop page reader' : 'Read page aloud'}
              title={isSpeaking ? 'Stop reading' : 'Read page aloud'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                darkMode ? 'bg-[#2C2C2E] border-[#3A3A3C] text-yellow-400' : 'bg-white border-[#E5E5EA] text-gray-700'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsA11yMenuOpen(!isA11yMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all font-medium ${
                isA11yMenuOpen
                  ? 'bg-[#007AFF] text-white border-blue-500'
                  : (darkMode ? 'bg-[#2C2C2E] border-[#3A3A3C]' : 'bg-white border-[#E5E5EA]')
              }`}
            >
              <Accessibility className="w-4 h-4" />
              <span>A11y Panel</span>
            </button>
          </div>

        </div>

        {isA11yMenuOpen && (
          <div className={`mt-3 p-4 rounded-2xl max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 ${cardClass}`}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Visual Contrast</label>
              <button
                onClick={() => {
                  const val = !highContrast;
                  setHighContrast(val);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-medium transition-colors ${
                  highContrast 
                    ? 'bg-black text-yellow-400 border-yellow-400' 
                    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#3A3A3C] dark:text-[#F2F2F7] dark:border-[#48484A] hover:bg-gray-200 dark:hover:bg-[#48484A]'
                }`}
              >
                <span>High Contrast</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Font Sizing</label>
              <div className="flex gap-1">
                {['normal', 'large', 'xlarge'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => {
                      setFontSize(sz);
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold border text-xs capitalize transition-colors ${
                      fontSize === sz 
                        ? 'bg-[#007AFF] text-white border-blue-600' 
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#3A3A3C] dark:text-[#F2F2F7] dark:border-[#48484A] hover:bg-gray-200 dark:hover:bg-[#48484A]'
                    }`}
                  >
                    {sz === 'normal' ? '1x' : sz === 'large' ? '1.25x' : '1.5x'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Motion Sensitivity</label>
              <button
                onClick={() => {
                  const val = !reduceMotion;
                  setReduceMotion(val);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-medium transition-colors ${
                  reduceMotion 
                    ? 'bg-purple-600 text-white border-purple-400' 
                    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#3A3A3C] dark:text-[#F2F2F7] dark:border-[#48484A] hover:bg-gray-200 dark:hover:bg-[#48484A]'
                }`}
              >
                <span>Reduce Motion</span>
                <Activity className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">Visual Data Badges</label>
              <button
                onClick={() => {
                  const val = !showVisualLabels;
                  setShowVisualLabels(val);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-medium transition-colors ${
                  showVisualLabels 
                    ? 'bg-green-600 text-white border-green-400' 
                    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#3A3A3C] dark:text-[#F2F2F7] dark:border-[#48484A] hover:bg-gray-200 dark:hover:bg-[#48484A]'
                }`}
              >
                <span>Visual Text Tags</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </header>

      {/* Main Content View Switcher */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Overview Dashboard</h2>
                <p className="text-sm opacity-60">Real-time Financial Health Snapshot</p>
              </div>


                <button
                  onClick={() => {
                    setEditingTx(null);
                    setIsAddTxModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#007AFF] text-white font-semibold shadow-md hover:bg-blue-600 active:scale-95 transition-all min-h-[44px]"
                >
                  <Plus className="w-5 h-5" />
                  <span>Quick Add Transaction</span>
                </button>
              </div>

            <div 
              role="alert" 
              className={`p-4 rounded-2xl border flex items-start gap-4 ${
                darkMode ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">Unusual Spend Anomaly Detected</h3>
                  {showVisualLabels && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-white uppercase tracking-wider">
                      [ALERT: HIGH SPEND]
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5 opacity-90">
                  Food & Dining expenditure is <span className="font-bold text-amber-600 dark:text-amber-400">40% higher</span> than your 3-month average. Consider allocating from savings or lowering upcoming discretionary spending.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Total Balance</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-[#007AFF]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">
                  ${animBalance.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.4% vs last month</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Monthly Spending</span>
                  <div className="p-2 rounded-xl bg-red-500/10 text-[#FF3B30]">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">
                  ${animExpense.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-500 font-medium">
                  <TrendingDown className="w-4 h-4" />
                  <span>82% of total cap</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Total Savings</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-[#34C759]">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">
                  ${animSaved.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3 Active Reserve Goals</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Budget Health Index</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <PieChart className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">
                  {animHealth.toFixed(0)} / 100
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#3A3A3C] h-2 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-[#34C759] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, animHealth))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-6 rounded-2xl space-y-4 ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Recent Transactions</h3>
                    <p className="text-xs opacity-60">Latest 5 ledger entries</p>
                  </div>
                  <button
                    onClick={() => handleTabSwitch('transactions', 'Transactions')}
                    className="flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:underline"
                  >
                    <span>View All Ledger</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-[#3A3A3C]">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          tx.type === 'income' 
                            ? 'bg-emerald-500/10 text-[#34C759]' 
                            : 'bg-gray-100 dark:bg-[#3A3A3C] text-gray-700 dark:text-gray-200'
                        }`}>
                          <CategoryIcon category={tx.category} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{tx.description}</span>
                            {showVisualLabels && (
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                tx.type === 'income' ? 'bg-emerald-500/20 text-[#34C759]' : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                              }`}>
                                [{tx.type === 'income' ? 'INCOME' : 'EXPENSE'}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-50">{tx.category} • {tx.date}</p>
                        </div>
                      </div>

                      <div className={`font-extrabold text-sm ${
                        tx.type === 'income' ? 'text-emerald-500' : 'dark:text-gray-100 text-[#1C1C1E]'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-2xl space-y-4 ${cardClass}`}>
                <h3 className="font-bold text-lg">Category Budget Snapshot</h3>
                <p className="text-xs opacity-60">Limits vs Current Spend</p>

                <div className="space-y-4 pt-2">
                  {budgets.map(b => {
                    const spent = transactions
                      .filter(t => t.type === 'expense' && t.category === b.category)
                      .reduce((sum, t) => sum + t.amount, 0);

                    const ratio = Math.min(100, (spent / (b.limit || 1)) * 100);

                    let barColor = 'bg-[#34C759]';
                    let statusLabel = 'NORMAL';
                    if (ratio >= 90) {
                      barColor = 'bg-[#FF3B30]';
                      statusLabel = 'OVER BUDGET';
                    } else if (ratio >= 75) {
                      barColor = 'bg-amber-500';
                      statusLabel = 'WARNING';
                    }

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{b.category}</span>
                            {showVisualLabels && (
                              <span className={`px-1 py-0.2 text-[9px] font-extrabold rounded ${
                                ratio >= 90 ? 'bg-red-500 text-white' : ratio >= 75 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                              }`}>
                                [{statusLabel}]
                              </span>
                            )}
                          </div>
                          <span className="opacity-70">${spent.toFixed(0)} / ${b.limit}</span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-[#3A3A3C] h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS PAGE */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Transaction Ledger</h2>
                <p className="text-sm opacity-60">Full Searchable Ledger History</p>
              </div>

              <button
                onClick={() => {
                  setEditingTx(null);
                  setIsAddTxModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#007AFF] text-white font-semibold shadow-md hover:bg-blue-600 active:scale-95 transition-all min-h-[44px]"
              >
                <Plus className="w-5 h-5" />
                <span>Add Transaction</span>
              </button>
            </div>

            <div className={`p-4 rounded-2xl flex flex-col md:flex-row gap-4 ${cardClass}`}>
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search description or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm font-medium"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm font-medium"
                >
                  <option value="All">All Types</option>
                  <option value="expense">Expense Only</option>
                  <option value="income">Income Only</option>
                </select>
              </div>
            </div>

            <div className={`p-6 rounded-2xl overflow-x-auto ${cardClass}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#3A3A3C] text-xs font-bold uppercase tracking-wider opacity-60">
                    <th className="pb-3 px-3">Description</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3 text-right">Amount</th>
                    <th className="pb-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#3A3A3C]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm opacity-50">
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#3A3A3C]/40 transition-colors">
                        <td className="py-4 px-3">
                          <div className="font-semibold text-sm">{tx.description}</div>
                          {tx.note && <div className="text-xs opacity-50">{tx.note}</div>}
                        </td>
                        <td className="py-4 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#3A3A3C] text-gray-900 dark:text-gray-100 text-xs font-semibold">
                            <CategoryIcon category={tx.category} className="w-3.5 h-3.5" />
                            <span>{tx.category}</span>
                          </span>
                        </td>
                        <td className="py-4 px-3 text-xs opacity-70">{tx.date}</td>
                        <td className={`py-4 px-3 text-right font-black text-sm ${
                          tx.type === 'income' ? 'text-[#34C759]' : 'dark:text-white text-gray-900'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingTx(tx);
                                setIsAddTxModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-gray-500 hover:text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                              title="Edit Transaction"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTxId(tx.id)}
                              className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BUDGET MANAGER */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Monthly Budget Manager</h2>
              <p className="text-sm opacity-60">Set Spending Limits per Category</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map(b => {
                const spent = transactions
                  .filter(t => t.type === 'expense' && t.category === b.category)
                  .reduce((sum, t) => sum + t.amount, 0);

                const remaining = Math.max(0, b.limit - spent);
                const ratio = Math.min(100, (spent / (b.limit || 1)) * 100);

                let progressColor = 'bg-[#34C759]';
                let alertTag = 'NORMAL';
                if (ratio >= 90) {
                  progressColor = 'bg-[#FF3B30]';
                  alertTag = 'OVER BUDGET';
                } else if (ratio >= 75) {
                  progressColor = 'bg-amber-500';
                  alertTag = 'WARNING';
                }

                return (
                  <div key={b.id} className={`p-6 rounded-2xl space-y-4 ${cardClass}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                          <CategoryIcon category={b.category} className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base">{b.category}</h3>
                            {showVisualLabels && (
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                                ratio >= 90 ? 'bg-red-500 text-white' : ratio >= 75 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                              }`}>
                                [{alertTag}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-60">${remaining.toFixed(2)} remaining safe spend</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold">Limit: ${b.limit}</div>
                        <input
                          type="number"
                          defaultValue={b.limit}
                          onBlur={(e) => handleUpdateBudget(b.id, e.target.value)}
                          className="w-20 px-2 py-1 text-right text-xs rounded-lg border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-1 focus:ring-[#007AFF] mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold opacity-70">
                        <span>Spent: ${spent.toFixed(2)}</span>
                        <span>{ratio.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#3A3A3C] h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${progressColor} transition-all duration-500`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SAVINGS GOALS */}
        {activeTab === 'savings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Savings Goals</h2>
                <p className="text-sm opacity-60">Track Reserve Target Milestones</p>
              </div>

              <button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#007AFF] text-white font-semibold shadow-md hover:bg-blue-600 active:scale-95 transition-all min-h-[44px]"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savingsGoals.map(goal => {
                const ratio = Math.min(100, (goal.current / (goal.target || 1)) * 100);

                return (
                  <div key={goal.id} className={`p-6 rounded-2xl space-y-4 flex flex-col justify-between ${cardClass}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-[#007AFF]">
                          {goal.category}
                        </span>
                        <span className="text-xs opacity-60">Target: {goal.targetDate}</span>
                      </div>

                      <h3 className="font-bold text-lg">{goal.title}</h3>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Saved: ${goal.current.toFixed(2)}</span>
                          <span className="opacity-70">${goal.target.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-[#3A3A3C] h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#34C759] transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setTransferGoal(goal);
                          setTransferType('deposit');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#34C759] text-white font-bold text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Deposit</span>
                      </button>
                      <button
                        onClick={() => {
                          setTransferGoal(goal);
                          setTransferType('withdraw');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#3A3A3C] text-white dark:bg-[#3A3A3C] dark:text-white font-bold text-xs hover:bg-gray-700 transition-colors flex items-center justify-center gap-1 border border-gray-600 dark:border-gray-500"
                      >
                        <MinusCircle className="w-4 h-4" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* TRANSACTION EDIT/ADD MODAL */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl space-y-4 ${cardClass}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{editingTx ? 'Edit Transaction' : 'Quick Add Transaction'}</h3>
              <button 
                onClick={() => setIsAddTxModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3A3C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveTransaction({
                description: formData.get('description'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                type: formData.get('type'),
                date: formData.get('date'),
                note: formData.get('note')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Description</label>
                <input
                  name="description"
                  required
                  defaultValue={editingTx ? editingTx.description : ''}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                  placeholder="e.g. Grocery Market"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Amount ($)</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingTx ? editingTx.amount : ''}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Type</label>
                  <select
                    name="type"
                    defaultValue={editingTx ? editingTx.type : 'expense'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] focus:ring-2 focus:ring-[#007AFF] text-sm font-medium"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Category</label>
                  <select
                    name="category"
                    defaultValue={editingTx ? editingTx.category : CATEGORIES[0]}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] focus:ring-2 focus:ring-[#007AFF] text-sm font-medium"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={editingTx ? editingTx.date : new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Note (Optional)</label>
                <input
                  name="note"
                  defaultValue={editingTx ? editingTx.note : ''}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                  placeholder="Additional context..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-[#3A3A3C] bg-gray-100 dark:bg-[#3A3A3C] text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#48484A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#007AFF] text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl space-y-4 ${cardClass}`}>
            <h3 className="font-bold text-lg text-red-500">Confirm Deletion</h3>
            <p className="text-sm opacity-80">Are you sure you want to remove this ledger entry? This action cannot be undone.</p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingTxId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-[#3A3A3C] bg-gray-100 dark:bg-[#3A3A3C] text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#48484A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransaction(deletingTxId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVINGS GOAL DEPOSIT/WITHDRAW MODAL */}
      {transferGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl space-y-4 ${cardClass}`}>
            <h3 className="font-bold text-lg capitalize">{transferType} for {transferGoal.title}</h3>
            <form onSubmit={handleGoalTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Transfer Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferGoal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-[#3A3A3C] bg-gray-100 dark:bg-[#3A3A3C] text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#48484A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#007AFF] text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SAVINGS GOAL MODAL */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl space-y-4 ${cardClass}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Create Savings Goal</h3>
              <button 
                onClick={() => setIsAddGoalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3A3C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCreateGoal({
                title: formData.get('title'),
                target: parseFloat(formData.get('target')),
                category: formData.get('category'),
                targetDate: formData.get('targetDate')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Goal Title</label>
                <input
                  name="title"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                  placeholder="e.g. New Laptop"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Target ($)</label>
                  <input
                    name="target"
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                    placeholder="1000.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Category</label>
                  <input
                    name="category"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                    placeholder="e.g. Tech, Travel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Target Date</label>
                <input
                  name="targetDate"
                  type="date"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#007AFF] text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-[#3A3A3C] bg-gray-100 dark:bg-[#3A3A3C] text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#48484A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#007AFF] text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
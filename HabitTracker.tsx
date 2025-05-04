"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from 'recharts';

// Add dark mode styles
const darkModeStyles = `
  :root {
    --bg-primary: #f9fafb;
    --bg-secondary: #ffffff;
    --text-primary: #1f2937;
    --text-secondary: #4b5563;
    --border-color: #e5e7eb;
    --card-bg: #ffffff;
    --card-border: #e5e7eb;
    --highlight: #3B82F6;
  }
  
  .dark-mode {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --border-color: #2a2a2a;
    --card-bg: #1e1e1e;
    --card-border: #2a2a2a;
  }
  
  body, .min-h-screen {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
  
  .bg-white {
    background-color: var(--card-bg) !important;
  }
  
  .text-gray-800 {
    color: var(--text-primary) !important;
  }
  
  .text-gray-600,
  .text-gray-500 {
    color: var(--text-secondary) !important;
  }
  
  .border-gray-100 {
    border-color: var(--border-color) !important;
  }
  
  .dark-mode .bg-gray-100 {
    background-color: #2a2a2a !important;
  }
`;

// Main component that wraps everything
const HabitTracker: React.FC = () => {
  // State for active view/page
  const [activeView, setActiveView] = useState<'dashboard' | 'habits' | 'stats' | 'settings'>('dashboard');
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for add habit modal
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  
  // State for habits
  const [habits, setHabits] = useState<HabitData[]>(habitData);
  
  // State for dark mode
  const [darkMode, setDarkMode] = useState(false);
  
  // State for user profile
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  });
  
  // Add style element to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = darkModeStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Apply dark mode class to root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  // Handle add habit button click
  const handleAddHabitClick = () => {
    setShowAddHabitModal(true);
  };
  
  // Handle add habit
  const handleAddHabit = (habit: { name: string; icon: string; target: number; unit: string; color: string }) => {
    const newHabit: HabitData = {
      id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
      name: habit.name,
      icon: habit.icon,
      target: habit.target,
      unit: habit.unit,
      currentStreak: 0,
      longestStreak: 0,
      frequency: 'daily',
      progress: [0, 0, 0, 0, 0, 0, 0], // Initialize with 7 days of data for charts
      color: habit.color
    };
    
    // Add the new habit to the state using functional update to ensure we're working with the latest state
    setHabits(prevHabits => [...prevHabits, newHabit]);
    
    // Close the modal
    setShowAddHabitModal(false);
    
    // Log for debugging
    console.log("Added new habit:", newHabit);
    console.log("Updated habits:", [...habits, newHabit]);
  };
  
  // Handle delete habit
  const handleDeleteHabit = (habitId: number) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };
  
  // Handle update progress
  const handleUpdateProgress = (habitId: number, value: number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const newProgress = [...habit.progress];
          newProgress[newProgress.length - 1] = value;
          const currentStreak = value >= habit.target ? habit.currentStreak + 1 : 0;
          const longestStreak = Math.max(currentStreak, habit.longestStreak);
          return { ...habit, progress: newProgress, currentStreak, longestStreak };
        }
        return habit;
      })
    );
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'dark-mode' : 'bg-gradient-to-br from-indigo-50 to-blue-50'} text-gray-800 font-sans`}>
      {/* Navbar */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userProfile={userProfile}
      />
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        {activeView === 'dashboard' && (
          <Dashboard 
            onAddHabitClick={handleAddHabitClick} 
            habits={habits}
            handleUpdateProgress={handleUpdateProgress}
            setActiveView={setActiveView}
            userProfile={userProfile}
          />
        )}
        {activeView === 'habits' && (
          <HabitsView 
            habits={habits} 
            handleAddHabit={handleAddHabit}
            handleDeleteHabit={handleDeleteHabit}
            handleUpdateProgress={handleUpdateProgress}
          />
        )}
        {activeView === 'stats' && <StatsView habits={habits} />}
        {activeView === 'settings' && (
          <SettingsView 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Global Add Habit Modal */}
      <AnimatePresence>
        {showAddHabitModal && (
          <AddHabitModal onClose={() => setShowAddHabitModal(false)} handleAddHabit={handleAddHabit} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Add Habit Modal Component
interface AddHabitModalProps {
  onClose: () => void;
  handleAddHabit: (habit: { name: string; icon: string; target: number; unit: string; color: string }) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, handleAddHabit }) => {
  const [habitName, setHabitName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💧');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddHabit({ name: habitName, icon: selectedIcon, target: parseInt(target), unit, color: selectedColor });
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Add New Habit</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Drink Water"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 8"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., glasses"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {['💧', '🏃‍♂️', '📚', '🧘‍♀️', '😴', '🍎', '💪', '🧠', '🎯', '🎨', '🎵', '🌱'].map((icon) => (
                <motion.button
                  key={icon}
                  type="button"
                  className={`h-10 w-10 flex items-center justify-center border ${
                    selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } rounded-lg text-xl`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'].map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Habit
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Navbar Component
interface NavbarProps {
  activeView: 'dashboard' | 'habits' | 'stats' | 'settings';
  setActiveView: React.Dispatch<React.SetStateAction<'dashboard' | 'habits' | 'stats' | 'settings'>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeView, 
  setActiveView, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  userProfile
}) => {
  // Function to handle profile click and navigate to settings
  const handleProfileClick = () => {
    setActiveView('settings');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-blue-600">HabitTracker</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'habits' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveView('habits')}
            >
              Habits
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'stats' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveView('stats')}
            >
              Stats
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'settings' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setActiveView('settings')}
            >
              Settings
            </button>
          </div>
          
          {/* User profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
              <img 
                src={userProfile.avatar} 
                alt="User" 
                className="h-10 w-10 rounded-full object-cover cursor-pointer"
                onClick={handleProfileClick}
              />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-2">
              {['dashboard', 'habits', 'stats', 'settings'].map((view) => (
                <motion.button
                  key={view}
                  onClick={() => {
                    setActiveView(view as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-3 px-2 capitalize ${
                    activeView === view 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-500'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {view}
                </motion.button>
              ))}
              
              <div className="flex items-center space-x-3 py-3 px-2 border-t mt-2">
                <img 
                  src={userProfile.avatar} 
                  alt="User" 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">{userProfile.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HabitTrack</span>
          </div>
          
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
          
          <div className="text-sm text-gray-500">
            {new Date().getFullYear()} HabitTrack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

// Mock data for habits
type HabitData = {
  id: number;
  name: string;
  icon: string;
  target: number;
  unit: string;
  currentStreak: number;
  longestStreak: number;
  frequency: string;
  progress: number[];
  color: string;
};

const habitData: HabitData[] = [
  { id: 1, name: 'Drink Water', icon: '💧', target: 8, unit: 'glasses', currentStreak: 5, longestStreak: 14, frequency: 'daily', progress: [5, 7, 8, 6, 8, 7, 5], color: '#3B82F6' },
  { id: 2, name: 'Exercise', icon: '🏃‍♂️', target: 30, unit: 'minutes', currentStreak: 3, longestStreak: 10, frequency: 'daily', progress: [20, 30, 45, 30, 0, 30, 15], color: '#EF4444' },
  { id: 3, name: 'Read', icon: '📚', target: 20, unit: 'pages', currentStreak: 7, longestStreak: 21, frequency: 'daily', progress: [15, 20, 30, 20, 25, 20, 10], color: '#10B981' },
  { id: 4, name: 'Meditate', icon: '🧘‍♀️', target: 10, unit: 'minutes', currentStreak: 2, longestStreak: 8, frequency: 'daily', progress: [5, 10, 10, 0, 0, 5, 10], color: '#8B5CF6' },
  { id: 5, name: 'Sleep', icon: '😴', target: 8, unit: 'hours', currentStreak: 4, longestStreak: 12, frequency: 'daily', progress: [7, 8, 6.5, 7, 8, 7.5, 7], color: '#EC4899' },
];

// Daily Progress Component
interface DailyProgressProps {
  habits: HabitData[];
  handleUpdateProgress: (habitId: number, value: number) => void;
}

const DailyProgress: React.FC<DailyProgressProps> = ({ habits, handleUpdateProgress }) => {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  // State for selected habit details
  const [selectedHabit, setSelectedHabit] = useState<HabitData | null>(null);
  const [showHabitDetails, setShowHabitDetails] = useState(false);
  
  // Function to handle check-in for a habit
  const handleCheckIn = (habitId: number) => {
    // Get the current progress value
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      // Increment the progress value (in a real app, this would be a user-entered value)
      const currentProgress = habit.progress[habit.progress.length - 1];
      const newValue = Math.min(currentProgress + 1, habit.target);
      handleUpdateProgress(habitId, newValue);
      alert(`Successfully checked in for ${habit.name}. Progress: ${newValue}/${habit.target} ${habit.unit}`);
    }
  };
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Todays Progress</h2>
        <p className="text-sm text-gray-500">{dayName}, {dateString}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {habits.slice(0, 3).map((habit) => (
          <motion.div
            key={habit.id}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{habit.icon}</div>
                <h3 className="font-semibold text-gray-800">{habit.name}</h3>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                {habit.currentStreak} day streak
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">
                  {habit.progress[habit.progress.length - 1]} / {habit.target} {habit.unit}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: habit.color,
                    width: `${(habit.progress[habit.progress.length - 1] / habit.target) * 100}%` 
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(habit.progress[habit.progress.length - 1] / habit.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <motion.button
                className="text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedHabit(habit);
                  setShowHabitDetails(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Details
              </motion.button>
              
              <motion.button
                className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCheckIn(habit.id)}
              >
                Check In
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
      {showHabitDetails && selectedHabit && (
        <HabitDetailsModal 
          habit={selectedHabit} 
          onClose={() => setShowHabitDetails(false)} 
          handleUpdateProgress={handleUpdateProgress}
        />
      )}
    </section>
  );
};

// Habit Overview Component
interface HabitOverviewProps {
  habits: HabitData[];
  setActiveView?: React.Dispatch<React.SetStateAction<'dashboard' | 'habits' | 'stats' | 'settings'>>;
}

const HabitOverview: React.FC<HabitOverviewProps> = ({ habits, setActiveView }) => {
  // Access the main component's state to change the active view
  const navigateToHabits = () => {
    if (setActiveView) {
      setActiveView('habits');
    } else {
      // Fallback if setActiveView is not provided
      alert("Navigating to All Habits view");
    }
  };
  
  // Generate weekly data from habits
  const habitWeeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const data: { [key: string]: any } = { day };
      
      // Add data for each habit (up to 3)
      habits.slice(0, 3).forEach(habit => {
        data[habit.name] = habit.progress[index];
      });
      
      return data;
    });
  }, [habits]);
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Habit Overview</h2>
        <motion.button
          className="text-sm font-medium text-blue-600 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToHabits}
        >
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Weekly Progress Chart */}
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Weekly Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={habitWeeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem',
                      border: '1px solid #f3f4f6',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} 
                  />
                  <Legend />
                  {habits.slice(0, 3).map((habit, index) => (
                    <Line 
                      key={habit.name} 
                      type="monotone" 
                      dataKey={habit.name} 
                      stroke={habit.color} 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Streak Overview */}
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Current Streaks</h3>
            <div className="space-y-4">
              {habits.slice(0, 4).map((habit) => (
                <motion.div 
                  key={habit.id}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                    <span className="text-lg">{habit.icon}</span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{habit.currentStreak} days</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: habit.color,
                          width: `${(habit.currentStreak / habit.longestStreak) * 100}%` 
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(habit.currentStreak / habit.longestStreak) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Weekly Stats Component
interface WeeklyStatsProps {
  habits: HabitData[];
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ habits }) => {
  // Generate pie data from habits
  const pieData = useMemo(() => {
    if (!habits || habits.length === 0) return [];
    
    return habits.map(habit => ({
      name: habit.name,
      value: habit.progress[habit.progress.length - 1],
      color: habit.color
    }));
  }, [habits]);

  // Generate bar chart data
  const barData = useMemo(() => {
    if (!habits || habits.length === 0) return [];
    
    return habits.map(habit => ({
      name: habit.name,
      currentStreak: habit.currentStreak,
      color: habit.color
    }));
  }, [habits]);
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Weekly Stats</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Time Distribution */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-semibold text-gray-800 mb-4">Time Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Completion Rate */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="font-semibold text-gray-800 mb-4">Completion Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }} 
                  formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                />
                <Legend />
                <Bar 
                  dataKey="currentStreak" 
                  name="Current Streak" 
                  radius={[4, 4, 0, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// HabitsView Component
interface HabitsViewProps {
  habits: HabitData[];
  handleAddHabit: (habit: { name: string; icon: string; target: number; unit: string; color: string }) => void;
  handleDeleteHabit: (habitId: number) => void;
  handleUpdateProgress: (habitId: number, value: number) => void;
}

const HabitsView: React.FC<HabitsViewProps> = ({ habits, handleAddHabit, handleDeleteHabit, handleUpdateProgress }) => {
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitData | null>(null);
  const [showHabitDetails, setShowHabitDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Handle delete confirmation
  const confirmDelete = (habitId: number) => {
    setHabitToDelete(habitId);
    setShowDeleteConfirm(true);
  };
  
  // Execute delete after confirmation
  const executeDelete = () => {
    if (habitToDelete !== null) {
      handleDeleteHabit(habitToDelete);
      setShowDeleteConfirm(false);
      setHabitToDelete(null);
    }
  };
  
  // Filter habits based on active filter
  const filteredHabits = useMemo(() => {
    if (activeFilter === 'all') {
      return habits;
    } else if (activeFilter === 'active') {
      return habits.filter(habit => 
        habit.progress[habit.progress.length - 1] < habit.target
      );
    } else {
      return habits.filter(habit => 
        habit.progress[habit.progress.length - 1] >= habit.target
      );
    }
  }, [habits, activeFilter]);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Your Habits</h1>
              <p className="text-gray-600 mt-1">Manage and track your daily habits.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddHabitModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New Habit</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Habit Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">All Habits</h2>
          <div className="flex space-x-2">
            <motion.button
              className={`text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg ${
                activeFilter === 'all' ? 'bg-blue-600 text-white' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('all')}
            >
              All
            </motion.button>
            <motion.button
              className={`text-sm font-medium ${
                activeFilter === 'active' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-blue-500'
              } bg-blue-50 px-3 py-1 rounded-lg`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </motion.button>
            <motion.button
              className={`text-sm font-medium ${
                activeFilter === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-blue-500'
              } bg-blue-50 px-3 py-1 rounded-lg`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </motion.button>
          </div>
        </div>
        
        {/* Habit List */}
        <div className="space-y-4">
          {filteredHabits.map((habit) => (
            <motion.div
              key={habit.id}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                    <span className="text-2xl">{habit.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                    <p className="text-sm text-gray-500">Target: {habit.target} {habit.unit} daily</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                    {habit.currentStreak} day streak
                  </div>
                  
                  <motion.button
                    className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedHabit(habit);
                      setShowHabitDetails(true);
                    }}
                  >
                    View Details
                  </motion.button>
                  
                  <motion.button
                    className="text-red-600 hover:text-red-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => confirmDelete(habit.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabitModal && (
          <AddHabitModal onClose={() => setShowAddHabitModal(false)} handleAddHabit={handleAddHabit} />
        )}
      </AnimatePresence>
      
      {/* Habit Details Modal */}
      <AnimatePresence>
        {showHabitDetails && selectedHabit && (
          <HabitDetailsModal 
            habit={selectedHabit} 
            onClose={() => setShowHabitDetails(false)} 
            handleUpdateProgress={handleUpdateProgress}
          />
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Habit</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete this habit? All of your progress will be lost.
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <motion.button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={executeDelete}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Habit Details Modal Component
interface HabitDetailsModalProps {
  habit: HabitData;
  onClose: () => void;
  handleUpdateProgress: (habitId: number, value: number) => void;
}

const HabitDetailsModal: React.FC<HabitDetailsModalProps> = ({ habit, onClose, handleUpdateProgress }) => {
  const [progressValue, setProgressValue] = useState<number>(habit.progress[habit.progress.length - 1]);
  
  const handleUpdate = () => {
    handleUpdateProgress(habit.id, progressValue);
    onClose();
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
              <span className="text-2xl">{habit.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{habit.name}</h3>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Progress History</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...Array(7)].map((_, i) => ({ 
                  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                  value: habit.progress[i]
                }))} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value: number) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem',
                      border: '1px solid #f3f4f6',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} 
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={habit.color} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Habit Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-medium">{habit.target} {habit.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Streak:</span>
                  <span className="font-medium">{habit.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longest Streak:</span>
                  <span className="font-medium">{habit.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frequency:</span>
                  <span className="font-medium capitalize">{habit.frequency}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Today Check-in</h4>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">
                    {habit.progress[habit.progress.length - 1]} / {habit.target} {habit.unit}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: habit.color,
                      width: `${(habit.progress[habit.progress.length - 1] / habit.target) * 100}%` 
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(habit.progress[habit.progress.length - 1] / habit.target) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Enter ${habit.unit}`}
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                />
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdate}
                >
                  Update
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Dashboard Component
interface DashboardProps {
  onAddHabitClick: () => void;
  habits: HabitData[];
  handleUpdateProgress: (habitId: number, value: number) => void;
  setActiveView: React.Dispatch<React.SetStateAction<'dashboard' | 'habits' | 'stats' | 'settings'>>;
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onAddHabitClick, habits, handleUpdateProgress, setActiveView, userProfile }) => {
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{greeting}, {userProfile.name}!</h1>
              <p className="text-gray-600 mt-1">Here is an overview of your habits and progress.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddHabitClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New Habit</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Daily Progress */}
      <DailyProgress habits={habits} handleUpdateProgress={handleUpdateProgress} />
      
      {/* Habit Overview */}
      <HabitOverview habits={habits} setActiveView={setActiveView} />
      
      {/* Weekly Stats */}
      <WeeklyStats habits={habits} />
    </div>
  );
};

// StatsView Component
interface StatsViewProps {
  habits: HabitData[];
}

const StatsView: React.FC<StatsViewProps> = ({ habits }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // Define types for the stats data
  type CompletionData = {
    name: string;
    rate: number;
  };
  
  type ComparisonData = {
    name: string;
    completionRate: number;
    streak: number;
  };
  
  // Mock data for completion rate
  const completionData: CompletionData[] = [
    { name: 'Mon', rate: 85 },
    { name: 'Tue', rate: 90 },
    { name: 'Wed', rate: 75 },
    { name: 'Thu', rate: 80 },
    { name: 'Fri', rate: 95 },
    { name: 'Sat', rate: 70 },
    { name: 'Sun', rate: 60 },
  ];
  
  // Mock data for habit comparison
  const comparisonData: ComparisonData[] = habits.map(habit => ({
    name: habit.name,
    completionRate: Math.round(Math.random() * 40 + 60), // Random value between 60-100
    streak: habit.currentStreak
  }));
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Statistics</h1>
              <p className="text-gray-600 mt-1">Analyze your habit performance and trends.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <motion.button
                  key={range}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    timeRange === range 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Overall Stats */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-600">Completion Rate</h3>
                <p className="text-sm text-gray-500">Average completion rate of all habits</p>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">
                +5% from last week
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <div className="text-3xl font-bold text-gray-800">82%</div>
              <div className="text-sm text-gray-500 mb-1">of habits completed</div>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-600">Current Streaks</h3>
                <p className="text-sm text-gray-500">Longest active streaks of all habits</p>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                4.2 days avg
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <div className="text-3xl font-bold text-gray-800">7</div>
              <div className="text-sm text-gray-500 mb-1">longest active streak</div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {[5, 3, 7, 2, 4, 0, 0].map((streak, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="h-16 w-4 rounded-t-full" 
                    style={{ 
                      backgroundColor: streak ? '#3B82F6' : '#E5E7EB',
                      opacity: streak ? 0.2 + (streak / 10) : 0.2,
                      height: `${(streak / 7) * 100}%`
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-600">Consistency Score</h3>
                <p className="text-sm text-gray-500">Average consistency score of all habits</p>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                Top 15%
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <div className="text-3xl font-bold text-gray-800">8.4</div>
              <div className="text-sm text-gray-500 mb-1">out of 10</div>
            </div>
            <div className="mt-4 relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <div 
                className="absolute top-0 h-full w-px bg-yellow-400" 
                style={{ left: '70%' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0</span>
              <span className="text-xs text-gray-500">5</span>
              <span className="text-xs text-gray-500">10</span>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Completion Rate Chart */}
      <section>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Daily Completion Rate</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem',
                      border: '1px solid #f3f4f6',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }} 
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                  />
                  <Bar 
                    dataKey="rate" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      
      {/* Habit Comparison */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Habit Comparison</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={comparisonData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'completionRate' ? `${value}%` : `${value} days`, 
                      name === 'completionRate' ? 'Completion Rate' : 'Current Streak'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem',
                      border: '1px solid #f3f4f6',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completionRate" 
                    name="Completion Rate" 
                    fill="#3B82F6" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey="streak" 
                    name="Current Streak" 
                    fill="#8B5CF6" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      
      {/* Insights */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Most Consistent Habit</h3>
                <p className="text-gray-600 mt-1">Your Read habit has the highest completion rate at 92% this week.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Needs Improvement</h3>
                <p className="text-gray-600 mt-1">Your Meditate habit has dropped to 60% completion. Try setting a reminder.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Best Day</h3>
                <p className="text-gray-600 mt-1">Friday was your most productive day with 95% habit completion rate.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Streak Alert</h3>
                <p className="text-gray-600 mt-1">You are 2 days away from beating your Read habit record of 21 days!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// SettingsView Component
interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
  setUserProfile: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    avatar: string;
  }>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ darkMode, setDarkMode, userProfile, setUserProfile }) => {
  const [notifications, setNotifications] = useState(true);
  const [weekStart, setWeekStart] = useState<'monday' | 'sunday'>('monday');
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Edit profile form state
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  
  // Handle profile update
  const handleProfileUpdate = () => {
    setUserProfile({
      ...userProfile,
      name: editName,
      email: editEmail
    });
    setShowModal(false);
  };
  
  const exportData = () => {
    alert("Exporting data...");
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your preferences and account settings.</p>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Account Settings */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Account</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <img 
              src={userProfile.avatar} 
              alt="User" 
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{userProfile.name}</h3>
              <p className="text-gray-500">{userProfile.email}</p>
            </div>
            <motion.button
              className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
            >
              Edit Profile
            </motion.button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <h4 className="font-medium text-gray-800">Premium Membership</h4>
                <p className="text-sm text-gray-500">Access to all premium features</p>
              </div>
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h4 className="font-medium text-gray-800">Delete Account</h4>
                <p className="text-sm text-gray-500">Permanently delete your account and data</p>
              </div>
              <motion.button
                className="text-red-600 font-medium"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete
              </motion.button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Preferences */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Preferences</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800">Notifications</h4>
                <p className="text-sm text-gray-500">Receive reminders for your habits</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  id="notifications"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <motion.div
                  className={`w-14 h-7 rounded-full ${notifications ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-200`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <motion.div 
                    className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 m-1"
                    animate={{ x: notifications ? 28 : 0 }}
                  />
                </motion.div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800">Dark Mode</h4>
                <p className="text-sm text-gray-500">Switch to dark theme</p>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  id="darkMode"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <motion.div
                  className={`w-14 h-7 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-200`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <motion.div 
                    className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 m-1"
                    animate={{ x: darkMode ? 28 : 0 }}
                  />
                </motion.div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800">Week Starts On</h4>
                <p className="text-sm text-gray-500">Choose the day your week starts</p>
              </div>
              <div className="flex space-x-2">
                {(['monday', 'sunday'] as const).map((day) => (
                  <motion.button
                    key={day}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      weekStart === day 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWeekStart(day)}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Reminder Time</h4>
              <select className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>8:00 AM</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>12:00 PM</option>
                <option>3:00 PM</option>
                <option>6:00 PM</option>
                <option>9:00 PM</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      
      {/* Data & Privacy */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Data & Privacy</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <h4 className="font-medium text-gray-800">Export Data</h4>
                <p className="text-sm text-gray-500">Download all your habit data</p>
              </div>
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportData}
              >
                Export
              </motion.button>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h4 className="font-medium text-gray-800">Privacy Policy</h4>
                <p className="text-sm text-gray-500">Read our privacy policy</p>
              </div>
              <motion.button
                className="text-blue-600 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPrivacyPolicy(true)}
              >
                View
              </motion.button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delete Account Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Account</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <motion.button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleProfileUpdate();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <motion.button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrivacyPolicy(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Privacy Policy</h3>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <p className="text-gray-600">
                  <strong>1. Introduction</strong><br />
                  This Privacy Policy explains how we collect, use, and protect your personal information when you use our Habit Tracker application.
                </p>
                
                <p className="text-gray-600">
                  <strong>2. Information We Collect</strong><br />
                  We collect information you provide directly to us, such as your name, email address, and habit tracking data.
                </p>
                
                <p className="text-gray-600">
                  <strong>3. How We Use Your Information</strong><br />
                  We use your information to provide, maintain, and improve our services, and to communicate with you about your account and our services.
                </p>
                
                <p className="text-gray-600">
                  <strong>4. Data Security</strong><br />
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
                </p>
                
                <p className="text-gray-600">
                  <strong>5. Your Rights</strong><br />
                  You have the right to access, correct, or delete your personal information at any time.
                </p>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <motion.button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPrivacyPolicy(false)}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirmation(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Account</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <motion.button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;

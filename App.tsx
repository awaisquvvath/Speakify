import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Converter } from './pages/Converter';
import { Dashboard } from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HistoryProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/convert" element={<Converter />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </HistoryProvider>
    </AuthProvider>
  );
};

export default App;

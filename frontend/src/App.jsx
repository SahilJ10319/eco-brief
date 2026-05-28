import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#080e1a] text-slate-50 bg-grid-slate">
        <header className="border-b border-white/5 bg-[#080e1a]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-eco-400 to-eco-600 flex items-center justify-center shadow-lg shadow-eco-500/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">EcoBrief</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-eco-500"></span>
              </span>
              <span className="text-xs text-slate-500 font-medium">live sync</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

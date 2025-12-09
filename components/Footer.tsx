import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-bold text-white mb-1">Speakify</span>
            <p className="text-slate-400 text-sm">Giving a voice to your words with AI.</p>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
        </div>

        <div className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Speakify. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
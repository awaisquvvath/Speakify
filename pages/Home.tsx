import React from 'react';
import { Link } from 'react-router-dom';
import { AudioLines, Volume2, Mic, Zap, Shield, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col pt-16">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10"></div>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center mt-12 md:mt-20 mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Powered by Gemini TTS
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
          Convert Your Text to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 neon-text">
            Lifelike Speech
          </span>
        </h1>
        
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
          Experience natural, high-fidelity voice synthesis powered by Gemini 2.5. 
          Turn your articles, scripts, and notes into audio instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
                to="/convert" 
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-1 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                    Start Generating <Volume2 className="w-5 h-5" />
                </span>
            </Link>
            
            <button 
                onClick={login}
                className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all hover:border-white/30 backdrop-blur-sm"
            >
                Login with Google
            </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full">
            <FeatureCard 
                icon={<AudioLines className="w-6 h-6 text-yellow-400" />}
                title="Natural Voices"
                description="Choose from a variety of expressive, human-like voices like Kore, Puck, and Fenrir."
            />
             <FeatureCard 
                icon={<Zap className="w-6 h-6 text-cyan-400" />}
                title="Instant Synthesis"
                description="Generate long-form audio in seconds using the latest Gemini Flash models."
            />
             <FeatureCard 
                icon={<Shield className="w-6 h-6 text-pink-400" />}
                title="Download Ready"
                description="Export your generated speech as high-quality WAV files immediately."
            />
        </div>
      </main>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-6 rounded-2xl glass-card text-left hover:border-cyan-500/30 transition-colors group">
        <div className="w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);
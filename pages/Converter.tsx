import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Download, RefreshCcw, Settings, Trash2, 
  Sparkles, Speaker
} from 'lucide-react';
import { generateSpeech, createWavBlob, TTSResult } from '../services/geminiService';
import { useHistory } from '../contexts/HistoryContext';
import { AppStatus, VoiceName } from '../types';

const VOICES: VoiceName[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const Converter: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [audioData, setAudioData] = useState<TTSResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { addToHistory } = useHistory();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Initialize Audio Context on user interaction if needed
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setStatus(AppStatus.GENERATING);
    stopAudio(); // Stop any currently playing audio

    try {
      const result = await generateSpeech(text, selectedVoice);
      setAudioData(result);
      setDuration(result.audioBuffer.duration);
      setCurrentTime(0);
      pauseTimeRef.current = 0;
      
      addToHistory({
        text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        voice: selectedVoice,
        duration: result.audioBuffer.duration
      });
      
      setStatus(AppStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      alert("Failed to generate speech. Please try again.");
    }
  };

  const playAudio = () => {
    if (!audioData) return;
    
    const ctx = getAudioContext();
    
    // Create new source
    const source = ctx.createBufferSource();
    source.buffer = audioData.audioBuffer;
    source.connect(ctx.destination);
    
    // Calculate start time
    const startOffset = pauseTimeRef.current % audioData.audioBuffer.duration;
    
    source.start(0, startOffset);
    startTimeRef.current = ctx.currentTime - startOffset;
    sourceNodeRef.current = source;
    
    setStatus(AppStatus.PLAYING);

    source.onended = () => {
        // Only reset if we naturally ended, not if we stopped manually
        if (ctx.currentTime - startTimeRef.current >= audioData.audioBuffer.duration - 0.1) {
             setStatus(AppStatus.IDLE);
             pauseTimeRef.current = 0;
             setCurrentTime(0);
        }
    };
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop();
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      sourceNodeRef.current = null;
      setStatus(AppStatus.PAUSED);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    pauseTimeRef.current = 0;
    setCurrentTime(0);
    if (status === AppStatus.PLAYING || status === AppStatus.PAUSED) {
        setStatus(AppStatus.IDLE);
    }
  };

  // Animation loop for progress bar
  useEffect(() => {
    let animationId: number;
    const updateProgress = () => {
      if (status === AppStatus.PLAYING && audioContextRef.current) {
        const played = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(played, duration));
        animationId = requestAnimationFrame(updateProgress);
      }
    };

    if (status === AppStatus.PLAYING) {
      animationId = requestAnimationFrame(updateProgress);
    }

    return () => cancelAnimationFrame(animationId);
  }, [status, duration]);

  const handleDownload = () => {
    if (!audioData) return;
    const blob = createWavBlob(audioData.rawPcm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speakify_${selectedVoice}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Text to Speech</h2>
            <p className="text-slate-400 text-sm">Transform your text into natural sounding audio.</p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Panel: Settings */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-cyan-400" /> Settings
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Select Voice</label>
                            <div className="grid grid-cols-1 gap-2">
                                {VOICES.map((voice) => (
                                    <button
                                        key={voice}
                                        onClick={() => setSelectedVoice(voice)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                            selectedVoice === voice 
                                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white' 
                                            : 'bg-slate-800/50 border-transparent text-slate-400 hover:border-white/20 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedVoice === voice ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                                                <Speaker className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{voice}</span>
                                        </div>
                                        {selectedVoice === voice && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Input & Output */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Text Input */}
                <div className="glass-card rounded-2xl p-1 relative border border-white/10 flex-grow min-h-[300px] flex flex-col">
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="w-full h-full min-h-[250px] bg-transparent resize-none p-6 text-lg text-slate-200 focus:outline-none font-light leading-relaxed placeholder-slate-600 rounded-xl"
                        maxLength={5000}
                    />
                    <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center bg-black/20 rounded-b-xl">
                        <span className="text-xs text-slate-500">{text.length} / 5000 characters</span>
                        <button 
                            onClick={() => setText('')}
                            className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" /> Clear
                        </button>
                    </div>
                </div>

                {/* Actions & Player */}
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <button
                            onClick={handleGenerate}
                            disabled={status === AppStatus.GENERATING || !text.trim()}
                            className={`
                                w-full md:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-w-[200px]
                                ${status === AppStatus.GENERATING 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5'}
                            `}
                        >
                            {status === AppStatus.GENERATING ? (
                                <>
                                    <RefreshCcw className="w-5 h-5 animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" /> Generate Speech
                                </>
                            )}
                        </button>

                        {/* Audio Player Controls */}
                        {audioData && (
                            <div className="flex-grow w-full flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <button 
                                    onClick={status === AppStatus.PLAYING ? pauseAudio : playAudio}
                                    className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-cyan-50 transition-colors shadow-lg shadow-white/10"
                                >
                                    {status === AppStatus.PLAYING ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>

                                <div className="flex-grow flex flex-col gap-1">
                                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden relative">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-cyan-400 rounded-full transition-all duration-100 ease-linear"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleDownload}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
                                    title="Download WAV"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

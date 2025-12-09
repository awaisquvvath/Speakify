import React from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Trash2, Calendar, Speaker, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { history, deleteFromHistory, clearHistory } = useHistory();
  const { user } = useAuth();

  if (!user) {
    return (
        <div className="min-h-screen pt-24 flex items-center justify-center text-white">
            <p>Please log in to view dashboard.</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">View your speech generation history.</p>
            </div>
            {history.length > 0 && (
                <button 
                    onClick={() => { if(window.confirm('Are you sure?')) clearHistory(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
                >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                </button>
            )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{history.length}</div>
                        <div className="text-slate-400 text-sm">Generations</div>
                    </div>
                </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {Math.round(history.reduce((acc, curr) => acc + (curr.duration || 0), 0))}s
                        </div>
                        <div className="text-slate-400 text-sm">Total Audio Generated</div>
                    </div>
                </div>
            </div>
        </div>

        {/* History List */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10">
                <h3 className="font-semibold text-white">Recent Generations</h3>
            </div>
            
            {history.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Speaker className="w-8 h-8 text-slate-600" />
                    </div>
                    <h4 className="text-white font-medium mb-1">No history found</h4>
                    <p className="text-slate-400 text-sm mb-6">Start converting your text to voice today.</p>
                    <Link to="/convert" className="px-6 py-2 bg-cyan-600 rounded-lg text-white font-medium hover:bg-cyan-500 transition-colors">
                        Go to Converter
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {history.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-white font-medium truncate max-w-2xl">
                                            {item.text}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Speaker className="w-3 h-3" />
                                            {item.voice}
                                        </div>
                                         <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {item.duration ? `${Math.round(item.duration)}s` : 'Unknown'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-start md:self-center">
                                    <button 
                                        onClick={() => deleteFromHistory(item.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
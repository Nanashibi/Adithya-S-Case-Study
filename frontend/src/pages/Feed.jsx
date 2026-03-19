import { useState, useEffect } from 'react';
import { Filter, Sparkles, Search, BarChart3 } from 'lucide-react';
import IncidentCard from '../components/IncidentCard';

export default function Feed() {
  const [incidents, setIncidents] = useState([]);
  const [neighborhood, setNeighborhood] = useState('Downtown');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch feed with filters
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        let url = `/api/incidents?neighborhood=${neighborhood}`;
        if (category) url += `&category=${category}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    // Fetch stats
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/incidents/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data[neighborhood] || null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Add small debounce for search query
    const timeoutId = setTimeout(() => {
      fetchFeed();
      fetchStats();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [neighborhood, category, searchQuery]);

  // Reset summary when neighborhood changes
  useEffect(() => {
    setSummary('');
    setIsSummarizing(false);
  }, [neighborhood]);

  // Manual trigger for AI Summary
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    setSummary('');
    try {
      const res = await fetch(`/api/incidents/summary?neighborhood=${neighborhood}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Local Area Feed</h1>
        <div className="flex items-center space-x-2">
          
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 py-1.5 border border-gray-300 bg-gray-50 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-48 shadow-sm transition-all"
            />
          </div>

          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 bg-gray-50 rounded-md text-sm px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          >
            <option value="">All Categories</option>
            <option value="verified_alert">Alerts</option>
            <option value="noise">Noise</option>
            <option value="digital_threat">Digital Threats</option>
          </select>

          <Filter size={18} className="text-gray-500 ml-2" />
          <select 
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="border border-gray-300 bg-gray-50 rounded-md text-sm px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          >
            <option value="Downtown">Downtown</option>
            <option value="Uptown">Uptown</option>
            <option value="Riverside">Riverside</option>
            <option value="Maplewood">Maplewood</option>
            <option value="Northridge">Northridge</option>
            <option value="Willow Creek">Willow Creek</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Verified Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats?.verified_alert || 0}</p>
            </div>
            <BarChart3 className="text-red-200" size={32} />
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Noise Complaints</p>
              <p className="text-2xl font-bold text-gray-600">{stats?.noise || 0}</p>
            </div>
            <BarChart3 className="text-gray-200" size={32} />
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Digital Threats</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.digital_threat || 0}</p>
            </div>
            <BarChart3 className="text-purple-200" size={32} />
        </div>
      </div>

      {/* AI Digest Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 font-semibold text-blue-800">
            <Sparkles className="w-5 h-5" />
            <h2>AI Safety Digest: {neighborhood}</h2>
          </div>
          <button 
            onClick={handleGenerateSummary}
            disabled={isSummarizing}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isSummarizing 
                ? 'bg-blue-200 text-blue-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
            }`}
          >
            {isSummarizing ? "Analyzing..." : "Generate Digest"}
          </button>
        </div>
        {summary ? (
          <p className="text-blue-900 leading-relaxed text-sm mt-3 border-t border-blue-200/50 pt-3">
            {summary}
          </p>
        ) : (
          <p className="text-blue-700/60 leading-relaxed text-sm mt-3 pt-3">
            Click 'Generate Digest' to receive an AI-powered summary of the current safety climate in {neighborhood}.
          </p>
        )}
      </div>

      {/* Feed List */}
      <div>
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading verified incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No active incidents in this area.</div>
        ) : (
          incidents.map(inc => (
            <IncidentCard 
              key={inc.id} 
              incident={inc} 
              onDelete={(id) => setIncidents(prev => prev.filter(i => i.id !== id))}
              onUpdate={(updatedData) => setIncidents(prev => prev.map(i => i.id === updatedData.id ? updatedData : i))}
            />
          ))
        )}
      </div>
    </div>
  );
}
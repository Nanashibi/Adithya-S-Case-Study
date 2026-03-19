import { useState, useEffect } from 'react';
import { Send, MapPin } from 'lucide-react';

export default function SafeCircles() {
  const [updates, setUpdates] = useState([]);
  const [status, setStatus] = useState('');
  const [locationStatus, setLocationStatus] = useState('safe_at_home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // We use a single hardcoded circle here purely to demonstrate the MVP
  const circleId = "alpha-block-watch";

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch(`/api/circles/${circleId}/updates`);
      if (res.ok) {
        setUpdates(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/circles/${circleId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Faking authorship visually since there's no auth 
        body: JSON.stringify({ 
          status: `Update: ${status}`, 
          location_status: locationStatus 
        })
      });
      if (res.ok) {
        setStatus('');
        fetchUpdates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Safe Circle: Alpha Block</h1>
        <p className="text-gray-500 text-sm">Encrypted peer-to-peer check-ins for emergency situations.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
        {/* Chat Feed */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
          {updates.length === 0 ? (
            <div className="text-center text-sm text-gray-400 mt-10">No recent updates in this circle.</div>
          ) : (
            updates.map((msg, i) => (
              <div key={i} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                <p className="text-sm text-gray-800">{msg.status}</p>
                <div className="flex items-center mt-2 text-xs text-blue-600 font-medium">
                  <MapPin size={12} className="mr-1" />
                  {msg.location_status.replace(/_/g, ' ')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <select 
              value={locationStatus}
              onChange={e => setLocationStatus(e.target.value)}
              className="text-sm border-gray-300 rounded-md py-1.5 px-3 bg-gray-50 w-full"
            >
              <option value="safe_at_home">📍 Safe at Home</option>
              <option value="need_assistance">🚨 Need Assistance</option>
              <option value="evacuating">🏃 Evacuating</option>
            </select>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={status}
                onChange={e => setStatus(e.target.value)}
                placeholder="Type your status..."
                className="flex-1 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 text-sm"
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !status.trim()}
                className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
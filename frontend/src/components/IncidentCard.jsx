import { ShieldAlert, ShieldCheck, FileWarning, ThumbsUp, Trash2, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function IncidentCard({ incident, onDelete, onUpdate }) {
  const [upvotes, setUpvotes] = useState(incident.upvotes || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(incident.title);
  const [editDesc, setEditDesc] = useState(incident.description);
  
  const [hasVoted, setHasVoted] = useState(() => {
    return localStorage.getItem(`voted_${incident.id}`) === 'true';
  });

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'verified_alert':
        return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
      case 'digital_threat':
        return { icon: FileWarning, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
      case 'safety_tip':
        return { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
      default:
        return { icon: ShieldAlert, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
    }
  };

  const theme = getCategoryTheme(incident.category);
  const Icon = theme.icon;

  const handleVerify = async () => {
    if (hasVoted) return;
    
    try {
      const response = await fetch(`/api/incidents/${incident.id}/verify`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setUpvotes(prev => prev + 1);
        setHasVoted(true);
        localStorage.setItem(`voted_${incident.id}`, 'true');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (onDelete) onDelete(incident.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          neighborhood: incident.neighborhood
        })
      });
      if (response.ok) {
        const updatedIncident = await response.json();
        setIsEditing(false);
        if (onUpdate) onUpdate(updatedIncident);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`p-5 rounded-lg border mb-4 ${theme.bg}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3 w-full">
          <Icon className={theme.color} size={24} />
          <div className="flex-1">
            {isEditing ? (
              <input 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                className="font-bold text-gray-900 w-full mb-1 px-2 py-1 border border-gray-300 rounded"
              />
            ) : (
              <h3 className="font-bold text-gray-900">{incident.title}</h3>
            )}
            <span className="text-xs font-medium uppercase text-gray-500 tracking-wider">
              {incident.category.replace('_', ' ')} • {incident.neighborhood}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0 ml-4">
          {new Date(incident.timestamp).toLocaleDateString()}
        </span>
      </div>
      
      {isEditing ? (
        <textarea 
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          className="w-full text-gray-700 mb-4 px-2 py-1 border border-gray-300 rounded rows-3"
        />
      ) : (
        <p className="text-gray-700 mb-4">{incident.description}</p>
      )}
      
      {incident.action_steps && incident.action_steps.length > 0 && !isEditing && (
        <div className="bg-white bg-opacity-60 rounded p-3 mb-4">
          <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">AI Suggested Action Checkist</h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {incident.action_steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button 
              onClick={handleUpdate}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
            >
              <Check size={16} />
              <span>Save</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-white text-red-600 border border-gray-300 hover:bg-red-50"
            >
              <Trash2 size={16} />
              <span>Dismiss</span>
            </button>
            <button 
              onClick={handleVerify}
              disabled={hasVoted}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                hasVoted 
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ThumbsUp size={16} className={hasVoted ? "fill-current" : ""} />
              <span>{hasVoted ? 'Verified' : 'Verify'} ({upvotes})</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
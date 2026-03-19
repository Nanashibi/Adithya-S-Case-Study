import { Link, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, Users } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItem = (path, name, Icon) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
          isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon size={18} />
        <span>{name}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Community Guardian</span>
          </div>
          <div className="flex items-center space-x-1">
            {navItem('/', 'Feed', ShieldAlert)}
            {navItem('/report', 'Report', Shield)}
            {navItem('/circles', 'Safe Circles', Users)}
          </div>
        </div>
      </div>
    </nav>
  );
}
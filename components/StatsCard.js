/**
 * Composant StatsCard pour afficher les statistiques
 * Cartes réutilisables avec animations et icônes
 */
'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = 'blue' 
}) {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-500',
      purple: 'bg-purple-50 text-purple-500',
      green: 'bg-green-50 text-green-500',
      yellow: 'bg-yellow-50 text-yellow-500',
      red: 'bg-red-50 text-red-500',
      orange: 'bg-orange-50 text-orange-500',
    };
    return colors[color] || colors.blue;
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black hover:transform hover:-translate-y-1 hover:rotate-1 transition-all duration-300 ease-in-out hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-purple-800 mt-2">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {change && (
        <div className={`mt-4 flex items-center text-sm ${getChangeColor(changeType)}`}>
          {getChangeIcon(changeType)}
          <span className="ml-1 font-medium">{change}</span>
        </div>
      )}
    </div>
  );
}
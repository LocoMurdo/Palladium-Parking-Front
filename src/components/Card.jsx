import React from 'react';

const Card = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  className = '',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 shadow-blue-100',
    green: 'bg-green-50 border-green-200 shadow-green-100',
    red: 'bg-red-50 border-red-200 shadow-red-100',
    yellow: 'bg-yellow-50 border-yellow-200 shadow-yellow-100',
    purple: 'bg-purple-50 border-purple-200 shadow-purple-100',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-xl p-6 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`${iconColorClasses[color]} p-3 rounded-lg`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
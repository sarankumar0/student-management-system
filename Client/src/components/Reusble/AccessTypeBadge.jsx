// src/components/common/AccessTypeBadge.jsx (Example Implementation)
import React from 'react';

const AccessTypeBadge = ({ accessType }) => {
  let badgeColor = 'bg-gray-100 text-gray-800'; // Default/Unknown
  let text = accessType || 'N/A';

  switch (String(accessType).toLowerCase()) {
    case 'basic':
      badgeColor = 'bg-blue-600 text-white';
      text = 'Basic';
      break;
    case 'classic':
      badgeColor = 'bg-purple-600 text-white';
      text = 'Classic';
      break;
    case 'pro':
      badgeColor = 'bg-green-600 text-white';
      text = 'Pro';
      break;
    // Add other types if necessary
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
      {text}
    </span>
  );
};

export default AccessTypeBadge;
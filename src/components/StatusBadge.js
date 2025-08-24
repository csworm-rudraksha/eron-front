import React from 'react';
import clsx from 'clsx';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'new':
        return 'status-new';
      case 'contacted':
        return 'status-contacted';
      case 'qualified':
        return 'status-qualified';
      case 'lost':
        return 'status-lost';
      case 'won':
        return 'status-won';
      default:
        return 'status-new';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={clsx('status-badge', getStatusClass(status))}>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;

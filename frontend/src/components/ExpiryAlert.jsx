import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export default function ExpiryAlert({ expiryDate }) {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 5 && diffDays > 0) {
    return (
      <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertTriangle size={20} />
        <div>
          <strong>Subscription Expiry Warning:</strong> Your subscription will expire in <strong>{diffDays} day{diffDays > 1 ? 's' : ''}</strong> ({new Date(expiryDate).toLocaleDateString()}). Please renew now to maintain uninterrupted access.
        </div>
      </div>
    );
  }

  if (diffDays <= 0) {
    return (
      <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Clock size={20} />
        <div>
          <strong>Subscription Expired:</strong> Your subscription expired on {new Date(expiryDate).toLocaleDateString()}. Renew now to reactivate your plan.
        </div>
      </div>
    );
  }

  return null;
}

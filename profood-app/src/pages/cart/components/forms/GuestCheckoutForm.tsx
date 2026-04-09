import React from 'react';

/**
 * Placeholder stub — original component was lost in the iCloud
 * corruption of April 2026 before being committed to git.
 * Rebuild from scratch when resuming the feature.
 */

export interface GuestInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  [key: string]: any;
}

interface GuestCheckoutFormProps {
  onSubmit?: (info: GuestInfo) => void;
  onCancel?: () => void;
  [key: string]: any;
}

const GuestCheckoutForm: React.FC<GuestCheckoutFormProps> = ({ onCancel }) => (
  <div
    className="stub-placeholder"
    style={{
      padding: '16px',
      margin: '8px 0',
      border: '1px dashed #888',
      borderRadius: '8px',
      opacity: 0.7,
      fontSize: '13px',
      color: '#666',
      textAlign: 'center',
    }}
  >
    <strong>GuestCheckoutForm</strong>
    <div style={{ marginTop: 4 }}>Feature temporarily unavailable (WIP).</div>
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        style={{ marginTop: 8, padding: '6px 12px' }}
      >
        Cancel
      </button>
    )}
  </div>
);

export default GuestCheckoutForm;

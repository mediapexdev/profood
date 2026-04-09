import React from 'react';

/**
 * Placeholder stub — original component was lost in the iCloud
 * corruption of April 2026 before being committed to git.
 * Rebuild from scratch when resuming the feature.
 */
const LoginPrompt: React.FC<any> = (props) => (
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
    <div style={{ fontSize: '24px' }}>{props?.icon ?? '🔒'}</div>
    <strong>{props?.title ?? 'LoginPrompt'}</strong>
    <div style={{ marginTop: 4 }}>
      {props?.description ?? 'Feature temporarily unavailable (WIP).'}
    </div>
  </div>
);

export default LoginPrompt;

import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingOverlay({ isVisible, message = '正在处理...' }) {
  console.log('LoadingOverlay rendered, isVisible:', isVisible, 'message:', message);
  
  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          maxWidth: '400px',
          margin: '16px',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 
            style={{ 
              width: '48px', 
              height: '48px', 
              color: '#2563eb',
              animation: 'spin 1s linear infinite'
            }} 
          />
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 8px 0' 
            }}>
              {message}
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: '0' 
            }}>
              请稍候，正在为您生成精美的图像...
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingOverlay;

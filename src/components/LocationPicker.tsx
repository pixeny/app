import { useState } from 'react';
import { C } from '../styles';

interface LocationPickerProps {
  onLocationSelect: (location: [number, number], address: string) => void;
  onClose: () => void;
}

export default function LocationPicker({ onLocationSelect, onClose }: LocationPickerProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleStartSelection = () => {
    setIsSelecting(true);
    // Enable map selection mode - the actual selection will happen when user clicks on map
    onLocationSelect([44.827, 41.721], 'Starting point selection');
  };

  const handleCancelSelection = () => {
    setIsSelecting(false);
    // Disable map selection mode
    onLocationSelect([44.827, 41.721], 'CANCEL_SELECTION');
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
      backgroundColor: C.white,
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      minWidth: 320,
      maxWidth: 400,
      textAlign: 'center'
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.gray400,
          fontSize: 20,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = C.gray100;
          e.currentTarget.style.color = C.gray600;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = C.gray400;
        }}
      >
        ×
      </button>

      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: '#EBF5FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#3B82F6">
          <path d="M12 2C7.589 2 4 5.589 4 9.995c-.029 6.445 7.116 11.604 7.42 11.819a.998.998 0 0 0 1.16 0C12.884 21.599 20.029 16.44 20 10c0-4.411-3.589-8-8-8zm0 17.735C10.389 18.427 5.979 14.441 6 10c0-3.309 2.691-6 6-6s6 2.691 6 6.005c.021 4.437-4.388 8.423-6 9.73z"/>
          <path d="M11 11.586 8.707 9.293l-1.414 1.414L11 14.414l5.707-5.707-1.414-1.414z"/>
        </svg>
      </div>
      
      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        color: C.gray800,
        margin: '0 0 8px 0'
      }}>
        Select location
      </h3>
      
      <p style={{
        fontSize: 14,
        color: C.gray600,
        margin: '0 0 20px 0',
        lineHeight: 1.4
      }}>
        {isSelecting 
          ? 'Click on the map to select starting location'
          : 'Click on the map to select destination'
        }
      </p>
      
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center'
      }}>
        {!isSelecting ? (
          <>
            <button
              onClick={handleStartSelection}
              style={{
                padding: '12px 24px',
                backgroundColor: C.primary,
                color: C.dark,
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Start
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: C.gray600,
                border: `2px solid ${C.gray200}`,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleCancelSelection}
            style={{
              padding: '12px 24px',
              backgroundColor: C.gray100,
              color: C.gray700,
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Stop
          </button>
        )}
      </div>
      
      {isSelecting && (
        <div style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: '#F0F9FF',
          borderRadius: 8,
          fontSize: 12,
          color: '#0369A1'
        }}>
          💡 Click on the map to select the desired location and then confirm your choice
        </div>
      )}
    </div>
  );
}

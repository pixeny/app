import { useState, useEffect } from 'react';
import type { DriverStep, RideRequest } from '../types';
import { C, shadow } from '../styles';
import {
  PhoneIcon, MessageIcon, StarIcon,
  NavigationIcon, XIcon, ArrowRightIcon
} from './icons';

// --- Global Premium Styles & Animations ---
const premiumStyles = `
  @keyframes ripple {
    0% { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .premium-panel {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(10px);
  }
  .btn-active:active {
    transform: scale(0.96);
  }
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: #10B981;
    animation: ripple 2s infinite;
  }
`;

export default function DriverPanel({ onStopNavigation }: any) {
  const [step, setStep] = useState<DriverStep>('offline');
  const [request, setRequest] = useState<any>(null);
  const [onlineTime, setOnlineTime] = useState(0);

  // დროის ფორმატირება (00:00:00)
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
  };

  useEffect(() => {
    if (step === 'offline') return;
    const iv = setInterval(() => setOnlineTime(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, [step]);

  // სიმულაცია: 3 წამში მოდის შეკვეთა როცა ონლაინ ვართ
  useEffect(() => {
    if (step === 'online') {
      const timer = setTimeout(() => {
        setRequest({
          passenger: "გიორგი მ.",
          rating: 4.9,
          price: 12.50,
          from: "ჭავჭავაძის გამზ. 37",
          to: "რუსთაველის გამზ. 1",
          time: "4 წთ"
        });
        setStep('request');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- Styles ---
  const glassBack = {
    background: step === 'offline' ? 'rgba(18, 18, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    color: step === 'offline' ? '#FFF' : '#111',
  };

  return (
    <>
      <style>{premiumStyles}</style>

      {/* Top Bar - ბალანსი და სტატუსი */}
      {step !== 'offline' && (
        <div style={{ position: 'absolute', top: 50, left: 0, right: 0, padding: '0 20px', display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ 
            background: '#000', borderRadius: 100, padding: '8px 20px', 
            display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 10, background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
            <span style={{ color: '#FFF', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>{formatTime(onlineTime)}</span>
            <div style={{ width: 1, height: 16, background: '#333' }} />
            <span style={{ color: '#FFF', fontWeight: 700 }}>145.50₾</span>
          </div>
        </div>
      )}

      {/* Bottom Panel */}
      <div 
        className="premium-panel"
        style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, 
          ...glassBack, borderTopLeftRadius: 32, borderTopRightRadius: 32,
          padding: '20px 24px 40px', boxShadow: '0 -15px 50px rgba(0,0,0,0.1)',
          zIndex: 1001, transition: 'background 0.3s'
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 5, background: step === 'offline' ? '#333' : '#E0E0E0', borderRadius: 10, margin: '0 auto 25px' }} />

        {/* ========== OFFLINE ========== */}
        {step === 'offline' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 25 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>ხაზგარეშე</h1>
                <p style={{ color: '#888', margin: '5px 0 0', fontSize: 16 }}>მზად ხართ სამუშაოდ?</p>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StarIcon color="#F59E0B" size={24} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25 }}>
              <div style={{ background: '#1E1E1E', padding: '16px', borderRadius: 24 }}>
                <span style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 5 }}>დღევანდელი</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>42.30 ₾</span>
              </div>
              <div style={{ background: '#1E1E1E', padding: '16px', borderRadius: 24 }}>
                <span style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 5 }}>მგზავრობა</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>12</span>
              </div>
            </div>

            <button 
              className="btn-active"
              onClick={() => setStep('online')}
              style={{ 
                width: '100%', height: 70, borderRadius: 24, background: '#10B981', 
                color: '#FFF', border: 'none', fontSize: 20, fontWeight: 800, 
                boxShadow: '0 15px 30px rgba(16, 185, 129, 0.3)', cursor: 'pointer'
              }}
            >
              ხაზზე გასვლა
            </button>
          </div>
        )}

        {/* ========== ONLINE (SEARCHING) ========== */}
        {step === 'online' && (
          <div style={{ textAlign: 'center', padding: '10px 0', animation: 'fadeIn 0.4s' }}>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 30px' }}>
              <div className="ripple-effect" style={{ inset: 0 }} />
              <div className="ripple-effect" style={{ inset: 0, animationDelay: '0.5s' }} />
              <div style={{ 
                position: 'absolute', inset: 20, background: '#10B981', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', zIndex: 2
              }}>
                <NavigationIcon size={40} />
              </div>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>ვეძებ შეკვეთებს...</h2>
            <p style={{ color: '#666', marginBottom: 35, fontSize: 16 }}>შეკვეთა მალე გამოჩნდება</p>
            
            <button 
              onClick={() => setStep('offline')}
              style={{ width: '100%', height: 64, borderRadius: 22, background: '#F5F5F5', color: '#444', border: 'none', fontSize: 17, fontWeight: 700 }}
            >
              მუშაობის შეწყვეტა
            </button>
          </div>
        )}

        {/* ========== NEW REQUEST ========== */}
        {step === 'request' && request && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ background: '#EBF5FF', color: '#3B82F6', padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700 }}>
                ახალი შეკვეთა
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>{request.time}</span>
            </div>

            <div style={{ display: 'flex', gap: 15, marginBottom: 30 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{request.passenger}</h3>
                  <span style={{ fontSize: 24, fontWeight: 900 }}>{request.price}₾</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B' }}>
                  <StarIcon size={14} fill="#F59E0B" />
                  <span style={{ fontWeight: 700 }}>{request.rating}</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: 30, marginBottom: 35 }}>
              <div style={{ position: 'absolute', left: 8, top: 5, bottom: 5, width: 2, background: '#EEE' }} />
              <div style={{ position: 'absolute', left: 4, top: 0, width: 10, height: 10, borderRadius: 10, background: '#10B981' }} />
              <div style={{ position: 'absolute', left: 4, bottom: 0, width: 10, height: 10, borderRadius: 10, background: '#EF4444' }} />
              
              <div style={{ marginBottom: 25 }}>
                <span style={{ color: '#888', fontSize: 12, display: 'block' }}>საიდან</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{request.from}</span>
              </div>
              <div>
                <span style={{ color: '#888', fontSize: 12, display: 'block' }}>სად</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{request.to}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setStep('online')}
                style={{ width: 64, height: 64, borderRadius: 20, background: '#F5F5F5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XIcon size={24} color="#666" />
              </button>
              <button 
                onClick={() => setStep('toPickup')}
                className="btn-active"
                style={{ flex: 1, borderRadius: 20, background: '#111', color: '#FFF', border: 'none', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                მიღება <ArrowRightIcon size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ========== IN RIDE / TO PICKUP ========== */}
        {(step === 'toPickup' || step === 'inRide') && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 25 }}>
              <div style={{ width: 48, height: 48, borderRadius: 15, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{request?.passenger}</h4>
                <span style={{ color: '#10B981', fontSize: 14, fontWeight: 600 }}>{step === 'toPickup' ? 'მიხვალთ 2 წუთში' : 'მგზავრობა...'}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ width: 44, height: 44, borderRadius: 12, background: '#F0FDF4', border: 'none' }}>
                  <PhoneIcon size={20} color="#10B981" />
                </button>
                <button style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', border: 'none' }}>
                  <MessageIcon size={20} color="#3B82F6" />
                </button>
              </div>
            </div>

            <div style={{ background: '#F9F9F9', padding: '16px', borderRadius: 20, marginBottom: 25, border: '1px solid #F0F0F0' }}>
               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <div style={{ width: 10, height: 10, borderRadius: 5, background: step === 'toPickup' ? '#10B981' : '#EF4444' }} />
                 <span style={{ fontWeight: 600 }}>{step === 'toPickup' ? request?.from : request?.to}</span>
               </div>
            </div>

            <button 
              className="btn-active"
              onClick={() => step === 'toPickup' ? setStep('inRide') : setStep('completed')}
              style={{ 
                width: '100%', height: 64, borderRadius: 22, background: '#111', color: '#FFF', 
                border: 'none', fontSize: 18, fontWeight: 700, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
              }}
            >
              {step === 'toPickup' ? 'მივედი ადგილზე' : 'დასრულება'}
            </button>
          </div>
        )}

        {/* ========== COMPLETED ========== */}
        {step === 'completed' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
            <div style={{ 
              width: 80, height: 80, background: '#DCFCE7', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' 
            }}>
              <span style={{ fontSize: 40 }}>💰</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 5px' }}>შესანიშნავია!</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>თქვენ გამოიმუშავეთ</p>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#10B981', marginBottom: 30 }}>{request?.price}₾</div>
            
            <button 
              onClick={() => { setStep('online'); setRequest(null); }}
              className="btn-active"
              style={{ width: '100%', height: 64, borderRadius: 22, background: '#10B981', color: '#FFF', border: 'none', fontSize: 18, fontWeight: 700 }}
            >
              შემდეგი შეკვეთა
            </button>
          </div>
        )}
      </div>
    </>
  );
}
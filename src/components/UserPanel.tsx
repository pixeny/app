import { useState, useEffect } from 'react';
import { C, shadow } from '../styles';
import {
  PhoneIcon, MessageIcon, StarIcon,
  NavigationIcon, XIcon, ArrowRightIcon,
  MapPinIcon, CreditCardIcon, UserIcon
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
    background: #667eea;
    animation: ripple 2s infinite;
  }
`;

export default function UserPanel({ onStopNavigation }: any) {
  const [step, setStep] = useState<'home' | 'searching' | 'found' | 'riding' | 'completed'>('home');
  const [ride, setRide] = useState<any>(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedTariff, setSelectedTariff] = useState('comfort');

  // სიმულაცია: მგზავრობის მოთხოვნის შემდეგ 2 წამში ეძებს მძღოლს
  useEffect(() => {
    if (step === 'searching') {
      const timer = setTimeout(() => {
        setRide({
          driver: "დავით კ.",
          rating: 4.8,
          price: 18.50,
          car: "Toyota Camry",
          plate: "TD-123-AB",
          eta: "3 წთ",
          from: pickup || "ვაკე-საბურთალო",
          to: dropoff || "თბილისის საერთაშორისო აეროპორტი"
        });
        setStep('found');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, pickup, dropoff]);

  // სიმულაცია: მძღოლის პოვნის შემდეგ 3 წამში ჩამოდის
  useEffect(() => {
    if (step === 'found') {
      const timer = setTimeout(() => {
        setStep('riding');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // --- Styles ---
  const glassBack = {
    background: 'rgba(255, 255, 255, 0.98)',
    color: '#111',
  };

  const tariffs = [
    { id: 'economy', name: 'Economy', price: 12.5, time: '5 წთ' },
    { id: 'comfort', name: 'Comfort', price: 18.5, time: '3 წთ' },
    { id: 'business', name: 'Business', price: 35.0, time: '2 წთ' }
  ];

  return (
    <>
      <style>{premiumStyles}</style>

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
        <div style={{ width: 40, height: 5, background: '#E0E0E0', borderRadius: 10, margin: '0 auto 25px' }} />

        {/* ========== HOME ========== */}
        {step === 'home' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 25 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>გამავლებლის რეჟიმი</h1>
                <p style={{ color: '#888', margin: '5px 0 0', fontSize: 16 }}>სად მიდიხართ დღეს?</p>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon color="#667eea" size={24} />
              </div>
            </div>

            {/* Location Inputs */}
            <div style={{ backgroundColor: '#F8F9FA', borderRadius: 24, padding: 16, marginBottom: 25 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 10, background: '#667eea' }} />
                <input
                  type="text"
                  placeholder="საიდან?"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 16 }}
                />
              </div>
              <div style={{ height: 1, background: '#E0E0E0', marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 10, background: '#111' }} />
                <input
                  type="text"
                  placeholder="სად?"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 16 }}
                />
              </div>
            </div>

            {/* Tariff Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 25 }}>
              {tariffs.map(tariff => (
                <button
                  key={tariff.id}
                  onClick={() => setSelectedTariff(tariff.id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 16,
                    border: selectedTariff === tariff.id ? '2px solid #667eea' : '1px solid #E0E0E0',
                    background: selectedTariff === tariff.id ? '#F0F4FF' : '#FFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 2 }}>{tariff.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{tariff.price}₾</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{tariff.time}</div>
                </button>
              ))}
            </div>

            <button 
              className="btn-active"
              onClick={() => setStep('searching')}
              disabled={!pickup || !dropoff}
              style={{ 
                width: '100%', height: 70, borderRadius: 24, background: pickup && dropoff ? '#667eea' : '#CCC', 
                color: '#FFF', border: 'none', fontSize: 20, fontWeight: 800, 
                boxShadow: pickup && dropoff ? '0 15px 30px rgba(102, 126, 234, 0.3)' : 'none',
                cursor: pickup && dropoff ? 'pointer' : 'not-allowed'
              }}
            >
              მძღოლის გამოძახება
            </button>
          </div>
        )}

        {/* ========== SEARCHING ========== */}
        {step === 'searching' && (
          <div style={{ textAlign: 'center', padding: '10px 0', animation: 'fadeIn 0.4s' }}>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 30px' }}>
              <div className="ripple-effect" style={{ inset: 0 }} />
              <div className="ripple-effect" style={{ inset: 0, animationDelay: '0.5s' }} />
              <div style={{ 
                position: 'absolute', inset: 20, background: '#667eea', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)', zIndex: 2
              }}>
                <NavigationIcon size={40} />
              </div>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>მძღოლს ვეძებ...</h2>
            <p style={{ color: '#666', marginBottom: 35, fontSize: 16 }}>მალე იპოვით მძღოლს</p>
            
            <button 
              onClick={() => setStep('home')}
              style={{ width: '100%', height: 64, borderRadius: 22, background: '#F5F5F5', color: '#444', border: 'none', fontSize: 17, fontWeight: 700 }}
            >
              გაუქმება
            </button>
          </div>
        )}

        {/* ========== DRIVER FOUND ========== */}
        {step === 'found' && ride && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ background: '#F0F4FF', color: '#667eea', padding: '6px 14px', borderRadius: 100, fontSize: 14, fontWeight: 700 }}>
                მძღოლი ნაპოვნია!
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#667eea' }}>{ride.eta}</span>
            </div>

            <div style={{ display: 'flex', gap: 15, marginBottom: 30 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👨‍✈️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{ride.driver}</h3>
                  <span style={{ fontSize: 24, fontWeight: 900 }}>{ride.price}₾</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B' }}>
                  <StarIcon size={14} fill="#F59E0B" />
                  <span style={{ fontWeight: 700 }}>{ride.rating}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: 20, marginBottom: 25 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 24 }}>🚗</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{ride.car}</div>
                  <div style={{ fontSize: 14, color: '#666', fontWeight: 700, letterSpacing: 1 }}>{ride.plate}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setStep('home')}
                style={{ width: 64, height: 64, borderRadius: 20, background: '#F5F5F5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XIcon size={24} color="#666" />
              </button>
              <button 
                onClick={() => setStep('riding')}
                className="btn-active"
                style={{ flex: 1, borderRadius: 20, background: '#667eea', color: '#FFF', border: 'none', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                მგზავრობის დაწყება <ArrowRightIcon size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ========== IN RIDE ========== */}
        {step === 'riding' && ride && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 25 }}>
              <div style={{ width: 48, height: 48, borderRadius: 15, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍✈️</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{ride.driver}</h4>
                <span style={{ color: '#667eea', fontSize: 14, fontWeight: 600 }}>მგზავრობა...</span>
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
                 <MapPinIcon size={16} color="#667eea" />
                 <span style={{ fontWeight: 600 }}>{ride.to}</span>
               </div>
            </div>

            <button 
              className="btn-active"
              onClick={() => setStep('completed')}
              style={{ 
                width: '100%', height: 64, borderRadius: 22, background: '#667eea', color: '#FFF', 
                border: 'none', fontSize: 18, fontWeight: 700, boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)' 
              }}
            >
              მგზავრობის დასრულება
            </button>
          </div>
        )}

        {/* ========== COMPLETED ========== */}
        {step === 'completed' && ride && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
            <div style={{ 
              width: 80, height: 80, background: '#DCFCE7', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' 
            }}>
              <span style={{ fontSize: 40 }}>✅</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 5px' }}>მგზავრობა დასრულდა!</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>გადახდილი თანხა</p>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#667eea', marginBottom: 30 }}>{ride.price}₾</div>
            
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>შეაფასეთ მძღოლი</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer' }}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => { setStep('home'); setRide(null); setPickup(''); setDropoff(''); }}
              className="btn-active"
              style={{ width: '100%', height: 64, borderRadius: 22, background: '#667eea', color: '#FFF', border: 'none', fontSize: 18, fontWeight: 700 }}
            >
              მთავარზე დაბრუნება
            </button>
          </div>
        )}
      </div>
    </>
  );
}

import { useState } from 'react';
import { C, shadow, s, typography } from '../styles';
import apiService, { LoginRequest, RegisterRequest } from '../services/api';
import { XIcon } from './icons';
import imgurService from '../services/imgur';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    role: 'rider' as 'rider' | 'driver',
    // Driver specific fields
    car_make: '',
    car_model: '',
    car_color: '',
    license_plate: '',
    car_photo: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  // Phone validation function
  const validatePhone = (phone: string): boolean => {
    // Georgian phone number format: +995 5XX XXX XXX or 5XXXXXXXX
    const phoneRegex = /^(\+995\s?)?5\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPhoneError('');

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid Georgian phone number (e.g., +995 5XX XXX XXX)');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const loginData: LoginRequest = {
          phone: formData.phone,
          password: formData.password
        };
        const response = await apiService.login(loginData);
        onAuthSuccess(response.user);
      } else {
        let car_photo_url = '';
        
        // Upload car photo if registering as driver
        if (formData.role === 'driver' && formData.car_photo) {
          setUploadProgress('Saving car photo to local memory...');
          const uploadResponse = await imgurService.uploadImage(formData.car_photo);
          car_photo_url = uploadResponse.data.link;
          setUploadProgress('');
        }
        
        const registerData: RegisterRequest = {
          full_name: formData.full_name,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          // Driver specific fields
          car_make: formData.car_make,
          car_model: formData.car_model,
          car_color: formData.car_color,
          license_plate: formData.license_plate,
          car_photo_url
        };
        
        const response = await apiService.register(registerData);
        onAuthSuccess(response.user);
      }
      onClose();
    } catch (error: any) {
      setError(error.message || 'Authorization error');
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      setFormData({
        ...formData,
        [name]: file || null
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });

      // Real-time phone validation
      if (name === 'phone') {
        if (value && !validatePhone(value)) {
          setPhoneError('Please enter a valid Georgian phone number (e.g., +995 5XX XXX XXX)');
        } else {
          setPhoneError('');
        }
      }
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 1000, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{ 
        backgroundColor: C.white, 
        borderRadius: 24, 
        width: '100%', 
        maxWidth: 400,
        boxShadow: shadow.xl,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '32px 32px 24px', 
          borderBottom: `1px solid ${C.borderLight}`,
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: 24, 
              right: 24, 
              ...s.roundedMd,
              ...s.card,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              transition: 'all 0.2s ease'
            }}
          >
            <XIcon size={20} color={C.gray600} />
          </button>
          <h2 style={{ 
            ...typography.h2,
            color: C.dark, 
            margin: 0,
            textAlign: 'center'
          }}>
            {isLogin ? 'Login' : 'Register'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px 24px' }}>
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 16
            }}>
              {error}
            </div>
          )}

          {uploadProgress && (
            <div style={{
              backgroundColor: '#FEF3C7',
              color: C.warning,
              padding: '12px 16px',
              ...s.roundedMd,
              ...typography.body2,
              marginBottom: 16,
              border: `1px solid ${C.warning}40`
            }}>
              {uploadProgress}
            </div>
          )}

          {phoneError && (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 16
            }}>
              {phoneError}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 500, 
              color: C.gray700, 
              marginBottom: 6 
            }}>
              Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              placeholder="Giorgi Giorgadze"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${C.gray200}`,
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 500, 
              color: C.gray700, 
              marginBottom: 6 
            }}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="+995 5XX XXX XXX"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: phoneError ? `2px solid #DC2626` : `1px solid ${C.gray200}`,
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 500, 
              color: C.gray700, 
              marginBottom: 6 
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Minimum 6 characters"
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${C.gray200}`,
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {!isLogin && (
            <>

              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14, 
                  fontWeight: 500, 
                  color: C.gray700, 
                  marginBottom: 6 
                }}>
                  Register as
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${C.gray200}`,
                    borderRadius: 8,
                    fontSize: 16,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: C.white
                  }}
                >
                  <option value="rider">User</option>
                  <option value="driver">Driver</option>
                </select>
              </div>

              {formData.role === 'driver' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 14, 
                      fontWeight: 500, 
                      color: C.gray700, 
                      marginBottom: 6 
                    }}>
                      Car Brand
                    </label>
                    <input
                      type="text"
                      name="car_make"
                      value={formData.car_make}
                      onChange={handleInputChange}
                      required={formData.role === 'driver'}
                      placeholder="Mercedes-Benz"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${C.gray200}`,
                        borderRadius: 8,
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 14, 
                      fontWeight: 500, 
                      color: C.gray700, 
                      marginBottom: 6 
                    }}>
                      Car Color
                    </label>
                    <input
                      type="text"
                      name="car_color"
                      value={formData.car_color}
                      onChange={handleInputChange}
                      required={formData.role === 'driver'}
                      placeholder="Black"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${C.gray200}`,
                        borderRadius: 8,
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 14, 
                      fontWeight: 500, 
                      color: C.gray700, 
                      marginBottom: 6 
                    }}>
                      License Plate
                    </label>
                    <input
                      type="text"
                      name="license_plate"
                      value={formData.license_plate}
                      onChange={handleInputChange}
                      required={formData.role === 'driver'}
                      placeholder="AB-123-CD"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${C.gray200}`,
                        borderRadius: 8,
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 14, 
                      fontWeight: 500, 
                      color: C.gray700, 
                      marginBottom: 6 
                    }}>
                      Upload Car Photo
                    </label>
                    <input
                      type="file"
                      name="car_photo"
                      onChange={handleInputChange}
                      required={formData.role === 'driver'}
                      accept="image/*"
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        fontSize: 14,
                        color: C.gray600
                      }}
                    />
                    {formData.car_photo && (
                      <div style={{ marginTop: 8, fontSize: 12, color: C.gray500 }}>
                        Selected: {formData.car_photo.name}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 0',
              backgroundColor: C.primary,
              color: C.dark,
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(255,102,0,0.3)'
            }}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {/* Footer */}
        <div style={{ 
          padding: '0 24px 24px', 
          textAlign: 'center',
          borderTop: `1px solid ${C.gray100}`,
          paddingTop: 16
        }}>
          <p style={{ fontSize: 14, color: C.gray600, margin: 0 }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: C.primary,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

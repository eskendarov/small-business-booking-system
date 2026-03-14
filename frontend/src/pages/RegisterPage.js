import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useTheme } from '../context/ThemeContext';

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export default function RegisterPage() {
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState([{ name: '', durationMinutes: '', price: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleServiceChange = (index, field, value) => {
    setServices(services.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addService = () =>
    setServices([...services, { name: '', durationMinutes: '', price: '' }]);

  const removeService = (index) => {
    if (services.length > 1) setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      if (role === 'ADMIN') {
        payload.businessName = businessName;
        payload.services = services.map((s) => ({
          name: s.name,
          durationMinutes: Number(s.durationMinutes),
          price: Number(s.price),
        }));
      }
      await authApi.register(payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button
        className="auth-theme-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      <div className="auth-logo">
        <CalendarIcon />
        Makooka
      </div>

      <div className="auth-card" style={{ maxWidth: role === 'ADMIN' ? 540 : 440 }}>
        <h1>Create account</h1>
        <p className="subtitle">Sign up to get started</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="role-toggle">
          <button
            type="button"
            className={role === 'CUSTOMER' ? 'active' : ''}
            onClick={() => setRole('CUSTOMER')}
          >
            Customer
          </button>
          <button
            type="button"
            className={role === 'ADMIN' ? 'active' : ''}
            onClick={() => setRole('ADMIN')}
          >
            Business Owner
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {role === 'ADMIN' && (
            <>
              <hr className="auth-divider" />

              <div className="form-group">
                <label htmlFor="reg-bizname">Business name</label>
                <input
                  id="reg-bizname"
                  type="text"
                  placeholder="e.g. Glamour Hair Salon"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <span className="section-label">Services</span>
                <div className="svc-list">
                  {services.map((svc, i) => (
                    <div key={i} className="svc-row">
                      <input
                        type="text"
                        placeholder="Service name"
                        value={svc.name}
                        onChange={(e) => handleServiceChange(i, 'name', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Min"
                        min={1}
                        value={svc.durationMinutes}
                        onChange={(e) => handleServiceChange(i, 'durationMinutes', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="$ Price"
                        min={0}
                        step="0.01"
                        value={svc.price}
                        onChange={(e) => handleServiceChange(i, 'price', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-icon-remove"
                        onClick={() => removeService(i)}
                        disabled={services.length === 1}
                        aria-label="Remove service"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="svc-row-labels">
                  <span>Name</span>
                  <span>Duration (min)</span>
                  <span>Price ($)</span>
                  <span />
                </div>
                <button type="button" className="btn-add-link" onClick={addService}>
                  + Add another service
                </button>
              </div>
            </>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading
              ? 'Creating account…'
              : `Sign up as ${role === 'ADMIN' ? 'Business Owner' : 'Customer'}`}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

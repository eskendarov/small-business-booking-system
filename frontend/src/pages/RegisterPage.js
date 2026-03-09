import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function RegisterPage() {
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState([{ name: '', durationMinutes: '', price: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleServiceChange = (index, field, value) => {
    const updated = services.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setServices(updated);
  };

  const addService = () => setServices([...services, { name: '', durationMinutes: '', price: '' }]);

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
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: role === 'ADMIN' ? 520 : 420 }}>
        <h1>Create account</h1>
        <p className="subtitle">Sign up to get started</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="role-toggle">
          <button type="button" className={role === 'CUSTOMER' ? 'active' : ''} onClick={() => setRole('CUSTOMER')}>
            Customer
          </button>
          <button type="button" className={role === 'ADMIN' ? 'active' : ''} onClick={() => setRole('ADMIN')}>
            Business Owner
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input name="name" type="text" placeholder="John Smith" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
          </div>

          {role === 'ADMIN' && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Glamour Hair Salon"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: '#374151', display: 'block', marginBottom: 8 }}>
                  Services
                </label>
                {services.map((svc, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Service name"
                      value={svc.name}
                      onChange={(e) => handleServiceChange(i, 'name', e.target.value)}
                      required
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
                    />
                    <input
                      type="number"
                      placeholder="Min"
                      min={1}
                      value={svc.durationMinutes}
                      onChange={(e) => handleServiceChange(i, 'durationMinutes', e.target.value)}
                      required
                      style={{ padding: '8px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
                    />
                    <input
                      type="number"
                      placeholder="Price $"
                      min={0}
                      step="0.01"
                      value={svc.price}
                      onChange={(e) => handleServiceChange(i, 'price', e.target.value)}
                      required
                      style={{ padding: '8px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      disabled={services.length === 1}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, display: 'grid', gridTemplateColumns: '1fr 80px 90px 32px', gap: 8 }}>
                  <span>Name</span><span>Duration (min)</span><span>Price ($)</span><span />
                </div>
                <button
                  type="button"
                  onClick={addService}
                  style={{ fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontWeight: 600 }}
                >
                  + Add service
                </button>
              </div>
            </>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Creating account...' : `Sign up as ${role === 'ADMIN' ? 'Business Owner' : 'Customer'}`}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

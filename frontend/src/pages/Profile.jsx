import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useUIContext } from '../context/UIContext';
import { fetchData } from '../api';

const PLAY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const field = (label, children) => (
    <div className="input-group">{label && <label>{label}</label>}{children}</div>
);

const Profile = () => {
    const { user, setUser } = useAppContext();
    const { showToast } = useUIContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', phone: '', dateOfBirth: '', gender: '', playLevel: '',
        address: { street: '', city: '', state: '', pincode: '', country: '' }
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData('/profile')
            .then(data => {
                setForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || '',
                    playLevel: data.playLevel || '',
                    address: {
                        street: data.address?.street || '',
                        city: data.address?.city || '',
                        state: data.address?.state || '',
                        pincode: data.address?.pincode || '',
                        country: data.address?.country || ''
                    }
                });
            })
            .catch(() => showToast('Failed to load profile', 'error'))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await fetchData('/profile', { method: 'PUT', body: JSON.stringify(form) });
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const merged = { ...stored, name: updated.name };
            localStorage.setItem('user', JSON.stringify(merged));
            setUser(merged);
            showToast('Profile updated successfully', 'success');
        } catch {
            showToast('Failed to save profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '120px', maxWidth: '800px' }}>
            <div className="cart-header">
                <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>Athlete Registry</span>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '10px' }}>Your Profile</h1>
                <p style={{ color: 'var(--text-dim)' }}>Keep your details up to date for faster checkout and delivery.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', fontWeight: 800 }}>LOADING REGISTRY...</div>
            ) : (
                <form onSubmit={handleSubmit}>

                    {/* PERSONAL INFO */}
                    <div style={{ marginBottom: '50px' }}>
                        <h3 style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {field('Full Name',
                                <input className="input-field" type="text" placeholder="Full Name" required value={form.name} onChange={e => set('name', e.target.value)} />
                            )}
                            {field('Phone Number',
                                <input className="input-field" type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                            )}
                            {field('Date of Birth',
                                <input className="input-field" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                            )}
                            {field('Gender',
                                <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)} style={{ cursor: 'pointer' }}>
                                    <option value="">Select Gender</option>
                                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            )}
                        </div>
                        {field('Play Level',
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {PLAY_LEVELS.map(level => (
                                    <div key={level} onClick={() => set('playLevel', level)} style={{ padding: '14px', border: `1px solid ${form.playLevel === level ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '8px', background: form.playLevel === level ? 'var(--accent-soft)' : '#000', cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: form.playLevel === level ? 'var(--accent)' : 'var(--text-dim)', transition: 'var(--transition)' }}>
                                        {level}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DELIVERY ADDRESS */}
                    <div style={{ marginBottom: '50px' }}>
                        <h3 style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>Delivery Address</h3>
                        {field('Street Address',
                            <input className="input-field" type="text" placeholder="123 Court Lane, Apt 4B" value={form.address.street} onChange={e => setAddr('street', e.target.value)} />
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {field('City',
                                <input className="input-field" type="text" placeholder="Mumbai" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
                            )}
                            {field('State',
                                <input className="input-field" type="text" placeholder="Maharashtra" value={form.address.state} onChange={e => setAddr('state', e.target.value)} />
                            )}
                            {field('Pincode',
                                <input className="input-field" type="text" placeholder="400001" value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} />
                            )}
                            {field('Country',
                                <input className="input-field" type="text" placeholder="India" value={form.address.country} onChange={e => setAddr('country', e.target.value)} />
                            )}
                        </div>
                    </div>

                    {/* ACCOUNT INFO (read-only) */}
                    <div style={{ marginBottom: '50px' }}>
                        <h3 style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>Account</h3>
                        {field('Email Address',
                            <input className="input-field" type="email" value={user.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', opacity: saving ? 0.7 : 1 }} disabled={saving}>
                        {saving ? 'SAVING...' : 'Save Profile'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Profile;

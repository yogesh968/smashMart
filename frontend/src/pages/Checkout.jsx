import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useUIContext } from '../context/UIContext';
import { fetchData } from '../api';
import { getProductImage } from '../utils/racketImages';

const STEPS = ['Delivery Address', 'Payment', 'Confirmation'];

const PAYMENT_METHODS = [
    { id: 'cod',        label: 'Cash on Delivery',    icon: '💵', desc: 'Pay when your order arrives' },
    { id: 'upi',        label: 'UPI',                 icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card',       label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking',         icon: '🏦', desc: 'All major banks supported' },
];

const EMPTY_ADDR = { label: 'Home', name: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false };

// ─── STEP BAR ────────────────────────────────────────────────────────────────
const StepBar = ({ step }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '50px', gap: 0 }}>
        {STEPS.map((s, i) => (
            <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i <= step ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: i <= step ? '#000' : 'var(--text-dim)', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: i === step ? '#fff' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--accent)' : 'var(--border)', margin: '0 15px' }} />}
            </React.Fragment>
        ))}
    </div>
);

// ─── ADDRESS FORM ─────────────────────────────────────────────────────────────
const AddressForm = ({ addrForm, editingId, onChange, onLabelClick, onSubmit, onCancel }) => (
    <div style={{ background: 'var(--bg-sub)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '30px', marginBottom: '20px' }}>
        <h4 style={{ fontWeight: 800, marginBottom: '25px', fontSize: '1rem' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h4>
        <form onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                    <label>Full Name</label>
                    <input className="input-field" required placeholder="Rahul Sharma" name="name" value={addrForm.name} onChange={onChange} />
                </div>
                <div className="input-group">
                    <label>Phone Number</label>
                    <input className="input-field" required placeholder="9876543210" name="phone" value={addrForm.phone} onChange={onChange} />
                </div>
            </div>
            <div className="input-group">
                <label>Address (House No, Street, Area)</label>
                <input className="input-field" required placeholder="12, MG Road, Koramangala" name="street" value={addrForm.street} onChange={onChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                    <label>City</label>
                    <input className="input-field" required placeholder="Bengaluru" name="city" value={addrForm.city} onChange={onChange} />
                </div>
                <div className="input-group">
                    <label>State</label>
                    <input className="input-field" required placeholder="Karnataka" name="state" value={addrForm.state} onChange={onChange} />
                </div>
                <div className="input-group">
                    <label>Pincode</label>
                    <input className="input-field" required placeholder="560034" name="pincode" value={addrForm.pincode} onChange={onChange} maxLength={10} />
                </div>
                <div className="input-group">
                    <label>Country</label>
                    <input className="input-field" required placeholder="India" name="country" value={addrForm.country} onChange={onChange} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {['Home', 'Work', 'Other'].map(lbl => (
                    <div key={lbl} onClick={() => onLabelClick(lbl)} style={{ padding: '8px 18px', border: `1px solid ${addrForm.label === lbl ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '50px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: addrForm.label === lbl ? 'var(--accent)' : 'var(--text-dim)', background: addrForm.label === lbl ? 'var(--accent-soft)' : 'transparent', transition: 'var(--transition)' }}>{lbl}</div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <input type="checkbox" id="isDefault" name="isDefault" checked={addrForm.isDefault} onChange={onChange} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                <label htmlFor="isDefault" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Make this my default address</label>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '0.8rem' }}>Save Address</button>
                <button type="button" className="btn btn-outline" style={{ padding: '12px 30px', fontSize: '0.8rem' }} onClick={onCancel}>Cancel</button>
            </div>
        </form>
    </div>
);

// ─── ADDRESS LIST ─────────────────────────────────────────────────────────────
const StepAddress = ({ addresses, selectedAddressId, showAddForm, addrForm, editingId, onSelect, onEdit, onDelete, onSetDefault, onAddrChange, onLabelClick, onSaveAddress, onCancelForm, onAddNew, onContinue }) => (
    <div>
        {showAddForm && (
            <AddressForm addrForm={addrForm} editingId={editingId} onChange={onAddrChange} onLabelClick={onLabelClick} onSubmit={onSaveAddress} onCancel={onCancelForm} />
        )}
        {addresses.map(addr => {
            const aid = addr.id || addr._id;
            const isSelected = selectedAddressId === aid;
            return (
                <div key={aid} onClick={() => onSelect(aid)} style={{ background: 'var(--bg-sub)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', padding: '22px 25px', marginBottom: '15px', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        <div style={{ marginTop: '3px', width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isSelected && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--accent)' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{addr.name}</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{addr.label}</span>
                                {addr.isDefault && <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', padding: '2px 8px', borderRadius: '4px' }}>DEFAULT</span>}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>📞 {addr.phone}</p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '12px' }} onClick={e => e.stopPropagation()}>
                                <span onClick={() => onEdit(addr)} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}>Edit</span>
                                <span onClick={() => onDelete(aid)} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff3b3b', cursor: 'pointer' }}>Remove</span>
                                {!addr.isDefault && <span onClick={() => onSetDefault(aid)} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', cursor: 'pointer' }}>Set as Default</span>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
        {!showAddForm && (
            <button onClick={onAddNew} className="btn btn-outline" style={{ width: '100%', padding: '16px', fontSize: '0.8rem', marginTop: '10px' }}>+ Add New Address</button>
        )}
        {selectedAddressId && !showAddForm && (
            <button onClick={onContinue} className="btn btn-primary" style={{ width: '100%', padding: '18px', marginTop: '25px', fontSize: '0.85rem' }}>Continue to Payment →</button>
        )}
    </div>
);

// ─── PAYMENT ──────────────────────────────────────────────────────────────────
const StepPayment = ({ selectedAddr, paymentMethod, placing, finalTotal, onChangeAddr, onPaymentChange, onPlaceOrder }) => (
    <div>
        <div style={{ background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 25px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Delivering to</span>
                    <p style={{ fontWeight: 700, marginTop: '4px' }}>{selectedAddr?.name} — {selectedAddr?.street}, {selectedAddr?.city} {selectedAddr?.pincode}</p>
                </div>
                <span onClick={onChangeAddr} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}>Change</span>
            </div>
        </div>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '20px' }}>Select Payment Method</h3>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
            {PAYMENT_METHODS.map(pm => (
                <div key={pm.id} onClick={() => onPaymentChange(pm.id)} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-sub)', border: `1px solid ${paymentMethod === pm.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', padding: '18px 22px', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === pm.id ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {paymentMethod === pm.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />}
                    </div>
                    <span style={{ fontSize: '1.4rem' }}>{pm.icon}</span>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pm.label}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{pm.desc}</p>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={onPlaceOrder} className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '0.85rem', opacity: placing ? 0.7 : 1 }} disabled={placing}>
            {placing ? 'PLACING ORDER...' : `Place Order · $${finalTotal.toFixed(2)}`}
        </button>
    </div>
);

// ─── CONFIRMATION ─────────────────────────────────────────────────────────────
const StepConfirmation = ({ placedOrder, onTrackOrders, onContinueShopping }) => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-soft)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', fontSize: '2rem' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>ORDER PLACED!</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Your gear is being prepared for shipment.</p>
        {placedOrder && (
            <div style={{ background: 'var(--bg-sub)', border: '1px solid var(--border)', borderRadius: '12px', padding: '25px', marginBottom: '30px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Order ID</span>
                        <span style={{ fontWeight: 700 }}>#{(placedOrder.id || placedOrder._id)?.toString().slice(-8).toUpperCase()}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Total Paid</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${placedOrder.total?.toFixed(2)}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Payment</span>
                        <span style={{ fontWeight: 700 }}>{PAYMENT_METHODS.find(p => p.id === placedOrder.paymentMethod)?.label || placedOrder.paymentMethod}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Deliver to</span>
                        <span style={{ fontWeight: 700 }}>{placedOrder.shippingAddress?.city}, {placedOrder.shippingAddress?.pincode}</span>
                    </div>
                </div>
            </div>
        )}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button onClick={onTrackOrders} className="btn btn-primary" style={{ padding: '14px 30px' }}>Track Orders</button>
            <button onClick={onContinueShopping} className="btn btn-outline" style={{ padding: '14px 30px' }}>Continue Shopping</button>
        </div>
    </div>
);

// ─── ORDER SUMMARY SIDEBAR ────────────────────────────────────────────────────
const OrderSummary = ({ cart, cartTotal, shipping, finalTotal }) => (
    <aside>
        <div className="checkout-card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Summary</h3>
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '20px' }}>
                {cart.map(item => (
                    <div key={item.id || item._id} style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#000', flexShrink: 0, border: '1px solid var(--border)' }}>
                            <img src={getProductImage(item) || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</p>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? 'var(--accent)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                    <span>Total</span><span style={{ color: 'var(--accent)' }}>${finalTotal.toFixed(2)}</span>
                </div>
            </div>
            {shipping === 0 && <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, marginTop: '10px', textAlign: 'center' }}>🎉 You get FREE shipping!</p>}
        </div>
    </aside>
);

// ─── MAIN CHECKOUT ────────────────────────────────────────────────────────────
const Checkout = () => {
    const { cart, cartTotal, user, clearCart, logoutUser } = useAppContext();
    const { showToast } = useUIContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addrForm, setAddrForm] = useState({ ...EMPTY_ADDR });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [placedOrder, setPlacedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    const shipping = cartTotal > 150 ? 0 : 15;
    const finalTotal = cartTotal + shipping;

    const refreshAddresses = useCallback(async () => {
        const fresh = await fetchData('/addresses');
        setAddresses(fresh);
        return fresh;
    }, []);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (cart.length === 0) { navigate('/cart'); return; }
        fetchData('/addresses')
            .then(data => {
                setAddresses(data);
                const def = data.find(a => a.isDefault) || data[0];
                if (def) setSelectedAddressId(def.id || def._id);
                if (data.length === 0) setShowAddForm(true);
            })
            .catch(() => showToast('Failed to load addresses', 'error'))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    // Single onChange handler for all address form fields
    const handleAddrChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setAddrForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }, []);

    const handleLabelClick = useCallback((lbl) => {
        setAddrForm(prev => ({ ...prev, label: lbl }));
    }, []);

    const handleSaveAddress = useCallback(async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await fetchData(`/addresses/${editingId}`, { method: 'PUT', body: JSON.stringify(addrForm) });
                showToast('Address updated', 'success');
            } else {
                const created = await fetchData('/addresses', { method: 'POST', body: JSON.stringify(addrForm) });
                setSelectedAddressId(created.id || created._id);
                showToast('Address added', 'success');
            }
            await refreshAddresses();
            setShowAddForm(false);
            setEditingId(null);
            setAddrForm({ ...EMPTY_ADDR });
        } catch {
            showToast('Failed to save address', 'error');
        }
    }, [addrForm, editingId, refreshAddresses, showToast]);

    const handleDeleteAddress = useCallback(async (id) => {
        try {
            await fetchData(`/addresses/${id}`, { method: 'DELETE' });
            const fresh = await refreshAddresses();
            if (selectedAddressId === id) {
                const def = fresh.find(a => a.isDefault) || fresh[0];
                setSelectedAddressId(def ? (def.id || def._id) : null);
            }
            showToast('Address removed', 'success');
        } catch {
            showToast('Failed to delete address', 'error');
        }
    }, [selectedAddressId, refreshAddresses, showToast]);

    const handleSetDefault = useCallback(async (id) => {
        try {
            await fetchData(`/addresses/${id}/default`, { method: 'PATCH' });
            await refreshAddresses();
        } catch {
            showToast('Failed to set default', 'error');
        }
    }, [refreshAddresses, showToast]);

    const handleEditClick = useCallback((addr) => {
        setEditingId(addr.id || addr._id);
        setAddrForm({ label: addr.label, name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault });
        setShowAddForm(true);
    }, []);

    const handleCancelForm = useCallback(() => {
        setShowAddForm(false);
        setEditingId(null);
        setAddrForm({ ...EMPTY_ADDR });
    }, []);

    const handleAddNew = useCallback(() => {
        setAddrForm({ ...EMPTY_ADDR });
        setEditingId(null);
        setShowAddForm(true);
    }, []);

    const handlePlaceOrder = useCallback(async () => {
        const addr = addresses.find(a => (a.id || a._id) === selectedAddressId);
        if (!addr) { showToast('Please select a delivery address', 'error'); return; }
        setPlacing(true);
        try {
            const orderData = {
                items: cart.map(item => ({ productId: item.id || item._id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
                total: finalTotal,
                shippingAddress: { name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country },
                paymentMethod
            };
            const order = await fetchData('/orders', { method: 'POST', body: JSON.stringify(orderData) });
            clearCart();
            setPlacedOrder(order);
            setStep(2);
        } catch (err) {
            const msg = err.message || '';
            if (msg.toLowerCase().includes('token')) { logoutUser(); navigate('/login'); }
            else showToast('Failed to place order: ' + msg, 'error');
        } finally {
            setPlacing(false);
        }
    }, [addresses, selectedAddressId, cart, finalTotal, paymentMethod, clearCart, logoutUser, navigate, showToast]);

    if (!user) return null;

    const selectedAddr = addresses.find(a => (a.id || a._id) === selectedAddressId);

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '120px' }}>
            <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>Secure Checkout</span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', marginBottom: '40px' }}>Checkout</h1>
            </div>

            <StepBar step={step} />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', fontWeight: 800 }}>LOADING...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: step === 2 ? '1fr' : '1fr 380px', gap: '60px', alignItems: 'start' }}>
                    <div>
                        {step === 0 && (
                            <StepAddress
                                addresses={addresses}
                                selectedAddressId={selectedAddressId}
                                showAddForm={showAddForm}
                                addrForm={addrForm}
                                editingId={editingId}
                                onSelect={setSelectedAddressId}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteAddress}
                                onSetDefault={handleSetDefault}
                                onAddrChange={handleAddrChange}
                                onLabelClick={handleLabelClick}
                                onSaveAddress={handleSaveAddress}
                                onCancelForm={handleCancelForm}
                                onAddNew={handleAddNew}
                                onContinue={() => setStep(1)}
                            />
                        )}
                        {step === 1 && (
                            <StepPayment
                                selectedAddr={selectedAddr}
                                paymentMethod={paymentMethod}
                                placing={placing}
                                finalTotal={finalTotal}
                                onChangeAddr={() => setStep(0)}
                                onPaymentChange={setPaymentMethod}
                                onPlaceOrder={handlePlaceOrder}
                            />
                        )}
                        {step === 2 && (
                            <StepConfirmation
                                placedOrder={placedOrder}
                                onTrackOrders={() => navigate('/orders')}
                                onContinueShopping={() => navigate('/shop')}
                            />
                        )}
                    </div>
                    {step !== 2 && (
                        <OrderSummary cart={cart} cartTotal={cartTotal} shipping={shipping} finalTotal={finalTotal} />
                    )}
                </div>
            )}
        </div>
    );
};

export default Checkout;

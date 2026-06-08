import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useUIContext } from '../context/UIContext';
import { getProductImage } from '../utils/racketImages';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, user, clearCart, logoutUser } = useAppContext();
    const navigate = useNavigate();
    const { showToast } = useUIContext();

    const handleCheckout = () => {
        if (!user) {
            showToast('Please sign in to complete your order.', 'info');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '150px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px' }}>Your Cart is Empty</h2>
                <p style={{ marginBottom: '40px', color: 'var(--text-dim)', fontSize: '1.2rem' }}>Looks like you haven't added any gear to your cart yet.</p>
                <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
            <div className="cart-header">
                <h1 style={{ fontSize: '3rem', fontWeight: 900 }}>Shopping Cart</h1>
                <p style={{ color: 'var(--text-dim)' }}>{cart.length} items in your bag</p>
            </div>

            <div className="cart-grid">
                <div className="cart-list">
                    {cart.map(item => {
                        const itemId = item.id || item._id;
                        return (
                            <div key={itemId} className="cart-item">
                                <div className="cart-item-img">
                                    <img src={getProductImage(item) || item.image} alt={item.name} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '5px' }}>{item.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '15px' }}>Unit Price: ${item.price}</p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#000', padding: '8px 15px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                            <button onClick={() => updateQuantity(itemId, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 900 }}>-</button>
                                            <span style={{ fontWeight: 900, fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(itemId, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 900 }}>+</button>
                                        </div>
                                        <span className="remove-link" onClick={() => removeFromCart(itemId)} style={{ cursor: 'pointer' }}>Remove</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <aside>
                    <div className="checkout-card">
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '30px' }}>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-dim)', fontWeight: 600 }}>
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: 'var(--text-dim)', fontWeight: 600 }}>
                            <span>Shipping</span>
                            <span style={{ color: 'var(--accent)' }}>{cartTotal > 150 ? 'FREE' : '$15.00'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '25px', borderTop: '1px solid var(--border)', marginBottom: '35px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>Total</span>
                            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)' }}>${(cartTotal > 150 ? cartTotal : cartTotal + 15).toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Checkout Now
                        </button>
                        <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <img src="https://img.icons8.com/color/48/000000/visa.png" width="32" style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.15)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} alt="visa" />
                            <img src="https://img.icons8.com/color/48/000000/mastercard.png" width="32" style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.15)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} alt="mastercard" />
                            <img src="https://img.icons8.com/color/48/000000/apple-pay.png" width="32" style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.15)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} alt="applepay" />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Cart;

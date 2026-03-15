import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const CheckoutSummary = () => {
    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        const storedAddress = localStorage.getItem('checkoutAddress');
        
        if (!storedCart || JSON.parse(storedCart).length === 0) {
            navigate('/market');
            return;
        }
        if (!storedAddress) {
            navigate('/checkout-address');
            return;
        }

        setCartItems(JSON.parse(storedCart));
        setAddress(JSON.parse(storedAddress));
    }, [navigate]);

    const subtotal = cartItems.reduce((acc, it) => acc + (it.pricePerKg * it.quantityKg), 0);
    const delivery = 50;
    const total = subtotal + delivery;

    const handleProceedToPayment = () => {
        // Save final totals
        localStorage.setItem('checkoutTotal', JSON.stringify({ subtotal, delivery, total }));
        navigate('/checkout-payment');
    };

    if (!address) return null;

    return (
        <div className="checkout-container">
            <div className="checkout-steps">
                <div className="step done">1. Address ✅</div>
                <div className="step active">2. Summary</div>
                <div className="step">3. Payment</div>
            </div>

            <div className="checkout-card">
                <h2>Order Summary</h2>
                
                <div className="summary-section">
                    <h3>Delivery To:</h3>
                    <div className="address-preview">
                        <strong>{address.fullName}</strong>
                        <p>{address.house}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
                        <p>Phone: {address.phone}</p>
                    </div>
                </div>

                <div className="summary-section">
                    <h3>Your Items:</h3>
                    {cartItems.map(it => (
                        <div className="summary-item" key={it._id}>
                            <div className="item-info">
                                <strong>{it.name}</strong>
                                <span>{it.quantityKg}kg x ₹{it.pricePerKg}</span>
                            </div>
                            <div className="item-price">₹{it.pricePerKg * it.quantityKg}</div>
                        </div>
                    ))}
                </div>

                <div className="total-breakdown">
                    <div className="breakdown-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                    </div>
                    <div className="breakdown-row">
                        <span>Delivery Charge</span>
                        <span>₹{delivery}</span>
                    </div>
                    <div className="breakdown-row total">
                        <span>Total Payble</span>
                        <span>₹{total}</span>
                    </div>
                </div>

                <div className="checkout-footer">
                    <button className="back-btn" onClick={() => navigate('/checkout-address')}>Back</button>
                    <button className="continue-btn" onClick={handleProceedToPayment}>Proceed to Payment</button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;

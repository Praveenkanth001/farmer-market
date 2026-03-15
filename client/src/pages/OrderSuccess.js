import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="checkout-container">
            <div className="checkout-card success-card">
                <div className="success-icon">🎉</div>
                <h1>Order Placed Successfully!</h1>
                <p>Thank you for supporting our local farmers. Your fresh produce will be delivered soon.</p>
                
                <div className="success-actions">
                    <button className="primary-btn" onClick={() => navigate('/my-orders')}>View My Orders</button>
                    <button className="secondary-btn" onClick={() => navigate('/market')}>Continue Shopping</button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;

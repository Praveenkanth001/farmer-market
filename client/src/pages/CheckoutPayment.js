import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Checkout.css';

const CheckoutPayment = () => {
    const [loading, setLoading] = useState(false);
    const [totalData, setTotalData] = useState(null);
    const [address, setAddress] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const storedTotal = localStorage.getItem('checkoutTotal');
        const storedAddress = localStorage.getItem('checkoutAddress');
        const storedCart = localStorage.getItem('cart');

        if (!storedTotal || !storedAddress || !storedCart) {
            navigate('/market');
            return;
        }

        setTotalData(JSON.parse(storedTotal));
        setAddress(JSON.parse(storedAddress));
        setCartItems(JSON.parse(storedCart));
    }, [navigate]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const firstItemFarmer = cartItems[0].farmer;
            const farmerId = typeof firstItemFarmer === 'object' ? firstItemFarmer._id : firstItemFarmer;

            const orderPayload = {
                amount: totalData.total,
                farmerId: farmerId,
                items: cartItems.map(it => ({
                    productId: it._id,
                    name: it.name,
                    image: it.image,
                    quantityKg: it.quantityKg,
                    pricePerKg: it.pricePerKg
                })),
                address: {
                    fullName: address.fullName,
                    phone: address.phone,
                    house: address.house,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode
                }
            };

            const { data } = await api.post('/payment/create-order', orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // HANDLE SIMULATION MODE
            if (data.isSimulation) {
                if (window.confirm("🏗️ Demo Mode: Would you like to simulate a successful payment?")) {
                    const verifyPayload = {
                        razorpay_order_id: data.orderId,
                        razorpay_payment_id: "pay_simulated_123",
                        dbOrderId: data.dbOrderId,
                        isSimulation: true
                    };
                    await api.post('/payment/verify', verifyPayload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    localStorage.removeItem('cart');
                    localStorage.removeItem('checkoutTotal');
                    localStorage.removeItem('checkoutAddress');
                    navigate('/order-success');
                    return;
                }
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_dummykey123",
                amount: data.amount,
                currency: data.currency,
                name: "Farmers Market",
                description: "Purchase fresh crops",
                order_id: data.orderId,
                handler: async (response) => {
                    try {
                        const verifyPayload = {
                            ...response,
                            dbOrderId: data.dbOrderId
                        };
                        await api.post('/payment/verify', verifyPayload, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        localStorage.removeItem('cart');
                        localStorage.removeItem('checkoutTotal');
                        localStorage.removeItem('checkoutAddress');
                        navigate('/order-success');
                    } catch (err) {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: address.fullName,
                    contact: address.phone
                },
                theme: { color: "#059669" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Failed to initiate payment. Check server logs.");
        } finally {
            setLoading(false);
        }
    };

    if (!totalData) return null;

    return (
        <div className="checkout-container">
            <div className="checkout-steps">
                <div className="step done">1. Address ✅</div>
                <div className="step done">2. Summary ✅</div>
                <div className="step active">3. Payment</div>
            </div>

            <div className="checkout-card payment-card">
                <div className="payment-icon">💳</div>
                <h2>Secure Payment</h2>
                <p>You are about to pay <strong>₹{totalData.total}</strong> for your fresh produce.</p>
                
                <div className="payment-methods">
                    <div className="method selected">
                        <span>Digital Payment (Cards, UPI, Netbanking)</span>
                        <div className="check-icon">✔</div>
                    </div>
                </div>

                <div className="checkout-footer">
                    <button className="back-btn" onClick={() => navigate('/checkout-summary')}>Back</button>
                    <button 
                        className="pay-btn" 
                        onClick={handlePayment} 
                        disabled={loading}
                    >
                        {loading ? "Initializing..." : `Pay ₹${totalData.total}`}
                    </button>
                </div>
                
                <p className="payment-note">Your payment is encrypted and secure.</p>
            </div>
        </div>
    );
};

export default CheckoutPayment;

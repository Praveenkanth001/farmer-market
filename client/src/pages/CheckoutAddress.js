import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Checkout.css';

const CheckoutAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', house: '', street: '', city: '', state: '', pincode: '' });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/market');
            return;
        }
        fetchAddresses();
    }, [token, navigate]);

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/address/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(res.data);
            if (res.data.length > 0) setSelectedId(res.data.find(a => a.isDefault)?._id || res.data[0]._id);
        } catch (err) {
            console.error("Fetch addresses error:", err);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/address/add', newAddr, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses([...addresses, res.data]);
            setSelectedId(res.data._id);
            setShowForm(false);
            setNewAddr({ fullName: '', phone: '', house: '', street: '', city: '', state: '', pincode: '' });
        } catch (err) {
            console.error("Add address error:", err);
            alert(err.response?.data?.message || "Error adding address");
        }
    };

    const handleContinue = () => {
        if (!selectedId) return alert("Please select a delivery address");
        const selected = addresses.find(a => a._id === selectedId);
        localStorage.setItem('checkoutAddress', JSON.stringify(selected));
        navigate('/checkout-summary');
    };

    return (
        <div className="checkout-container">
            <div className="checkout-steps">
                <div className="step active">1. Address</div>
                <div className="step">2. Summary</div>
                <div className="step">3. Payment</div>
            </div>

            <div className="checkout-card">
                <h2>Select Delivery Address</h2>
                
                <div className="address-list">
                    {addresses.map(addr => (
                        <div key={addr._id} className={`address-item ${selectedId === addr._id ? 'selected' : ''}`} onClick={() => setSelectedId(addr._id)}>
                            <div className="radio-circle"></div>
                            <div className="addr-details">
                                <strong>{addr.fullName}</strong>
                                <p>{addr.house}, {addr.street}</p>
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p>Phone: {addr.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {!showForm ? (
                    <button className="add-addr-btn" onClick={() => setShowForm(true)}>+ Add New Address</button>
                ) : (
                    <form className="addr-form" onSubmit={handleAddAddress}>
                        <input type="text" placeholder="Full Name" value={newAddr.fullName} required onChange={e => setNewAddr({...newAddr, fullName: e.target.value})} />
                        <input type="text" placeholder="Phone Number" value={newAddr.phone} required onChange={e => setNewAddr({...newAddr, phone: e.target.value})} />
                        <input type="text" placeholder="House/Flat No" value={newAddr.house} required onChange={e => setNewAddr({...newAddr, house: e.target.value})} />
                        <input type="text" placeholder="Street/Area" value={newAddr.street} required onChange={e => setNewAddr({...newAddr, street: e.target.value})} />
                        <div className="input-row">
                            <input type="text" placeholder="City" value={newAddr.city} required onChange={e => setNewAddr({...newAddr, city: e.target.value})} />
                            <input type="text" placeholder="State" value={newAddr.state} required onChange={e => setNewAddr({...newAddr, state: e.target.value})} />
                        </div>
                        <input type="text" placeholder="Pincode" value={newAddr.pincode} required onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} />
                        <div className="form-actions">
                            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="save-btn">Save Address</button>
                        </div>
                    </form>
                )}

                <div className="checkout-footer">
                    <button className="continue-btn" onClick={handleContinue}>Continue to Summary</button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutAddress;

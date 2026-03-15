import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error("Order fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#10b981';
            case 'shipped': return '#3b82f6';
            case 'delivered': return '#059669';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div className="orders-wrapper">
            <Navbar />
            <div className="orders-container">
                <h1>My Orders</h1>
                {loading ? (
                    <div className="orders-loading">📦 Tracking your produce...</div>
                ) : orders.length === 0 ? (
                    <div className="no-orders">
                        <p>No orders yet. Head to the market to support our farmers!</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id-date">
                                        <span className="order-id">Order ID: {order._id.slice(-8).toUpperCase()}</span>
                                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="order-status" style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                                        {order.orderStatus.toUpperCase()}
                                    </div>
                                </div>
                                
                                <div className="order-info">
                                    <div className="info-group">
                                        <p className="label">Farmer</p>
                                        <p className="value">{order.farmer?.name || 'Local Farmer'}</p>
                                    </div>
                                    <div className="info-group">
                                        <p className="label">Total Amount</p>
                                        <p className="value price">₹{order.totalAmount}</p>
                                    </div>
                                    <div className="info-group">
                                        <p className="label">Payment</p>
                                        <p className={`value payment ${order.paymentStatus}`}>{order.paymentStatus.toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            <span>{item.name}</span>
                                            <span>{item.quantityKg}kg x ₹{item.pricePerKg}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-delivery">
                                    <p className="label">Delivery Address</p>
                                    <p className="addr-preview">{order.address?.fullName || 'N/A'}, {order.address?.city || ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;

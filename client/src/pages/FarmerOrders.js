import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import './MyOrders.css'; // Reusing styles

const FarmerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/farmer-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
            
            // Mark all notifications as read
            const notifs = await api.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            for (const n of notifs.data) {
                if (!n.read) {
                    await api.patch(`/notifications/${n._id}/read`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }
        } catch (err) {
            console.error("Farmer order fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/status/${orderId}`, 
                { orderStatus: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders(); // Refresh list
            alert(`Order marked as ${newStatus}`);
        } catch (err) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="orders-wrapper">
            <Navbar />
            <div className="orders-container">
                <h1>Incoming Orders</h1>
                {loading ? (
                    <div className="orders-loading">📦 Fetching your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="no-orders">
                        <p>No orders yet. Your produce is waiting for its first buyer!</p>
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
                                    <select 
                                        className="status-select"
                                        value={order.orderStatus}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <div className="order-info">
                                    <div className="info-group">
                                        <p className="label">Buyer</p>
                                        <p className="value">{order.buyer?.name}</p>
                                        <p className="addr-preview">{order.buyer?.phone}</p>
                                    </div>
                                    <div className="info-group">
                                        <p className="label">Amount</p>
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
                                            <span>{item.quantityKg}kg</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-delivery">
                                    <p className="label">Delivery To</p>
                                    <p className="addr-preview">
                                        {order.address?.fullName || 'N/A'}, {order.address?.house || ''}, {order.address?.street || ''}, {order.address?.city || ''}, {order.address?.pincode || ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerOrders;

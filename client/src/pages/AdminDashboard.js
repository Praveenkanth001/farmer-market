import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalFarmers: 0, totalBuyers: 0, totalProducts: 0, totalScans: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Security Check
        if (userRole !== 'admin') {
            navigate('/');
            return;
        }

        fetchData();
    }, [userRole, navigate]);

    const fetchData = async () => {
        if (!token) {
            console.error("❌ No token found in localStorage");
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            console.log("📡 Admin Fetching Data...");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [statsRes, usersRes, productsRes, reportsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', config),
                axios.get('http://localhost:5000/api/admin/users', config),
                axios.get('http://localhost:5000/api/admin/products', config),
                axios.get('http://localhost:5000/api/admin/reports', config)
            ]);

            console.log("✅ Stats:", statsRes.data);
            console.log("✅ Users Count:", usersRes.data.length);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setProducts(productsRes.data);
            setReports(reportsRes.data);
        } catch (err) {
            console.error("❌ Admin Data Fetch Error:", err);
            if(err.response?.status === 401 || err.response?.status === 403) {
                console.warn("🔐 Unauthorized - Clearing session");
                localStorage.clear();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== id));
            alert("User deleted successfully");
        } catch (err) {
            alert("Error deleting user");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to remove this product?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(products.filter(p => p._id !== id));
            alert("Product removed");
        } catch (err) {
            alert("Error deleting product");
        }
    };

    if (loading) return <div className="admin-loading">🛡️ Securing Admin Access...</div>;

    return (
        <div className="admin-dashboard">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <span className="logo-icon">🌿</span>
                    <h2>Agri Admin</h2>
                </div>
                <nav>
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 Users</button>
                    <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>🌾 Products</button>
                    <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>🩺 AI Reports</button>
                </nav>
                <div className="admin-footer">
                    <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>🚪 Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                <header>
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <div className="admin-user-info">
                        <span>Logged in as <b>Administrator</b></span>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <div className="overview-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👨‍🌾</div>
                                <div className="stat-info">
                                    <h3>Total Farmers</h3>
                                    <p>{stats.totalFarmers}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🛒</div>
                                <div className="stat-info">
                                    <h3>Total Buyers</h3>
                                    <p>{stats.totalBuyers}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <h3>Total Orders</h3>
                                    <p>{stats.totalOrders || 0}</p>
                                </div>
                            </div>
                            <div className="stat-card revenue">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Total Revenue</h3>
                                    <p>₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="stat-card warning">
                                <div className="stat-icon">🚚</div>
                                <div className="stat-info">
                                    <h3>Pending Deliveries</h3>
                                    <p>{stats.pendingDeliveries || 0}</p>
                                </div>
                            </div>
                            <div className="stat-card danger">
                                <div className="stat-icon">❌</div>
                                <div className="stat-info">
                                    <h3>Failed Payments</h3>
                                    <p>{stats.failedPayments || 0}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🧪</div>
                                <div className="stat-info">
                                    <h3>AI Scans</h3>
                                    <p>{stats.totalScans}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Farmer</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id}>
                                            <td>{p.name}</td>
                                            <td>{p.category}</td>
                                            <td>{p.farmer?.name || 'Unknown'}</td>
                                            <td>₹{p.price}/{p.unit}</td>
                                            <td>
                                                <button className="delete-btn" onClick={() => handleDeleteProduct(p._id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="reports-grid">
                            {reports.map(report => (
                                <div className="report-card" key={report._id}>
                                    <div className="report-header">
                                        <span className="report-date">{new Date(report.timestamp).toLocaleDateString()}</span>
                                        <span className="report-conf">{(report.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="report-user">👤 {report.user?.name || 'Guest'}</div>
                                    <div className="report-diag">🩺 {report.diagnosisEn}</div>
                                    <p className="report-crop">📍 Crop: {report.crop}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

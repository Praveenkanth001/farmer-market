import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ProductList from './pages/ProductList';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import BuyerLogin from './pages/BuyerLogin';
import FarmerLogin from './pages/FarmerLogin';
import Register from './pages/Register';
import FarmersPage from './pages/FarmersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProfile from './pages/FarmerProfile';
import ProductDetail from './ProductDetail';

import VoiceUI from './components/VoiceUI';
import AiPriceAdvisor from './pages/AiPriceAdvisor';
function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/market" element={<ProductList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth Routes */}
        <Route path="/buyer-login" element={<BuyerLogin />} />
        <Route path="/farmer-login" element={<FarmerLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Protected / Dashboard Routes */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />

        {/* ✅ NEW: Farmers Section */}
        {/* List of all farmers */}
        <Route path="/farmers" element={<FarmersPage />} />

        {/* Single Farmer Profile - Route must be 'farmers' to match the Link */}
        <Route path="/farmers/:id" element={<FarmerProfile />} />

        {/* Product Details */}
        <Route path="/product/:productId" element={<ProductDetail />} />

        {/* AI Price Advisor */}
        <Route path="/ai-price" element={<AiPriceAdvisor />} />
      </Routes>

      {/* 🚀 Global AgriForge Voice UI */}
      <VoiceUI />
    </div>
  );
}

export default App;

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State for editing
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    location: '',
    phone: ''
  });

  useEffect(() => {
    // Load user from local storage initially
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setEditForm({
        name: storedUser.name || '',
        email: storedUser.email || '',
        location: storedUser.location || '',
        phone: storedUser.phone || ''
      });
    }
  }, []);

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Call API to update profile
      // Note: You need to ensure your backend has a PUT /api/auth/profile route or similar
      // If not, you might need to create it. For now, we simulate update locally.
      
      const res = await api.put('/auth/profile', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local storage and state with new data
      const updatedUser = { ...user, ...res.data }; 
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile. (Check if backend route exists)');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-emerald-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-emerald-900 mb-6">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900">{user.name}</h2>
                <p className="text-emerald-600 capitalize">{user.role}</p>
              </div>
            </div>
            
            {/* Edit Button */}
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Email Address</p>
              <p className="font-medium text-emerald-900">{user.email}</p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Location</p>
              <p className="font-medium text-emerald-900">{user.location || 'Not set'}</p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Phone Number</p>
              <p className="font-medium text-emerald-900">{user.phone || 'Not set'}</p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Account ID</p>
              <p className="font-mono text-emerald-700">{user.id || user._id}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
              <h3 className="text-lg font-bold text-emerald-900">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input 
                  name="email"
                  value={editForm.email}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input 
                  name="location"
                  value={editForm.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Perambalur"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

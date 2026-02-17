import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../utils/api';
import { 
  User, Mail, CreditCard, Wallet, Shield, 
  CheckCircle, AlertCircle, Edit2, Save, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    voter_id: user?.voter_id || '',
    wallet_address: user?.wallet_address || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      voter_id: user?.voter_id || '',
      wallet_address: user?.wallet_address || ''
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <div className="ml-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {user?.is_verified ? (
                <span className="badge badge-success flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Voter</span>
                </span>
              ) : (
                <span className="badge badge-warning flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Pending Verification</span>
                </span>
              )}
              {user?.is_admin && (
                <span className="badge badge-info flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.full_name}</span>
                  </div>
                )}
              </div>

              {/* Voter ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voter ID / Aadhar / College ID
                </label>
                {editing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.voter_id}
                      onChange={(e) => setFormData({ ...formData, voter_id: e.target.value })}
                      className="input-field pl-10"
                      placeholder="Enter your official ID"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className={user?.voter_id ? 'text-gray-900' : 'text-gray-400'}>
                      {user?.voter_id || 'Not provided'}
                    </span>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Required for voter verification
                </p>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address (Optional)
                </label>
                {editing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.wallet_address}
                      onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                      className="input-field pl-10"
                      placeholder="0x..."
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Wallet className="w-5 h-5 text-gray-400" />
                    <span className={user?.wallet_address ? 'text-gray-900 font-mono text-sm' : 'text-gray-400'}>
                      {user?.wallet_address || 'Not connected'}
                    </span>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  For blockchain-based voting verification
                </p>
              </div>

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">
                    {new Date(user?.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex space-x-3 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Verification Notice */}
        {!user?.is_verified && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Verification Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account needs to be verified by an administrator before you can vote. 
                Please ensure you have provided a valid official ID above. Once verified, 
                you will be able to participate in all active elections.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { electionsAPI, adminAPI } from '../utils/api';
import {
  Shield, Users, Vote, Plus, CheckCircle, XCircle,
  Calendar, Clock, Trash2, Edit, UserCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

// Helper function to check if any election has ended
const hasAnyElectionEnded = (elections) => {
  if (!elections || elections.length === 0) return false;
  const now = new Date();
  return elections.some(election => new Date(election.end_time) < now);
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('elections');
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  // Form states
  const [electionForm, setElectionForm] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: ''
  });
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    party: '',
    description: ''
  });

  useEffect(() => {
    if (activeTab === 'elections') {
      fetchElections();
    } else {
      fetchUsersAndElections();
    }
  }, [activeTab]);

  // Fetch both users and elections for the users tab
  const fetchUsersAndElections = async () => {
    setLoading(true);
    try {
      const [usersResponse, electionsResponse] = await Promise.all([
        adminAPI.getUsers(),
        electionsAPI.getAll()
      ]);
      setUsers(usersResponse.data.users);
      setElections(electionsResponse.data.elections);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    setLoading(true);
    try {
      const response = await electionsAPI.getAll();
      setElections(response.data.elections);
    } catch (error) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await electionsAPI.create(electionForm);
      toast.success('Election created successfully');
      setShowCreateModal(false);
      setElectionForm({ name: '', description: '', start_time: '', end_time: '' });
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create election');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await electionsAPI.addCandidate(selectedElection.id, candidateForm);
      toast.success('Candidate added successfully');
      setShowCandidateModal(false);
      setCandidateForm({ name: '', party: '', description: '' });
      fetchElections();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add candidate');
    }
  };

  const handleToggleElection = async (electionId) => {
    try {
      await electionsAPI.toggle(electionId);
      toast.success('Election status updated');
      fetchElections();
    } catch (error) {
      toast.error('Failed to update election');
    }
  };

  const handleVerifyVoter = async (userId) => {
    try {
      await adminAPI.verifyVoter(userId);
      toast.success('Voter verified successfully');
      fetchUsersAndElections();
    } catch (error) {
      toast.error('Failed to verify voter');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`⚠️ Delete User\n\nAre you sure you want to delete "${userName}"?\n\nThis action cannot be undone!`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(userId);
      toast.success(`User "${userName}" deleted successfully`);
      fetchUsersAndElections();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading message="Loading admin panel..." />;
  }

  return (
    <div className="min-h-screen bg-dark-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400">Manage elections and voters</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('elections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'elections'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
            >
              <div className="flex items-center space-x-2">
                <Vote className="w-5 h-5" />
                <span>Elections</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Elections Tab */}
        {activeTab === 'elections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Elections</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Election</span>
              </button>
            </div>

            {elections.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">No Elections</h3>
                <p className="text-gray-500 mt-2">Create your first election to get started</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Candidates</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {elections.map((election) => (
                      <tr key={election.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{election.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{election.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{formatDateTime(election.start_time)}</p>
                            <p className="text-gray-500">to {formatDateTime(election.end_time)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900">{election.candidates?.length || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${election.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {election.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedElection(election);
                                setShowCandidateModal(true);
                              }}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Add Candidate"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleElection(election.id)}
                              className={`p-2 rounded-lg transition-colors ${election.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                                }`}
                              title={election.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {election.is_active ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Users</h2>

            {users.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">No Users</h3>
                <p className="text-gray-500 mt-2">Users will appear here once they register</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Voter ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{user.voter_id || 'Not provided'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`badge ${user.is_verified ? 'badge-success' : 'badge-warning'}`}>
                              {user.is_verified ? 'Verified' : 'Pending'}
                            </span>
                            {user.is_admin && (
                              <span className="badge badge-info">Admin</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {!user.is_verified && (
                              <button
                                onClick={() => handleVerifyVoter(user.id)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span>Verify</span>
                              </button>
                            )}
                            {/* Delete button - only visible after election ends */}
                            {user.is_verified && !user.is_admin && hasAnyElectionEnded(elections) && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                className="group flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-rose-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                title="Delete user for safety after election"
                              >
                                <Trash2 className="w-4 h-4 group-hover:animate-pulse" />
                                <span className="font-medium">Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Election</h3>
            <form onSubmit={handleCreateElection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Name
                </label>
                <input
                  type="text"
                  required
                  value={electionForm.name}
                  onChange={(e) => setElectionForm({ ...electionForm, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Student Council Election 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={electionForm.description}
                  onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of the election"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={electionForm.start_time}
                    onChange={(e) => setElectionForm({ ...electionForm, start_time: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={electionForm.end_time}
                    onChange={(e) => setElectionForm({ ...electionForm, end_time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showCandidateModal && selectedElection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add Candidate</h3>
            <p className="text-gray-600 mb-4">Adding to: {selectedElection.name}</p>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Full name of the candidate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party/Group (Optional)
                </label>
                <input
                  type="text"
                  value={candidateForm.party}
                  onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Independent, Student Union"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={candidateForm.description}
                  onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Brief info about the candidate"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCandidateModal(false);
                    setSelectedElection(null);
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { electionsAPI } from '../utils/api';
import { 
  Vote, CheckCircle, AlertCircle, ArrowLeft, User, 
  Shield, Clock, Calendar 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const VotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    fetchElectionData();
  }, [id]);

  const fetchElectionData = async () => {
    try {
      // Fetch election details
      const electionRes = await electionsAPI.getOne(id);
      setElection(electionRes.data.election);
      setCandidates(electionRes.data.election.candidates || []);
      
      // Check if user has voted
      const votedRes = await electionsAPI.hasVoted(id);
      setHasVoted(votedRes.data.has_voted);
      
      if (votedRes.data.has_voted) {
        toast.error('You have already voted in this election');
        navigate(`/elections/${id}`);
      }
    } catch (error) {
      console.error('Error fetching election:', error);
      toast.error('Failed to load election data');
      navigate('/elections');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    setSubmitting(true);
    
    try {
      await electionsAPI.vote(id, selectedCandidate);
      toast.success('Your vote has been recorded successfully!');
      navigate(`/elections/${id}`, { state: { voted: true } });
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cast vote';
      toast.error(message);
    } finally {
      setSubmitting(false);
      setConfirmModal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading message="Loading election..." />;
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Election Not Found</h2>
          <button
            onClick={() => navigate('/elections')}
            className="mt-4 btn-primary"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/elections')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Elections</span>
        </button>

        {/* Election Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{election.name}</h1>
              {election.description && (
                <p className="text-gray-600 mt-2">{election.description}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Vote className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Starts: {formatDate(election.start_time)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Ends: {formatDate(election.end_time)}</span>
            </div>
          </div>
        </div>

        {/* Voter Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Voting as: {user?.full_name}</h3>
            <p className="text-sm text-blue-700 mt-1">
              Your vote will be securely recorded on the blockchain. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Candidates */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Your Candidate
          </h2>
          
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No candidates available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedCandidate === candidate.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {selectedCandidate === candidate.id ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                      {candidate.party && (
                        <p className="text-sm text-gray-600">{candidate.party}</p>
                      )}
                      {candidate.description && (
                        <p className="text-sm text-gray-500 mt-1">{candidate.description}</p>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCandidate === candidate.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedCandidate === candidate.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vote Button */}
          <div className="mt-6">
            <button
              onClick={() => setConfirmModal(true)}
              disabled={!selectedCandidate || submitting}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <Vote className="w-5 h-5" />
              <span>Cast Your Vote</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Your Vote
              </h3>
              <p className="text-gray-600 mb-6">
                You are about to vote for{' '}
                <strong>
                  {candidates.find(c => c.id === selectedCandidate)?.name}
                </strong>
                . This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVote}
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm Vote</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotePage;

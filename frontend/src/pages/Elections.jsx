import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { electionsAPI } from '../utils/api';
import { 
  Vote, Calendar, Clock, Users, ChevronRight, 
  AlertCircle, CheckCircle, XCircle, Timer 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const Elections = () => {
  const { user, isAuthenticated } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votedElections, setVotedElections] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await electionsAPI.getAll();
      setElections(response.data.elections);
      
      // Check voting status for each election if authenticated
      if (isAuthenticated) {
        const votedStatus = {};
        for (const election of response.data.elections) {
          try {
            const voteResponse = await electionsAPI.hasVoted(election.id);
            votedStatus[election.id] = voteResponse.data.has_voted;
          } catch (err) {
            votedStatus[election.id] = false;
          }
        }
        setVotedElections(votedStatus);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);

    if (!election.is_active) {
      return { label: 'Inactive', color: 'badge-danger', icon: XCircle };
    }
    if (now < startTime) {
      return { label: 'Upcoming', color: 'badge-info', icon: Timer };
    }
    if (now > endTime) {
      return { label: 'Ended', color: 'badge-warning', icon: CheckCircle };
    }
    return { label: 'Active', color: 'badge-success', icon: Vote };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canVote = (election) => {
    if (!isAuthenticated || !user?.is_verified) return false;
    
    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);
    
    return election.is_active && 
           now >= startTime && 
           now <= endTime && 
           !votedElections[election.id];
  };

  if (loading) {
    return <Loading message="Loading elections..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
          <p className="text-gray-600 mt-2">
            View all ongoing and upcoming elections
          </p>
        </div>

        {/* Voter Status Banner */}
        {isAuthenticated && !user?.is_verified && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Account Not Verified</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account needs to be verified by an admin before you can vote. 
                Please ensure you have provided a valid official ID in your profile.
              </p>
            </div>
          </div>
        )}

        {/* Elections Grid */}
        {elections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Elections Available</h3>
            <p className="text-gray-500 mt-2">
              There are no elections at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => {
              const status = getElectionStatus(election);
              const StatusIcon = status.icon;
              const hasVoted = votedElections[election.id];
              
              return (
                <div
                  key={election.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden card-hover"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`badge ${status.color} flex items-center space-x-1`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{status.label}</span>
                      </span>
                      {hasVoted && (
                        <span className="badge badge-success flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Voted</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {election.name}
                    </h3>
                    {election.description && (
                      <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                        {election.description}
                      </p>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Starts: {formatDate(election.start_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Ends: {formatDate(election.end_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{election.candidates?.length || 0} Candidates</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    {canVote(election) ? (
                      <Link
                        to={`/elections/${election.id}/vote`}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Cast Your Vote</span>
                      </Link>
                    ) : hasVoted ? (
                      <Link
                        to={`/elections/${election.id}`}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link
                        to={`/elections/${election.id}`}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;

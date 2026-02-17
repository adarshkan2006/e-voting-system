import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { electionsAPI } from '../utils/api';
import {
    Vote, Calendar, Clock, Users, ArrowLeft, Trophy,
    CheckCircle, XCircle, Timer, AlertCircle, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const ElectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [election, setElection] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        fetchElectionDetails();
    }, [id]);

    const fetchElectionDetails = async () => {
        try {
            const response = await electionsAPI.getOne(id);
            setElection(response.data.election);

            // Check if user has voted
            if (isAuthenticated) {
                try {
                    const voteResponse = await electionsAPI.hasVoted(id);
                    setHasVoted(voteResponse.data.has_voted);
                } catch (err) {
                    setHasVoted(false);
                }
            }

            // Fetch results if election has ended
            const endTime = new Date(response.data.election.end_time);
            if (new Date() > endTime) {
                try {
                    const resultsResponse = await electionsAPI.getResults(id);
                    setResults(resultsResponse.data);
                } catch (err) {
                    console.error('Error fetching results:', err);
                }
            }
        } catch (error) {
            console.error('Error fetching election:', error);
            toast.error('Failed to load election details');
            navigate('/elections');
        } finally {
            setLoading(false);
        }
    };

    const getElectionStatus = () => {
        if (!election) return null;
        const now = new Date();
        const startTime = new Date(election.start_time);
        const endTime = new Date(election.end_time);

        if (!election.is_active) {
            return { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: XCircle };
        }
        if (now < startTime) {
            return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Timer };
        }
        if (now > endTime) {
            return { label: 'Ended', color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle };
        }
        return { label: 'Active', color: 'bg-green-100 text-green-800', icon: Vote };
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

    const canVote = () => {
        if (!isAuthenticated || !user?.is_verified || !election) return false;
        const now = new Date();
        const startTime = new Date(election.start_time);
        const endTime = new Date(election.end_time);
        return election.is_active && now >= startTime && now <= endTime && !hasVoted;
    };

    const getWinner = () => {
        if (!results?.results?.length || results.total_votes === 0) return null;
        const winner = results.results.reduce((prev, current) => {
            return (prev.votes > current.votes) ? prev : current;
        }, results.results[0]);
        if (winner.votes === 0) return null;
        return winner;
    };

    if (loading) {
        return <Loading message="Loading election details..." />;
    }

    if (!election) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Election Not Found</h2>
                    <Link to="/elections" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                        Back to Elections
                    </Link>
                </div>
            </div>
        );
    }

    const status = getElectionStatus();
    const StatusIcon = status.icon;
    const winner = results ? getWinner() : null;
    const hasEnded = new Date() > new Date(election.end_time);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/elections"
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Elections</span>
                </Link>

                {/* Election Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${status.color}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span>{status.label}</span>
                                </span>
                                {hasVoted && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Voted</span>
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{election.name}</h1>
                            {election.description && (
                                <p className="text-gray-600 mt-2">{election.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Election Info */}
                    <div className="grid sm:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Start Time</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(election.start_time)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">End Time</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(election.end_time)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <Users className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Candidates</p>
                                <p className="text-sm font-medium text-gray-900">{election.candidates?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vote Button */}
                    {canVote() && (
                        <div className="mt-6">
                            <Link
                                to={`/elections/${id}/vote`}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                <Vote className="w-5 h-5" />
                                <span>Cast Your Vote</span>
                            </Link>
                        </div>
                    )}

                    {/* Not Verified Warning */}
                    {isAuthenticated && !user?.is_verified && !hasEnded && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-yellow-800">Account Not Verified</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Your account needs to be verified by an admin before you can vote.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Candidates List */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <Users className="w-6 h-6 text-primary-600" />
                        <span>Candidates</span>
                    </h2>
                    {election.candidates?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No candidates registered for this election.</p>
                    ) : (
                        <div className="grid gap-4">
                            {election.candidates?.map((candidate) => (
                                <div key={candidate.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                                        {candidate.party && (
                                            <p className="text-sm text-gray-600">{candidate.party}</p>
                                        )}
                                        {candidate.description && (
                                            <p className="text-sm text-gray-500 mt-1">{candidate.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Section (Only shown after election ends) */}
                {hasEnded && results && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <BarChart3 className="w-6 h-6 text-primary-600" />
                            <span>Election Results</span>
                        </h2>

                        {/* Total Votes */}
                        <div className="mb-6 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">Total Votes Cast</span>
                            <span className="text-2xl font-bold text-gray-900">{results.total_votes}</span>
                        </div>

                        {/* Winner Banner */}
                        {winner ? (
                            <div className="p-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl text-white shadow-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                        <Trophy className="w-10 h-10" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium opacity-90 uppercase tracking-wide">🎉 Winner</p>
                                        <p className="text-3xl font-bold mt-1">{winner.candidate.name}</p>
                                        {winner.candidate.party && (
                                            <p className="text-lg opacity-90 mt-1">{winner.candidate.party}</p>
                                        )}
                                        {winner.candidate.description && (
                                            <p className="text-sm opacity-80 mt-2">{winner.candidate.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-bold">{winner.votes}</p>
                                        <p className="text-lg opacity-90">votes</p>
                                        <p className="text-xl font-semibold mt-1">{winner.percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No votes were cast in this election</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Not Available Yet */}
                {!hasEnded && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Results Not Available Yet</h3>
                        <p className="text-gray-500 mt-1">
                            Results will be displayed after the election ends on {formatDate(election.end_time)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionDetails;

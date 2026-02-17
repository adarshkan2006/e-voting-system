import React, { useState, useEffect } from 'react';
import { electionsAPI } from '../utils/api';
import {
  BarChart3, Trophy, Users, Calendar, Clock,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import Loading from '../components/Loading';

const Results = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedElection, setExpandedElection] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await electionsAPI.getAll();
      // Filter to show only ended elections
      const endedElections = response.data.elections.filter(e => {
        return new Date(e.end_time) < new Date();
      });
      setElections(endedElections);
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (electionId) => {
    if (results[electionId]) {
      setExpandedElection(expandedElection === electionId ? null : electionId);
      return;
    }

    try {
      const response = await electionsAPI.getResults(electionId);
      setResults(prev => ({
        ...prev,
        [electionId]: response.data
      }));
      setExpandedElection(electionId);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getWinner = (electionResults) => {
    if (!electionResults?.results?.length) return null;
    // Don't declare a winner if no votes were cast
    if (electionResults.total_votes === 0) return null;

    const winner = electionResults.results.reduce((prev, current) => {
      return (prev.votes > current.votes) ? prev : current;
    }, electionResults.results[0]);

    // Don't declare a winner if the highest vote count is 0
    if (winner.votes === 0) return null;

    return winner;
  };

  if (loading) {
    return <Loading message="Loading results..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
              <p className="text-gray-600">View results of completed elections</p>
            </div>
          </div>
        </div>

        {/* Results List */}
        {elections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Results Available</h3>
            <p className="text-gray-500 mt-2">
              Results will be shown here after elections end.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => {
              const isExpanded = expandedElection === election.id;
              const electionResults = results[election.id];
              const winner = electionResults ? getWinner(electionResults) : null;

              return (
                <div
                  key={election.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Election Header */}
                  <div
                    onClick={() => fetchResults(election.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {election.name}
                          </h3>
                          <span className="badge badge-success">Completed</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(election.start_time)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(election.end_time)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{election.candidates?.length || 0} Candidates</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {winner && (
                          <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-yellow-50 rounded-lg">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                              {winner.candidate.name}
                            </span>
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Results Details */}
                  {isExpanded && electionResults && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50 animate-fade-in">
                      {/* Winner Banner */}
                      {winner && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-xl text-white shadow-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-8 h-8 text-yellow-100" />
                            </div>
                            <div>
                              <p className="text-sm font-medium opacity-90 uppercase tracking-wide">🏆 Winner</p>
                              <p className="text-2xl font-bold">{winner.candidate.name}</p>
                              {winner.candidate.party && (
                                <p className="text-sm opacity-90">{winner.candidate.party}</p>
                              )}
                            </div>
                            <div className="ml-auto text-right">
                              <p className="text-3xl font-bold">{winner.votes}</p>
                              <p className="text-sm opacity-90">votes</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Total Votes */}
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-gray-600">Total Votes Cast</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {electionResults.total_votes}
                        </span>
                      </div>

                      {/* Candidates Results */}
                      <div className="space-y-3">
                        {electionResults.results.map((result, index) => {
                          const percentage = electionResults.total_votes > 0
                            ? ((result.votes / electionResults.total_votes) * 100).toFixed(1)
                            : 0;
                          const isWinner = winner?.candidate.id === result.candidate.id;

                          return (
                            <div
                              key={result.candidate.id}
                              className={`p-4 rounded-xl ${isWinner
                                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 shadow-md'
                                : 'bg-white border border-gray-100'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isWinner
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index + 1}
                                  </span>
                                  <div>
                                    <p className={`font-semibold ${isWinner ? 'text-yellow-800' : 'text-gray-900'}`}>
                                      {result.candidate.name}
                                      {isWinner && <Trophy className="inline w-5 h-5 ml-2 text-yellow-500" />}
                                    </p>
                                    {result.candidate.party && (
                                      <p className={`text-sm ${isWinner ? 'text-yellow-700' : 'text-gray-600'}`}>{result.candidate.party}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-lg font-bold ${isWinner ? 'text-yellow-700' : 'text-gray-900'}`}>{result.votes}</p>
                                  <p className={`text-sm ${isWinner ? 'text-yellow-600' : 'text-gray-600'}`}>{percentage}%</p>
                                </div>
                              </div>
                              <div className={`w-full rounded-full h-2 ${isWinner ? 'bg-yellow-200' : 'bg-gray-200'}`}>
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${isWinner
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                    : 'bg-primary-500'
                                    }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {electionResults.results.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No votes were cast in this election</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;

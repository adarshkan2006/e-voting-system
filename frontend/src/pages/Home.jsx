import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  Vote, Shield, Lock, Eye, Users, ArrowRight,
  CheckCircle, Zap, Globe, Server
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();


  const steps = [
    { step: 1, title: 'Register', description: 'Create an account with your official ID for verification' },
    { step: 2, title: 'Get Verified', description: 'Admin verifies your identity and grants voting rights' },
    { step: 3, title: 'Vote', description: 'Select your candidate and cast your secure vote' },
    { step: 4, title: 'Confirm', description: 'Receive confirmation that your vote was recorded on blockchain' }
  ];

    const features = [
    {
      icon: Shield,
      title: 'Secure & Tamper-Proof',
      description: 'Blockchain technology ensures that once a vote is cast, it cannot be altered or deleted.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Eye,
      title: 'Transparent',
      description: 'Every vote is recorded on a public ledger, allowing for complete transparency and auditability.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Lock,
      title: 'Anonymous',
      description: 'Your vote is encrypted and your identity remains private while maintaining vote integrity.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Real-time vote counting eliminates delays and provides instant election results.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Globe,
      title: 'Vote Anywhere',
      description: 'Cast your vote from anywhere in the world using any device with internet access.',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: Server,
      title: 'Decentralized',
      description: 'No single point of failure. The system is distributed across multiple nodes.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-30"></div>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Vote className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              E-Voting System
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
              A secure, transparent, and tamper-proof voting platform powered by blockchain technology
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/elections"
                  className="flex items-center space-x-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  <span>View Elections</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and straightforward voting process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge blockchain technology to ensure the integrity of every vote
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all card-hover"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-white/80" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of voters who trust our secure blockchain-based voting platform
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              <Users className="w-5 h-5" />
              <span>Register Now</span>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">E-Vote</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                &copy; 2024-2025 E-Voting System. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Project by Adarsh Sanoj Kanoujia | Nirmala Memorial Foundation College
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

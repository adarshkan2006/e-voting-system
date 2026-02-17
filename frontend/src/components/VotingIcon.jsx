import React from 'react';

// Custom unique voting icon with gradient and modern design
const VotingIcon = ({ className = "w-8 h-8" }) => {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="votingGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4facfe" />
                    <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
                <linearGradient id="votingGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
            </defs>

            {/* Ballot Box */}
            <rect
                x="12"
                y="28"
                width="40"
                height="28"
                rx="4"
                fill="currentColor"
                opacity="0.9"
            />

            {/* Ballot Slot */}
            <rect
                x="22"
                y="32"
                width="20"
                height="4"
                rx="2"
                fill="url(#votingGradient1)"
            />

            {/* Ballot Paper */}
            <rect
                x="20"
                y="8"
                width="24"
                height="24"
                rx="3"
                fill="currentColor"
                stroke="url(#votingGradient1)"
                strokeWidth="2"
            />

            {/* Checkmark on ballot */}
            <path
                d="M26 20 L30 24 L38 14"
                stroke="url(#votingGradient2)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Success badge */}
            <circle
                cx="50"
                cy="46"
                r="10"
                fill="url(#votingGradient1)"
            />
            <path
                d="M45 46 L48 49 L55 42"
                stroke="white"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default VotingIcon;

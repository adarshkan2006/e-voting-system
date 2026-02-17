"""
E-Voting System Backend
A secure blockchain-based voting system API
"""

import os
import uuid
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from functools import wraps

# IST Timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current time in IST"""
    return datetime.now(IST)

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import bcrypt
from web3 import Web3
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///evoting.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Blockchain setup
BLOCKCHAIN_PROVIDER = os.getenv('BLOCKCHAIN_PROVIDER', 'http://127.0.0.1:8545')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '')

try:
    w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_PROVIDER))
    blockchain_connected = w3.is_connected()
except:
    w3 = None
    blockchain_connected = False

# Load contract ABI (you'll need to compile and get this from your Solidity contract)
CONTRACT_ABI = []  # Add your contract ABI here after compilation

# Email Configuration (Gmail SMTP)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USER = os.getenv('EMAIL_USER', '')  # Your Gmail address
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')  # Gmail App Password
EMAIL_FROM = os.getenv('EMAIL_FROM', 'E-Voting System <noreply@evoting.com>')

def send_reset_email(to_email, otp, user_name):
    """Send password reset email with OTP"""
    if not EMAIL_USER or not EMAIL_PASSWORD:
        print("Email credentials not configured. OTP:", otp)
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = '🔐 Password Reset OTP - E-Voting System'
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email
        
        # Plain text version
        text = f"""Hello {user_name},

You requested a password reset for your E-Voting System account.

Your password reset OTP is:
{otp}

This OTP will expire in 10 minutes.

If you did not request this reset, please ignore this email.

Best regards,
E-Voting System Team
"""
        
        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .token-box {{ background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .token {{ font-size: 32px; font-family: monospace; color: #667eea; letter-spacing: 5px; font-weight: bold; }}
        .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>You requested a password reset for your E-Voting System account.</p>
            <p>Your password reset OTP is:</p>
            <div class="token-box">
                <p class="token">{otp}</p>
            </div>
            <p>⏰ This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>Enter this OTP in the password reset form on the website.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #888; font-size: 14px;">If you did not request this reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>© 2026 E-Voting System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
        
        print(f"Reset email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# ==================== Database Models ====================

class User(db.Model):
    """User model for voter authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    voter_id = db.Column(db.String(50), unique=True, nullable=True)  # Aadhar/College ID
    wallet_address = db.Column(db.String(42), unique=True, nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'voter_id': self.voter_id,
            'wallet_address': self.wallet_address,
            'is_verified': self.is_verified,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Election(db.Model):
    """Election model for storing election metadata"""
    __tablename__ = 'elections'
    
    id = db.Column(db.Integer, primary_key=True)
    blockchain_id = db.Column(db.Integer, unique=True, nullable=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    candidates = db.relationship('Candidate', backref='election', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'blockchain_id': self.blockchain_id,
            'name': self.name,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'candidates': [c.to_dict() for c in self.candidates]
        }


class Candidate(db.Model):
    """Candidate model for storing candidate information"""
    __tablename__ = 'candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    blockchain_id = db.Column(db.Integer, nullable=True)
    election_id = db.Column(db.Integer, db.ForeignKey('elections.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    party = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'blockchain_id': self.blockchain_id,
            'election_id': self.election_id,
            'name': self.name,
            'party': self.party,
            'description': self.description,
            'image_url': self.image_url
        }


class Vote(db.Model):
    """Vote record model (for audit purposes - actual votes on blockchain)"""
    __tablename__ = 'votes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    election_id = db.Column(db.Integer, db.ForeignKey('elections.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    transaction_hash = db.Column(db.String(66), unique=True, nullable=True)
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)


class PasswordResetToken(db.Model):
    """Password reset token model"""
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ==================== Helper Functions ====================

def admin_required(fn):
    """Decorator to require admin privileges"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin privileges required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def verified_voter_required(fn):
    """Decorator to require verified voter status"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.is_verified:
            return jsonify({'error': 'Verified voter status required'}), 403
        return fn(*args, **kwargs)
    return wrapper


# ==================== API Routes ====================

# ----- Health Check -----
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'blockchain_connected': blockchain_connected,
        'timestamp': datetime.utcnow().isoformat()
    })


# ----- Authentication Routes -----
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'full_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    user = User(
        email=data['email'],
        full_name=data['full_name'],
        voter_id=data.get('voter_id'),
        wallet_address=data.get('wallet_address')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user and return JWT tokens"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    })


@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token})


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()})


@app.route('/api/auth/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'voter_id' in data:
        user.voter_id = data['voter_id']
    if 'wallet_address' in data:
        user.wallet_address = data['wallet_address']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    })


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset - generates a reset OTP and returns it directly"""
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists
    if not user:
        return jsonify({'error': 'You are not found as a valid user'}), 404
    
    # Check if user is verified
    if not user.is_verified:
        return jsonify({'error': 'Your account is not verified. Please contact admin for verification.'}), 403
    
    # Invalidate any existing tokens for this user
    PasswordResetToken.query.filter_by(user_id=user.id, used=False).update({'used': True})
    
    # Generate new 6-digit OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.utcnow() + timedelta(minutes=10)  # OTP valid for 10 minutes
    
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=otp,
        expires_at=expires_at
    )
    
    db.session.add(reset_token)
    db.session.commit()
    
    # Return OTP directly (displayed on page)
    return jsonify({
        'message': 'OTP generated successfully',
        'otp': otp,
        'user_name': user.full_name,
        'expires_in': '10 minutes'
    }), 200


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
    data = request.get_json()
    
    if not data.get('token') or not data.get('new_password'):
        return jsonify({'error': 'Token and new password are required'}), 400
    
    # Find valid token
    reset_token = PasswordResetToken.query.filter_by(
        token=data['token'],
        used=False
    ).first()
    
    if not reset_token:
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    # Check if token is expired
    if datetime.utcnow() > reset_token.expires_at:
        reset_token.used = True
        db.session.commit()
        return jsonify({'error': 'Reset token has expired'}), 400
    
    # Update password
    user = User.query.get(reset_token.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.set_password(data['new_password'])
    reset_token.used = True
    db.session.commit()
    
    return jsonify({'message': 'Password reset successfully'}), 200


# ----- Admin Routes -----
@app.route('/api/admin/verify-voter/<int:user_id>', methods=['POST'])
@admin_required
def verify_voter(user_id):
    """Verify a voter (admin only)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_verified = True
    db.session.commit()
    
    return jsonify({
        'message': 'Voter verified successfully',
        'user': user.to_dict()
    })


@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    users = User.query.all()
    return jsonify({
        'users': [u.to_dict() for u in users]
    })


@app.route('/api/admin/make-admin/<int:user_id>', methods=['POST'])
@admin_required
def make_admin(user_id):
    """Make a user an admin (admin only)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_admin = True
    db.session.commit()
    
    return jsonify({
        'message': 'User is now an admin',
        'user': user.to_dict()
    })


@app.route('/api/admin/delete-user/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user (admin only) - for safety after elections"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting admin users
        if user.is_admin:
            return jsonify({'error': 'Cannot delete admin users'}), 400
        
        # Delete associated password reset tokens first
        PasswordResetToken.query.filter_by(user_id=user_id).delete()
        
        # Delete associated votes
        Vote.query.filter_by(user_id=user_id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500


# ----- Election Routes -----
@app.route('/api/elections', methods=['GET'])
def get_elections():
    """Get all elections"""
    elections = Election.query.order_by(Election.created_at.desc()).all()
    return jsonify({
        'elections': [e.to_dict() for e in elections]
    })


@app.route('/api/elections/<int:election_id>', methods=['GET'])
def get_election(election_id):
    """Get a specific election"""
    election = Election.query.get(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    return jsonify({'election': election.to_dict()})


@app.route('/api/elections', methods=['POST'])
@admin_required
def create_election():
    """Create a new election (admin only)"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    required_fields = ['name', 'start_time', 'end_time']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400
    
    election = Election(
        name=data['name'],
        description=data.get('description', ''),
        start_time=start_time,
        end_time=end_time,
        created_by=user_id
    )
    
    db.session.add(election)
    db.session.commit()
    
    return jsonify({
        'message': 'Election created successfully',
        'election': election.to_dict()
    }), 201


@app.route('/api/elections/<int:election_id>', methods=['PUT'])
@admin_required
def update_election(election_id):
    """Update an election (admin only)"""
    election = Election.query.get(election_id)
    data = request.get_json()
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    if 'name' in data:
        election.name = data['name']
    if 'description' in data:
        election.description = data['description']
    if 'is_active' in data:
        election.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Election updated successfully',
        'election': election.to_dict()
    })


@app.route('/api/elections/<int:election_id>/toggle', methods=['POST'])
@admin_required
def toggle_election(election_id):
    """Toggle election active status (admin only)"""
    election = Election.query.get(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    election.is_active = not election.is_active
    db.session.commit()
    
    return jsonify({
        'message': f'Election {"activated" if election.is_active else "deactivated"} successfully',
        'election': election.to_dict()
    })


# ----- Candidate Routes -----
@app.route('/api/elections/<int:election_id>/candidates', methods=['GET'])
def get_candidates(election_id):
    """Get all candidates for an election"""
    election = Election.query.get(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    return jsonify({
        'candidates': [c.to_dict() for c in election.candidates]
    })


@app.route('/api/elections/<int:election_id>/candidates', methods=['POST'])
@admin_required
def add_candidate(election_id):
    """Add a candidate to an election (admin only)"""
    election = Election.query.get(election_id)
    data = request.get_json()
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    if datetime.utcnow() >= election.start_time:
        return jsonify({'error': 'Cannot add candidates after election starts'}), 400
    
    if not data.get('name'):
        return jsonify({'error': 'Candidate name is required'}), 400
    
    candidate = Candidate(
        election_id=election_id,
        name=data['name'],
        party=data.get('party', ''),
        description=data.get('description', ''),
        image_url=data.get('image_url', '')
    )
    
    db.session.add(candidate)
    db.session.commit()
    
    return jsonify({
        'message': 'Candidate added successfully',
        'candidate': candidate.to_dict()
    }), 201


# ----- Voting Routes -----
@app.route('/api/elections/<int:election_id>/vote', methods=['POST'])
@verified_voter_required
def cast_vote(election_id):
    """Cast a vote in an election"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    election = Election.query.get(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    # Check if election is active and within time bounds
    now = datetime.utcnow()
    if not election.is_active:
        return jsonify({'error': 'Election is not active'}), 400
    if now < election.start_time:
        return jsonify({'error': 'Election has not started yet'}), 400
    if now > election.end_time:
        return jsonify({'error': 'Election has ended'}), 400
    
    # Check if user has already voted
    existing_vote = Vote.query.filter_by(user_id=user_id, election_id=election_id).first()
    if existing_vote:
        return jsonify({'error': 'You have already voted in this election'}), 400
    
    # Validate candidate
    candidate_id = data.get('candidate_id')
    if not candidate_id:
        return jsonify({'error': 'Candidate ID is required'}), 400
    
    candidate = Candidate.query.filter_by(id=candidate_id, election_id=election_id).first()
    if not candidate:
        return jsonify({'error': 'Invalid candidate'}), 400
    
    # Record the vote (transaction hash would come from blockchain in production)
    vote = Vote(
        user_id=user_id,
        election_id=election_id,
        candidate_id=candidate_id,
        transaction_hash=None  # Would be set after blockchain transaction
    )
    
    db.session.add(vote)
    db.session.commit()
    
    return jsonify({
        'message': 'Vote cast successfully',
        'vote_id': vote.id
    })


@app.route('/api/elections/<int:election_id>/has-voted', methods=['GET'])
@jwt_required()
def has_voted(election_id):
    """Check if current user has voted in an election"""
    user_id = int(get_jwt_identity())
    
    vote = Vote.query.filter_by(user_id=user_id, election_id=election_id).first()
    
    return jsonify({
        'has_voted': vote is not None
    })


@app.route('/api/elections/<int:election_id>/results', methods=['GET'])
def get_results(election_id):
    """Get election results (only after election ends)"""
    election = Election.query.get(election_id)
    
    if not election:
        return jsonify({'error': 'Election not found'}), 404
    
    # Allow viewing results only after election ends (using IST)
    now = get_ist_now().replace(tzinfo=None)
    end_time = election.end_time.replace(tzinfo=None) if election.end_time else None
    if end_time and now <= end_time:
        return jsonify({'error': 'Results are available only after the election ends'}), 400
    
    # Get vote counts
    results = []
    total_votes = Vote.query.filter_by(election_id=election_id).count()
    
    for candidate in election.candidates:
        # Count actual votes for this candidate
        vote_count = Vote.query.filter_by(
            election_id=election_id,
            candidate_id=candidate.id
        ).count()
        percentage = (vote_count / total_votes * 100) if total_votes > 0 else 0
        results.append({
            'candidate': candidate.to_dict(),
            'votes': vote_count,
            'percentage': round(percentage, 2)
        })
    
    return jsonify({
        'election': election.to_dict(),
        'results': results,
        'total_votes': total_votes
    })


# ----- Blockchain Routes -----
@app.route('/api/blockchain/status', methods=['GET'])
def blockchain_status():
    """Get blockchain connection status"""
    if not w3:
        return jsonify({
            'connected': False,
            'error': 'Web3 not initialized'
        })
    
    try:
        connected = w3.is_connected()
        block_number = w3.eth.block_number if connected else None
        
        return jsonify({
            'connected': connected,
            'block_number': block_number,
            'network_id': w3.net.version if connected else None
        })
    except Exception as e:
        return jsonify({
            'connected': False,
            'error': str(e)
        })


# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


# ==================== Database Initialization ====================

def init_db():
    """Initialize the database and create default admin"""
    db.create_all()
    
    # Create default admin if not exists
    admin = User.query.filter_by(email='admin@evoting.com').first()
    if not admin:
        admin = User(
            email='admin@evoting.com',
            full_name='System Admin',
            is_admin=True,
            is_verified=True
        )
        admin.set_password('admin123')  # Change this in production!
        db.session.add(admin)
        db.session.commit()
        print('Default admin created: admin@evoting.com / admin123')


# Initialize database when app starts
with app.app_context():
    init_db()


# ==================== Main Entry Point ====================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

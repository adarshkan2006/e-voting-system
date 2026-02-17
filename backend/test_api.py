"""Test the admin API endpoint"""
import requests
from app import app, db, User
from flask_jwt_extended import create_access_token

with app.app_context():
    # Get admin user and create token
    admin = User.query.filter_by(email='admin@evoting.com').first()
    if not admin:
        print("Admin not found!")
        exit(1)
    
    token = create_access_token(identity=str(admin.id))
    print(f"Testing with admin ID: {admin.id}")
    
    # Test the API endpoint
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get('http://localhost:5000/api/admin/users', headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

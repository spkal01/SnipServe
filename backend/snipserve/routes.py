from flask import (
    Blueprint, request, jsonify, redirect, url_for, session, g
)
import os
import json
from datetime import datetime, timedelta
from snipserve import app, db, login_manager, bcrypt, config
from snipserve.models import Paste, User, PasteView
from snipserve.auth import auth_required, api_key_required, get_current_user, optional_auth
from flask_login import (
    login_user, logout_user, login_required, current_user
)
import secrets

@app.route('/api/pastes/create', methods=['POST'])
@auth_required
def create_paste():
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    
    user = get_current_user()
    # Create paste with current user as owner
    paste = Paste(
        title=data['title'], 
        content=data['content'], 
        created_at=data.get('created_at'), 
        hidden=data.get('hidden', False),
        user_id=user.id  # Assign to current user
    )
    db.session.add(paste)
    db.session.commit()
    
    return jsonify(paste.to_dict()), 201

@app.route('/api/pastes/<string:paste_id>')
@optional_auth
def get_paste(paste_id):
    paste = Paste.query.filter_by(paste_id=paste_id).first()
    if not paste:
        return jsonify({'error': 'Paste not found'}), 404
    
    # Check if user is authenticated (either session or API key)
    user = get_current_user()
    # Allow access if paste is public OR user owns it OR user is admin
    available = not paste.hidden or (user and (user.id == paste.user_id or user.is_admin))
    if not available:
        return jsonify({'error': 'Paste is hidden'}), 403
    return jsonify(paste.to_dict()), 200


@app.route('/api/pastes/<string:paste_id>', methods=['PUT'])
@auth_required
def update_paste(paste_id):
    paste = Paste.query.filter_by(paste_id=paste_id).first()
    if not paste:
        return jsonify({'error': 'Paste not found'}), 404
    
    user = get_current_user()
    # Check if user owns the paste OR user is admin
    if paste.user_id != user.id and not user.is_admin:
        return jsonify({'error': 'Unauthorized - you can only edit your own pastes'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid input'}), 400
    
    if 'title' in data:
        paste.title = data['title']
    if 'content' in data:
        paste.content = data['content']
    if 'hidden' in data:
        paste.hidden = data['hidden']
    
    db.session.commit()
    return jsonify(paste.to_dict()), 200


@app.route('/api/pastes/<string:paste_id>', methods=['DELETE'])
@auth_required
def delete_paste(paste_id):
    paste = Paste.query.filter_by(paste_id=paste_id).first()
    if not paste:
        return jsonify({'error': 'Paste not found'}), 404
    
    user = get_current_user()
    # Check if user owns the paste OR user is admin
    if paste.user_id != user.id and not user.is_admin:
        return jsonify({'error': 'Unauthorized - you can only delete your own pastes'}), 403
    
    db.session.delete(paste)
    db.session.commit()
    return jsonify({'message': 'Paste deleted successfully'}), 200

@app.route('/api/user/me', methods=['GET'])
@auth_required
def get_current_user_info():
    """Get the current user's information"""
    user = get_current_user()
    return jsonify(user.to_dict()), 200

@app.route('/api/user/my-pastes', methods=['GET'])
@auth_required
def get_my_pastes():
    """Get all pastes created by the current user"""
    user = get_current_user()
    pastes = Paste.query.filter_by(user_id=user.id).all()
    return jsonify([paste.to_dict() for paste in pastes]), 200

# Keep existing session-based routes
@app.route('/api/user/login', methods=['POST'])
def login_user_route():
    """Log in a user with username and password"""
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    login_user(user)
    return jsonify({'message': 'Logged in successfully', 'api_key': user.api_key}), 200

@app.route('/api/user/register', methods=['POST'])
def register_user():
    """Register a new user"""
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data or 'invite_code' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if data['invite_code'] != config.INVITE_CODE:
        return jsonify({'error': 'Invalid invite code'}), 403
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    api_key = generate_api_key()
    
    new_user = User(username=data['username'], password_hash=hashed_password, api_key=api_key, is_admin=False)
    db.session.add(new_user)
    db.session.commit()
    # API Key is generated and only shown once during registration
    login_user(new_user)
    session['user_id'] = new_user.id  # Store user ID in session
    return jsonify({'message': 'User registered successfully', 'api_key': api_key}), 201

@app.route('/api/user/logout', methods=['POST'])
@login_required
def logout_user_route():
    """Log out the current user"""
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login"""
    return User.query.get(int(user_id))

def generate_api_key():
    """Generate a unique API key for the user"""
    return secrets.token_hex(32)  # 64-character hex string

@app.route('/api/user/api-key', methods=['GET'])
@login_required
def get_api_key():
    """Get the current user's API key (without regenerating)"""
    user = get_current_user()
    return jsonify({'api_key': user.api_key}), 200

@app.route('/api/user/api-key/regenerate', methods=['POST'])  
@login_required
def regenerate_api_key():
    """Generate a new API key for the current user"""
    user = get_current_user()
    user.api_key = generate_api_key()
    db.session.commit()
    return jsonify({'api_key': user.api_key}), 200

@app.route("/api/manage/pastes", methods=["GET"])
@auth_required
def manage_pastes():
    """Get all pastes for admin management"""
    user = get_current_user()
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized - admin access required'}), 403
    
    pastes = Paste.query.all()
    return jsonify([paste.to_dict() for paste in pastes]), 200

@app.route("/api/test")
def test_route():
    """Test route to verify API is working"""
    return jsonify({'message': 'API is working'}), 200


@app.route('/api/pastes/<string:paste_id>/views', methods=['POST', 'GET'])
def increment_view_count(paste_id):
    """Increment the view count for a paste with spam protection"""
    if request.method == 'POST':
        return increment_view_count_post(paste_id)
    elif request.method == 'GET':
        return get_view_count(paste_id)
    else:
        return jsonify({'error': 'Method not allowed'}), 405

def increment_view_count_post(paste_id):
    """Increment view count with IP and user-based spam protection"""
    paste = Paste.query.filter_by(paste_id=paste_id).first()
    if not paste:
        return jsonify({'error': 'Paste not found'}), 404
    
    # Get client IP address (handle proxy headers)
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if client_ip and ',' in client_ip:
        client_ip = client_ip.split(',')[0].strip()
    
    # Get current user if authenticated
    current_user_id = None
    try:
        user = get_current_user()
        if user:
            current_user_id = user.id
            # Don't count views from the paste owner
            if user.id == paste.user_id:
                return jsonify({'view_count': paste.view_count or 0}), 200
    except:
        pass  # Anonymous user
    
    # Time threshold - only count one view per IP/user per 24 hours
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    # Check for recent views
    query = PasteView.query.filter_by(paste_id=paste_id).filter(
        PasteView.viewed_at > time_threshold
    )
    
    recent_view = None
    if current_user_id:
        # For authenticated users, check by user ID (more reliable)
        recent_view = query.filter_by(user_id=current_user_id).first()
    else:
        # For anonymous users, check by IP address
        recent_view = query.filter_by(ip_address=client_ip, user_id=None).first()
    
    # Only increment if no recent view found
    if not recent_view:
        # Create new view record
        new_view = PasteView(
            paste_id=paste_id,
            ip_address=client_ip,
            user_id=current_user_id
        )
        db.session.add(new_view)
        
        # Increment the paste view count
        paste.view_count = (paste.view_count or 0) + 1
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Failed to update view count'}), 500
    
    return jsonify({'view_count': paste.view_count or 0}), 200

def get_view_count(paste_id):
    """Get current view count for a paste"""
    paste = Paste.query.filter_by(paste_id=paste_id).first()
    if not paste:
        return jsonify({'error': 'Paste not found'}), 404
    
    return jsonify({'view_count': paste.view_count or 0}), 200

@app.route('/api/admin/paste-analytics/<string:paste_id>', methods=['GET'])
@auth_required
def get_paste_analytics(paste_id):
    """Get detailed view analytics for a paste (admin only)"""
    user = get_current_user()
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized - admin access required'}), 403
    
    paste = Paste.query.filter_by(paste_id=paste_id).first()
    if not paste:
        return jsonify({'error': 'Paste not found'}), 404
    
    # Get view statistics
    views = PasteView.query.filter_by(paste_id=paste_id).all()
    
    analytics = {
        'total_views': len(views),
        'unique_ips': len(set(view.ip_address for view in views)),
        'authenticated_views': len([v for v in views if v.user_id]),
        'recent_views': len([v for v in views if v.viewed_at > datetime.utcnow() - timedelta(days=7)])
    }
    
    return jsonify(analytics), 200


@app.route('/api/admin/paste-analytics', methods=['GET'])
@auth_required
def get_all_paste_analytics():
    """Get analytics for all pastes (admin only)"""
    user = get_current_user()
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized - admin access required'}), 403
    
    pastes = Paste.query.all()
    analytics = []
    
    for paste in pastes:
        views = PasteView.query.filter_by(paste_id=paste.paste_id).all()
        analytics.append({
            'paste_id': paste.paste_id,
            'title': paste.title,
            'total_views': len(views),
            'unique_ips': len(set(view.ip_address for view in views)),
            'authenticated_views': len([v for v in views if v.user_id]),
            'recent_views': len([v for v in views if v.viewed_at > datetime.utcnow() - timedelta(days=7)])
        })
    
    return jsonify(analytics), 200

@app.route('/api/admin/users', methods=['GET'])
@auth_required
def get_all_users():
    """Get a list of all users (admin only)"""
    user = get_current_user()
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized - admin access required'}), 403
    
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@app.route('/api/admin/user/<string:username>', methods=['GET', 'DELETE', 'PUT'])
@auth_required
def get_user_info(username):
    """Get, delete or update user information (admin only)"""
    user = get_current_user()
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized - admin access required'}), 403
    
    target_user = User.query.filter_by(username=username).first()
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    if request.method == 'GET':
        return jsonify(target_user.to_dict()), 200
    
    elif request.method == 'DELETE':
        db.session.delete(target_user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    
    elif request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid input - no data provided'}), 400
        
        # Validate that at least one field is provided to update
        if not any(key in data for key in ['username', 'password', 'is_admin']):
            return jsonify({'error': 'No valid fields provided for update'}), 400
        
        # Update username if provided
        if 'username' in data:
            if not data['username'] or not data['username'].strip():
                return jsonify({'error': 'Username cannot be empty'}), 400
            # Check if new username already exists (but not for the same user)
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != target_user.id:
                return jsonify({'error': 'Username already exists'}), 409
            target_user.username = data['username'].strip()
        
        # Update password if provided
        if 'password' in data:
            if not data['password'] or len(data['password']) < 6:
                return jsonify({'error': 'Password must be at least 6 characters long'}), 400
            target_user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Update admin status if provided
        if 'is_admin' in data:
            target_user.is_admin = bool(data['is_admin'])
        
        try:
            db.session.commit()
            return jsonify(target_user.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Failed to update user'}), 500
    
@app.route('/api/admin/users', methods=['POST'])
@auth_required
def create_user_admin():
    """Create a new user (admin only)"""
    user = get_current_user()
    if not user.is_admin:
        return jsonify({'error': 'Unauthorized - admin access required'}), 403
    
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    # Validate password length
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    # Create the new user
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    api_key = generate_api_key()
    
    new_user = User(
        username=data['username'],
        password_hash=hashed_password,
        api_key=api_key,
        is_admin=data.get('is_admin', False)
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500
    
def create_default_admin():
    db.create_all()
    """Create a default admin user if it doesn't exist"""
    admin_username = config.ADMIN_USERNAME
    admin_password = config.ADMIN_PASSWORD
    
    if User.query.filter_by(username=admin_username).first() is None:
        hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
        api_key = generate_api_key()
        admin_user = User(
            username=admin_username, 
            password_hash=hashed_password, 
            api_key=api_key, 
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print(f"Default admin user '{admin_username}' created.")
    else:
        print(f"Admin user '{admin_username}' already exists.")

@app.route('/.well-known/assetlinks.json', methods=['GET'])
def serve_assetlinks():
    """Serve Android Digital Asset Links for App Links verification"""
    data = [
        {
            "relation": [
                "delegate_permission/common.handle_all_urls"
            ],
            "target": {
                "namespace": "android_app",
                "package_name": "com.snipservemobile",
                "sha256_cert_fingerprints": [
                    "DA:7A:39:82:71:D9:CB:7A:4D:C2:3D:94:8C:F1:37:01:CB:CB:60:46:50:A7:92:C6:E6:24:10:D8:FC:07:85:49"
                ]
            }
        }
    ]
    return app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )
from functools import wraps
from flask import request, jsonify, g
from snipserve.models import User

def api_key_required(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = None
        
        # Check for API key in headers
        if 'X-API-Key' in request.headers:
            api_key = request.headers['X-API-Key']
        # Check for API key in query parameters
        elif 'api_key' in request.args:
            api_key = request.args.get('api_key')
        
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        # Validate API key
        user = User.query.filter_by(api_key=api_key).first()
        if not user:
            return jsonify({'error': 'Invalid API key'}), 401
        
        # Store user in g for use in the route
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

def auth_required(f):
    """Decorator that accepts both session login and API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First check if user is logged in via session
        from flask_login import current_user
        if current_user.is_authenticated:
            g.current_user = current_user
            return f(*args, **kwargs)
        
        # If not logged in, check for API key
        api_key = None
        if 'X-API-Key' in request.headers:
            api_key = request.headers['X-API-Key']
        elif 'api_key' in request.args:
            api_key = request.args.get('api_key')
        
        if api_key:
            user = User.query.filter_by(api_key=api_key).first()
            if user:
                g.current_user = user
                return f(*args, **kwargs)
        
        return jsonify({'error': 'Authentication required'}), 401
    
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication - doesn't require auth but sets user if available"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask_login import current_user
        
        # First check if user is logged in via session
        if current_user.is_authenticated:
            g.current_user = current_user
            return f(*args, **kwargs)
        
        # If not logged in, check for API key
        api_key = None
        if 'X-API-Key' in request.headers:
            api_key = request.headers['X-API-Key']
        elif 'api_key' in request.args:
            api_key = request.args.get('api_key')
        
        if api_key:
            user = User.query.filter_by(api_key=api_key).first()
            if user:
                g.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Helper function to get current user from either session or API key"""
    from flask_login import current_user
    if hasattr(g, 'current_user'):
        return g.current_user
    return current_user if current_user.is_authenticated else None
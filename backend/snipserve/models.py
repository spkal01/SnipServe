from sqlalchemy import DateTime
from datetime import datetime
import secrets
import string
from snipserve import db
from flask_login import UserMixin


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    api_key = db.Column(db.String(64), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    
    # Relationship to pastes
    pastes = db.relationship('Paste', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat(),
            'is_admin': self.is_admin,
            'password_hash': self.password_hash
        }


class Paste(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paste_id = db.Column(db.String(10), unique=True, nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp(), nullable=False)
    hidden = db.Column(db.Boolean, default=False, nullable=False)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Foreign key to User
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.paste_id:
            self.paste_id = self.generate_paste_id()

    @staticmethod
    def generate_paste_id():
        """Generate a unique 8-character alphanumeric ID"""
        while True:
            # Generate 8-character string with letters and numbers
            paste_id = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
            # Check if it already exists
            if not Paste.query.filter_by(paste_id=paste_id).first():
                return paste_id

    def __repr__(self):
        return f'<Paste {self.title}>'

    def to_dict(self):
        return {
            'id': self.paste_id,  # Use paste_id as the public ID
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'hidden': self.hidden,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'view_count': self.view_count  # Include view count
        }


class PasteView(db.Model):
    """Track unique views to prevent spam and inflate counts"""
    id = db.Column(db.Integer, primary_key=True)
    paste_id = db.Column(db.String(10), db.ForeignKey('paste.paste_id'), nullable=False)
    ip_address = db.Column(db.String(45), nullable=False)  # IPv6 support
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Null for anonymous users
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    paste = db.relationship('Paste', backref='views')
    user = db.relationship('User', backref='paste_views')

    def __repr__(self):
        return f'<PasteView {self.paste_id} by {self.user_id or self.ip_address}>'
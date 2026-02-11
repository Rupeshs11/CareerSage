"""
User Model
"""
from datetime import datetime
import bcrypt
from ..extensions import db


class User(db.Document):
    """User account model"""
    meta = {'collection': 'users'}
    
    email = db.StringField(required=True, unique=True)
    password_hash = db.StringField(required=True)
    name = db.StringField(required=True)
    avatar_url = db.StringField()
    
    # Account status
    is_active = db.BooleanField(default=True)
    is_verified = db.BooleanField(default=False)
    
    # Timestamps
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)
    last_login = db.DateTimeField()
    
    def set_password(self, password):
        """Hash and set the password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Verify password against hash"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        self.save()
    
    def to_dict(self):
        """Serialize user to dictionary"""
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>'

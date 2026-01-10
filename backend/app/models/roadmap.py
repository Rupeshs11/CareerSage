"""
Roadmap Models
"""
from datetime import datetime
from ..extensions import db


class Roadmap(db.Model):
    """Official roadmap template"""
    __tablename__ = 'roadmaps'
    
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False, default='general')
    
    # Roadmap content stored as JSON
    nodes = db.Column(db.JSON, default=list)
    connections = db.Column(db.JSON, default=list)
    faqs = db.Column(db.JSON, default=list)
    
    # Metadata
    is_official = db.Column(db.Boolean, default=True)
    is_published = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_roadmaps = db.relationship('UserRoadmap', backref='roadmap', lazy='dynamic')
    
    def to_dict(self, include_content=True):
        """Serialize roadmap to dictionary"""
        data = {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'is_official': self.is_official,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_content:
            data['nodes'] = self.nodes or []
            data['connections'] = self.connections or []
            data['faqs'] = self.faqs or []
        
        return data
    
    def __repr__(self):
        return f'<Roadmap {self.slug}>'


class UserRoadmap(db.Model):
    """User's saved/customized roadmap"""
    __tablename__ = 'user_roadmaps'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    roadmap_id = db.Column(db.Integer, db.ForeignKey('roadmaps.id'), nullable=True)
    
    # Custom roadmap data (for AI-generated ones)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    nodes = db.Column(db.JSON, default=list)
    connections = db.Column(db.JSON, default=list)
    
    # User's progress on this roadmap
    completed_nodes = db.Column(db.JSON, default=list)
    
    # Generation metadata
    is_ai_generated = db.Column(db.Boolean, default=False)
    generation_params = db.Column(db.JSON, nullable=True)  # Skills, goals, etc.
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_progress_percentage(self):
        """Calculate completion percentage"""
        if not self.nodes:
            return 0
        total = len(self.nodes)
        completed = len(self.completed_nodes or [])
        return round((completed / total) * 100) if total > 0 else 0
    
    def to_dict(self):
        """Serialize user roadmap to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'nodes': self.nodes or [],
            'connections': self.connections or [],
            'completed_nodes': self.completed_nodes or [],
            'progress': self.get_progress_percentage(),
            'is_ai_generated': self.is_ai_generated,
            'roadmap_id': self.roadmap_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<UserRoadmap {self.title}>'

"""
Roadmap Models
"""
from datetime import datetime
from ..extensions import db


class Roadmap(db.Document):
    """Official roadmap template"""
    meta = {'collection': 'roadmaps'}
    
    slug = db.StringField(required=True, unique=True)
    title = db.StringField(required=True)
    description = db.StringField()
    category = db.StringField(default='general')
    
    # Roadmap content stored as List/Dict
    nodes = db.ListField(db.DictField(), default=list)
    connections = db.ListField(db.DictField(), default=list)
    faqs = db.ListField(db.DictField(), default=list)
    
    # Metadata
    is_official = db.BooleanField(default=True)
    is_published = db.BooleanField(default=True)
    view_count = db.IntField(default=0)
    
    # Timestamps
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)
    
    def to_dict(self, include_content=True):
        """Serialize roadmap to dictionary"""
        data = {
            'id': str(self.id),
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


class UserRoadmap(db.Document):
    """User's saved/customized roadmap"""
    meta = {'collection': 'user_roadmaps'}
    
    user_id = db.ReferenceField('User', required=True)
    roadmap_id = db.ReferenceField('Roadmap')
    
    # Custom roadmap data (for AI-generated ones)
    title = db.StringField(required=True)
    description = db.StringField()
    nodes = db.ListField(db.DictField(), default=list)
    connections = db.ListField(db.DictField(), default=list)
    
    # User's progress on this roadmap
    completed_nodes = db.ListField(db.StringField(), default=list)
    
    # Generation metadata
    is_ai_generated = db.BooleanField(default=False)
    generation_params = db.DictField()  # Skills, goals, etc.
    
    # Timestamps
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)
    
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
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'nodes': self.nodes or [],
            'connections': self.connections or [],
            'completed_nodes': self.completed_nodes or [],
            'progress': self.get_progress_percentage(),
            'is_ai_generated': self.is_ai_generated,
            'generation_params': self.generation_params or {},
            'roadmap_id': str(self.roadmap_id.id) if self.roadmap_id else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<UserRoadmap {self.title}>'

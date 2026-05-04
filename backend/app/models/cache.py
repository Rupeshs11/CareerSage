"""
Roadmap Cache Model
Caches AI-generated roadmaps in MongoDB to avoid repeated API calls.
"""
from datetime import datetime
from ..extensions import db


class RoadmapCache(db.Document):
    """Cached AI-generated roadmap."""
    meta = {
        'collection': 'roadmap_cache',
        'indexes': [
            {'fields': ['cache_key'], 'unique': True},
            {'fields': ['created_at'], 'expireAfterSeconds': 604800}  # Auto-delete after 7 days
        ]
    }

    cache_key = db.StringField(required=True, unique=True)
    topic = db.StringField(required=True)
    mode = db.StringField(required=True)
    experience_level = db.StringField()
    roadmap_data = db.DictField(required=True)
    hit_count = db.IntField(default=0)
    created_at = db.DateTimeField(default=datetime.utcnow)

    @staticmethod
    def make_key(topic, mode, experience_level):
        """Generate a normalized cache key."""
        return f"{topic.strip().lower()}|{mode}|{experience_level}".replace(" ", "-")

    def __repr__(self):
        return f'<RoadmapCache {self.cache_key}>'

"""
User Progress Model
"""
from datetime import datetime, date
from ..extensions import db


class UserProgress(db.Document):
    """Track user's learning progress"""
    meta = {'collection': 'user_progress'}
    
    user_id = db.ReferenceField('User', required=True, unique=True)
    
    # Overall stats
    total_roadmaps_started = db.IntField(default=0)
    total_roadmaps_completed = db.IntField(default=0)
    total_nodes_completed = db.IntField(default=0)
    total_quizzes_taken = db.IntField(default=0)
    
    # Skills acquired
    skills = db.ListField(db.StringField(), default=list)  # List of skill names
    
    # Streak tracking
    current_streak = db.IntField(default=0)
    longest_streak = db.IntField(default=0)
    last_activity_date = db.DateTimeField()
    
    # Activity log (recent activities)
    recent_activity = db.ListField(db.DictField(), default=list)
    
    # Timestamps
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)
    
    def update_streak(self):
        """Update learning streak based on activity"""
        now = datetime.utcnow()
        today = now.date()
        
        if self.last_activity_date is None:
            self.current_streak = 1
        else:
            last_date = self.last_activity_date.date()
            if last_date == today:
                pass  # Already updated today
            elif (today - last_date).days == 1:
                self.current_streak += 1
            else:
                self.current_streak = 1
        
        self.last_activity_date = now
        
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
    
    def add_activity(self, activity_type, description, metadata=None):
        """Add an activity to recent activity log"""
        activity = {
            'type': activity_type,
            'description': description,
            'metadata': metadata or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        
        activities = self.recent_activity or []
        activities.insert(0, activity)
        self.recent_activity = activities[:20]  # Keep last 20 activities
        
        self.update_streak()
        self.save()
    
    def add_skill(self, skill):
        """Add a skill to user's skill list"""
        skills = self.skills or []
        if skill not in skills:
            skills.append(skill)
            self.skills = skills
            self.save()
    
    def to_dict(self):
        """Serialize progress to dictionary"""
        return {
            'total_roadmaps_started': self.total_roadmaps_started,
            'total_roadmaps_completed': self.total_roadmaps_completed,
            'total_nodes_completed': self.total_nodes_completed,
            'total_quizzes_taken': self.total_quizzes_taken,
            'skills': self.skills or [],
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'last_activity_date': self.last_activity_date.isoformat() if self.last_activity_date else None,
            'recent_activity': self.recent_activity or []
        }
    
    def __repr__(self):
        return f'<UserProgress user_id={self.user_id}>'

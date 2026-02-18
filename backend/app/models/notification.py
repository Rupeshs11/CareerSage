"""
Notification Model
"""
from datetime import datetime
from ..extensions import db


class Notification(db.Document):
    """Notification for users (friend requests, battle invites, etc.)"""
    meta = {'collection': 'notifications', 'ordering': ['-created_at']}

    user_id = db.ReferenceField('User', required=True)
    from_user_id = db.ReferenceField('User', required=True)
    type = db.StringField(required=True, choices=['friend_request', 'battle_invite', 'battle_result'])
    data = db.DictField(default={})
    read = db.BooleanField(default=False)
    created_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'from_user': {
                'id': str(self.from_user_id.id),
                'name': self.from_user_id.name
            } if self.from_user_id else None,
            'type': self.type,
            'data': self.data,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

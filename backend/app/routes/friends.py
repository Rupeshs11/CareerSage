"""Friends & Notifications Routes"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db, socketio
from ..models.user import User
from ..models.notification import Notification
from bson import ObjectId
from bson.errors import InvalidId

friends_bp = Blueprint('friends', __name__)


def safe_oid(id_str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None


# ============ REST Endpoints ============

@friends_bp.route('/list', methods=['GET'])
@jwt_required()
def get_friends():
    """Get current user's friends list with online/offline status"""
    user_id = get_jwt_identity()
    user = User.objects(id=safe_oid(user_id)).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Import user_sid_map from battle routes for online status
    from .battle import user_sid_map

    friends_list = []
    for fid in (user.friends or []):
        friend = User.objects(id=fid).first()
        if friend:
            friends_list.append({
                'id': str(friend.id),
                'name': friend.name,
                'email': friend.email,
                'online': str(friend.id) in user_sid_map
            })

    return jsonify({'friends': friends_list})


@friends_bp.route('/add', methods=['POST'])
@jwt_required()
def send_friend_request():
    """Send a friend request to another user"""
    user_id = get_jwt_identity()
    data = request.get_json()
    target_email = data.get('email', '').strip()
    target_id = data.get('target_id', '').strip()

    if not target_email and not target_id:
        return jsonify({'error': 'email or target_id required'}), 400

    # Find target user
    if target_id:
        target = User.objects(id=safe_oid(target_id)).first()
    else:
        target = User.objects(email=target_email).first()

    if not target:
        return jsonify({'error': 'User not found'}), 404

    if str(target.id) == user_id:
        return jsonify({'error': 'Cannot add yourself'}), 400

    user = User.objects(id=safe_oid(user_id)).first()

    # Check if already friends
    if safe_oid(str(target.id)) in (user.friends or []):
        return jsonify({'error': 'Already friends'}), 400

    # Check for existing pending request
    existing = Notification.objects(
        user_id=target.id,
        from_user_id=user.id,
        type='friend_request',
        read=False
    ).first()
    if existing:
        return jsonify({'error': 'Friend request already sent'}), 400

    # Create notification for target user
    notif = Notification(
        user_id=target.id,
        from_user_id=user.id,
        type='friend_request',
        data={'message': f'{user.name} wants to be your friend'}
    )
    notif.save()

    # Push real-time notification via Socket.IO
    from .battle import user_sid_map
    target_sid = user_sid_map.get(str(target.id))
    if target_sid:
        socketio.emit('notification', notif.to_dict(), to=target_sid, namespace='/')

    return jsonify({'message': 'Friend request sent', 'notification_id': str(notif.id)})


@friends_bp.route('/accept', methods=['POST'])
@jwt_required()
def accept_friend_request():
    """Accept a friend request"""
    user_id = get_jwt_identity()
    data = request.get_json()
    notif_id = data.get('notification_id')

    if not notif_id:
        return jsonify({'error': 'notification_id required'}), 400

    notif = Notification.objects(id=safe_oid(notif_id), user_id=safe_oid(user_id), type='friend_request').first()
    if not notif:
        return jsonify({'error': 'Request not found'}), 404

    from_user_id = notif.from_user_id.id
    me = User.objects(id=safe_oid(user_id)).first()
    them = User.objects(id=from_user_id).first()

    if not me or not them:
        return jsonify({'error': 'User not found'}), 404

    # Add each other as friends (mutual)
    if from_user_id not in (me.friends or []):
        me.friends = (me.friends or []) + [from_user_id]
        me.save()

    my_oid = safe_oid(user_id)
    if my_oid not in (them.friends or []):
        them.friends = (them.friends or []) + [my_oid]
        them.save()

    # Mark notification as read
    notif.read = True
    notif.save()

    # Notify the requester that their request was accepted
    accept_notif = Notification(
        user_id=from_user_id,
        from_user_id=safe_oid(user_id),
        type='friend_request',
        data={'message': f'{me.name} accepted your friend request', 'accepted': True}
    )
    accept_notif.save()

    from .battle import user_sid_map
    their_sid = user_sid_map.get(str(from_user_id))
    if their_sid:
        socketio.emit('notification', accept_notif.to_dict(), to=their_sid, namespace='/')
        socketio.emit('friend_list_updated', {}, to=their_sid, namespace='/')

    return jsonify({'message': 'Friend request accepted'})


@friends_bp.route('/remove', methods=['POST'])
@jwt_required()
def remove_friend():
    """Remove a friend"""
    user_id = get_jwt_identity()
    data = request.get_json()
    friend_id = data.get('friend_id')

    if not friend_id:
        return jsonify({'error': 'friend_id required'}), 400

    me = User.objects(id=safe_oid(user_id)).first()
    them = User.objects(id=safe_oid(friend_id)).first()

    if not me or not them:
        return jsonify({'error': 'User not found'}), 404

    # Remove from both lists
    me.friends = [f for f in (me.friends or []) if str(f) != friend_id]
    me.save()
    them.friends = [f for f in (them.friends or []) if str(f) != user_id]
    them.save()

    return jsonify({'message': 'Friend removed'})


# ============ Notifications ============

@friends_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications"""
    user_id = get_jwt_identity()
    notifs = Notification.objects(user_id=safe_oid(user_id)).order_by('-created_at').limit(20)
    unread = Notification.objects(user_id=safe_oid(user_id), read=False).count()
    return jsonify({
        'notifications': [n.to_dict() for n in notifs],
        'unread_count': unread
    })


@friends_bp.route('/notifications/read', methods=['POST'])
@jwt_required()
def mark_notifications_read():
    """Mark notifications as read"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    notif_id = data.get('notification_id')

    if notif_id:
        # Mark single notification as read
        Notification.objects(id=safe_oid(notif_id), user_id=safe_oid(user_id)).update(set__read=True)
    else:
        # Mark all as read
        Notification.objects(user_id=safe_oid(user_id), read=False).update(set__read=True)

    return jsonify({'message': 'Notifications marked as read'})


# ============ Socket.IO: Battle Invite ============

@socketio.on('battle_invite')
def handle_battle_invite(data):
    """Send a battle invite to a friend"""
    from .battle import user_sid_map

    from_user_id = data.get('from_user_id')
    to_user_id = data.get('to_user_id')
    battle_id = data.get('battle_id')
    topic = data.get('topic', '')

    if not from_user_id or not to_user_id:
        return

    sender = User.objects(id=safe_oid(from_user_id)).first()
    if not sender:
        return

    # Create notification
    notif = Notification(
        user_id=safe_oid(to_user_id),
        from_user_id=safe_oid(from_user_id),
        type='battle_invite',
        data={
            'message': f'{sender.name} invited you to a battle!',
            'battle_id': battle_id,
            'topic': topic
        }
    )
    notif.save()

    # Push real-time
    target_sid = user_sid_map.get(to_user_id)
    if target_sid:
        socketio.emit('notification', notif.to_dict(), to=target_sid, namespace='/')

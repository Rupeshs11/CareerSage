"""
Quick Database Check Script
Run with: python check_db.py
"""
import sys
sys.path.insert(0, '.')

from app import create_app
from app.extensions import db
from app.models import User, Roadmap, UserProgress

app = create_app()

with app.app_context():
    print("=" * 50)
    print("DATABASE CHECK")
    print("=" * 50)
    
    # Users
    users = User.query.all()
    print(f"\n📧 USERS ({len(users)} total):")
    for u in users:
        print(f"  ID: {u.id}, Email: {u.email}, Name: {u.name}")
    
    # Roadmaps
    roadmaps_count = Roadmap.query.count()
    print(f"\n🗺️ ROADMAPS: {roadmaps_count} total")
    
    # User Progress
    progress = UserProgress.query.all()
    print(f"\n📊 USER PROGRESS ({len(progress)} records):")
    for p in progress:
        print(f"  User {p.user_id}: Roadmaps={p.total_roadmaps_started}, Quizzes={p.total_quizzes_taken}")
    
    print("\n" + "=" * 50)

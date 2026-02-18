import os
from app import create_app
from app.extensions import socketio

env = os.getenv('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    import sys
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
    
    print("\n" + "="*60, flush=True)
    print(" CAREERSAGE BACKEND STARTING", flush=True)
    print("="*60, flush=True)
    print(f"Environment: {env}", flush=True)
    print(f"Server: http://localhost:5000", flush=True)
    print(f"Frontend: http://localhost:5000/index.html", flush=True)
    print(f"AI Service: http://localhost:5000/aisensie.html", flush=True)
    print(f"Battle Arena: http://localhost:5000/skill-battle.html", flush=True)
    print("="*60, flush=True)
    print(" Watching for requests...\n", flush=True)
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=True, allow_unsafe_werkzeug=True)


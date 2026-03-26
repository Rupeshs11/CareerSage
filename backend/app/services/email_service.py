"""
CareerSage Email Service
Sends styled HTML email notifications asynchronously via SMTP.
"""
import eventlet
from flask import current_app
from flask_mail import Message
from ..extensions import mail


def _send_async(app, msg):
    """Send email inside app context (runs in background thread)."""
    with app.app_context():
        try:
            mail.send(msg)
            app.logger.info(f"[EMAIL] Sent to {msg.recipients}")
        except Exception as e:
            app.logger.error(f"[EMAIL] Failed to send to {msg.recipients}: {e}")


def _send_in_background(msg):
    """Fire-and-forget email using eventlet."""
    app = current_app._get_current_object()
    if not app.config.get('MAIL_USERNAME'):
        app.logger.warning("[EMAIL] MAIL_USERNAME not configured — skipping email")
        return
    eventlet.spawn(_send_async, app, msg)


# ──────────────────────────────────────────────
#  Styled HTML base
# ──────────────────────────────────────────────

_STYLE = """
<style>
  body { margin:0; padding:0; background:#0f172a; font-family:'Inter',Arial,sans-serif; }
  .container { max-width:520px; margin:40px auto; background:#1e293b; border-radius:16px;
               border:1px solid rgba(255,255,255,0.06); overflow:hidden; }
  .header { background:linear-gradient(135deg,#6366f1,#a855f7); padding:32px 28px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:22px; font-weight:800; letter-spacing:-0.03em; }
  .body { padding:28px; color:#cbd5e1; font-size:15px; line-height:1.7; }
  .body p { margin:0 0 16px; }
  .highlight { color:#a5b4fc; font-weight:700; }
  .topic-badge { display:inline-block; background:rgba(99,102,241,0.15); color:#818cf8;
                 padding:6px 14px; border-radius:8px; font-weight:600; font-size:14px; }
  .btn { display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7);
         color:#fff !important; text-decoration:none; padding:12px 28px; border-radius:10px;
         font-weight:700; font-size:15px; margin-top:8px; }
  .footer { padding:20px 28px; text-align:center; color:#475569; font-size:12px;
            border-top:1px solid rgba(255,255,255,0.04); }
</style>
"""


def _wrap_html(title, body_html):
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">{_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>{title}</h1></div>
  <div class="body">{body_html}</div>
  <div class="footer">CareerSage — AI-Powered Guidance Platform</div>
</div>
</body></html>"""


# ──────────────────────────────────────────────
#  Public functions
# ──────────────────────────────────────────────

def send_friend_request_email(to_email, to_name, from_name):
    """Send an email notifying a user of a new friend request."""
    html = _wrap_html(
        "New Friend Request 🤝",
        f"""<p>Hey <span class="highlight">{to_name}</span>!</p>
        <p><span class="highlight">{from_name}</span> wants to be your friend on CareerSage.</p>
        <p>Log in to accept the request, start learning together, and challenge each other to skill battles!</p>
        <p style="text-align:center;margin-top:24px;">
          <a class="btn" href="#">Open CareerSage</a>
        </p>"""
    )
    msg = Message(
        subject=f"🤝 {from_name} sent you a friend request on CareerSage",
        recipients=[to_email],
        html=html
    )
    _send_in_background(msg)


def send_battle_invite_email(to_email, to_name, from_name, topic):
    """Send an email notifying a user of a battle challenge."""
    html = _wrap_html(
        "Battle Challenge ⚔️",
        f"""<p>Hey <span class="highlight">{to_name}</span>!</p>
        <p><span class="highlight">{from_name}</span> has challenged you to a 1v1 Rapid Fire Battle!</p>
        <p>Topic: <span class="topic-badge">{topic}</span></p>
        <p>Jump in now before the challenge expires. Show them what you've got! 🔥</p>
        <p style="text-align:center;margin-top:24px;">
          <a class="btn" href="#">Join Battle</a>
        </p>"""
    )
    msg = Message(
        subject=f"⚔️ {from_name} challenged you to a battle on CareerSage!",
        recipients=[to_email],
        html=html
    )
    _send_in_background(msg)

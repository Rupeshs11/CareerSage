"""Resume Routes - AI Resume Generation"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.ai_service import ai_service

resume_bp = Blueprint('resume', __name__)


@resume_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_resume():
    """Generate an AI-powered resume based on user input."""
    data = request.get_json()

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    linkedin = data.get('linkedin', '').strip()
    github = data.get('github', '').strip()
    portfolio = data.get('portfolio', '').strip()
    job_title = data.get('jobTitle', '').strip()
    experience = data.get('experience', '').strip()
    skills = data.get('skills', '').strip()
    education = data.get('education', '').strip()
    projects = data.get('projects', '').strip()
    certifications = data.get('certifications', '').strip()
    summary_hint = data.get('summaryHint', '').strip()

    if not name or not job_title:
        return jsonify({'error': 'Name and Job Title are required'}), 400

    try:
        resume_data = ai_service.generate_resume(
            name=name,
            email=email,
            phone=phone,
            linkedin=linkedin,
            github=github,
            portfolio=portfolio,
            job_title=job_title,
            experience=experience,
            skills=skills,
            education=education,
            projects=projects,
            certifications=certifications,
            summary_hint=summary_hint
        )

        if resume_data is None:
            return jsonify({'error': 'Failed to generate resume. Please try again.'}), 500

        return jsonify(resume_data), 200

    except Exception as e:
        current_app.logger.error(f"Resume generation failed: {e}")
        return jsonify({'error': 'Resume generation failed', 'details': str(e)}), 500

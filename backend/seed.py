"""
Database Seeder - Populate with sample roadmaps
Run with: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.roadmap import Roadmap


def seed_roadmaps():
    """Seed official roadmaps"""
    
    roadmaps = [
        {
            'slug': 'frontend-beginner',
            'title': 'Frontend Developer',
            'description': 'Step by step guide to becoming a modern frontend developer in 2025',
            'category': 'frontend',
            'nodes': [
                {'id': 'internet', 'title': 'Internet', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['How does the internet work?', 'What is HTTP?', 'Domain Name', 'DNS', 'Hosting']},
                {'id': 'html', 'title': 'HTML', 'x': 200, 'y': 120, 'type': 'required', 'topics': ['Learn the basics', 'Semantic HTML', 'Forms & Validations', 'Accessibility', 'SEO Basics']},
                {'id': 'css', 'title': 'CSS', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Learn the basics', 'Making Layouts', 'Responsive Design', 'Flexbox', 'Grid']},
                {'id': 'javascript', 'title': 'JavaScript', 'x': 800, 'y': 120, 'type': 'required', 'topics': ['Learn the Basics', 'DOM Manipulation', 'Fetch API / Ajax', 'ES6+', 'Async/Await']},
                {'id': 'vcs', 'title': 'Version Control', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Git Basics', 'GitHub', 'Branching', 'Pull Requests']},
                {'id': 'npm', 'title': 'Package Managers', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['npm', 'yarn', 'pnpm']},
                {'id': 'tailwind', 'title': 'CSS Frameworks', 'x': 300, 'y': 480, 'type': 'recommended', 'topics': ['Tailwind CSS', 'Bootstrap', 'Material UI']},
                {'id': 'react', 'title': 'React', 'x': 500, 'y': 600, 'type': 'recommended', 'topics': ['Components', 'JSX', 'Props', 'State', 'Hooks', 'Context']},
                {'id': 'vue', 'title': 'Vue.js', 'x': 700, 'y': 600, 'type': 'alternative', 'topics': ['Composition API', 'Vuex', 'Vue Router']},
                {'id': 'typescript', 'title': 'TypeScript', 'x': 500, 'y': 720, 'type': 'recommended', 'topics': ['Types', 'Interfaces', 'Generics']},
                {'id': 'testing', 'title': 'Testing', 'x': 500, 'y': 840, 'type': 'required', 'topics': ['Jest', 'React Testing Library', 'Cypress']},
            ],
            'connections': [
                {'from': 'internet', 'to': 'html'}, {'from': 'internet', 'to': 'css'}, {'from': 'internet', 'to': 'javascript'},
                {'from': 'html', 'to': 'vcs'}, {'from': 'css', 'to': 'vcs'}, {'from': 'javascript', 'to': 'vcs'},
                {'from': 'vcs', 'to': 'npm'}, {'from': 'npm', 'to': 'tailwind'},
                {'from': 'tailwind', 'to': 'react'}, {'from': 'tailwind', 'to': 'vue'},
                {'from': 'react', 'to': 'typescript'}, {'from': 'vue', 'to': 'typescript'},
                {'from': 'typescript', 'to': 'testing'}
            ],
            'faqs': [
                {'question': 'What is a Frontend Developer?', 'answer': 'A frontend developer builds the user interface of websites using HTML, CSS, and JavaScript.'},
                {'question': 'Do I need a CS degree?', 'answer': 'No, a degree is not required. A strong portfolio is more important.'},
                {'question': 'How long does it take to learn frontend?', 'answer': '3-6 months for basics, 6-12 months to be job-ready.'}
            ]
        },
        {
            'slug': 'backend',
            'title': 'Backend Developer',
            'description': 'Step by step guide to becoming a modern backend developer in 2025',
            'category': 'backend',
            'nodes': [
                {'id': 'internet', 'title': 'Internet', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['How does the internet work?', 'HTTP/HTTPS', 'APIs', 'DNS']},
                {'id': 'language', 'title': 'Pick a Language', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Node.js', 'Python', 'Java', 'Go', 'Rust']},
                {'id': 'git', 'title': 'Version Control', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Git Basics', 'GitHub', 'Branching']},
                {'id': 'databases', 'title': 'Relational Databases', 'x': 300, 'y': 360, 'type': 'required', 'topics': ['PostgreSQL', 'MySQL', 'SQL']},
                {'id': 'nosql', 'title': 'NoSQL Databases', 'x': 700, 'y': 360, 'type': 'recommended', 'topics': ['MongoDB', 'Redis', 'Firebase']},
                {'id': 'api', 'title': 'APIs', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['REST', 'JSON APIs', 'GraphQL', 'gRPC']},
                {'id': 'auth', 'title': 'Authentication', 'x': 300, 'y': 600, 'type': 'required', 'topics': ['JWT', 'OAuth 2.0', 'Session Auth']},
                {'id': 'caching', 'title': 'Caching', 'x': 700, 'y': 600, 'type': 'recommended', 'topics': ['Redis', 'Memcached', 'CDN']},
                {'id': 'testing', 'title': 'Testing', 'x': 500, 'y': 720, 'type': 'required', 'topics': ['Unit Testing', 'Integration Testing', 'E2E Testing']},
                {'id': 'docker', 'title': 'Containerization', 'x': 300, 'y': 840, 'type': 'required', 'topics': ['Docker', 'Docker Compose']},
                {'id': 'ci-cd', 'title': 'CI/CD', 'x': 700, 'y': 840, 'type': 'recommended', 'topics': ['GitHub Actions', 'Jenkins', 'GitLab CI']},
                {'id': 'cloud', 'title': 'Cloud Services', 'x': 500, 'y': 960, 'type': 'required', 'topics': ['AWS', 'GCP', 'Azure']},
            ],
            'connections': [
                {'from': 'internet', 'to': 'language'}, {'from': 'language', 'to': 'git'},
                {'from': 'git', 'to': 'databases'}, {'from': 'git', 'to': 'nosql'},
                {'from': 'databases', 'to': 'api'}, {'from': 'nosql', 'to': 'api'},
                {'from': 'api', 'to': 'auth'}, {'from': 'api', 'to': 'caching'},
                {'from': 'auth', 'to': 'testing'}, {'from': 'caching', 'to': 'testing'},
                {'from': 'testing', 'to': 'docker'}, {'from': 'testing', 'to': 'ci-cd'},
                {'from': 'docker', 'to': 'cloud'}, {'from': 'ci-cd', 'to': 'cloud'}
            ],
            'faqs': [
                {'question': 'What is a Backend Developer?', 'answer': 'A backend developer builds server-side applications, APIs, and databases.'},
                {'question': 'Which language should I learn first?', 'answer': 'Python or Node.js are great starting points.'}
            ]
        },
        {
            'slug': 'full-stack',
            'title': 'Full Stack Developer',
            'description': 'Complete guide to becoming a full stack developer',
            'category': 'fullstack',
            'nodes': [
                {'id': 'frontend', 'title': 'Frontend Basics', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['HTML', 'CSS', 'JavaScript']},
                {'id': 'react', 'title': 'React', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Components', 'Hooks', 'State Management']},
                {'id': 'node', 'title': 'Node.js', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Express', 'NPM', 'Middleware']},
                {'id': 'database', 'title': 'Databases', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['PostgreSQL', 'MongoDB']},
                {'id': 'api', 'title': 'REST APIs', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['CRUD', 'Authentication', 'Error Handling']},
                {'id': 'deploy', 'title': 'Deployment', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['Docker', 'Vercel', 'AWS']},
            ],
            'connections': [
                {'from': 'frontend', 'to': 'react'}, {'from': 'react', 'to': 'node'},
                {'from': 'node', 'to': 'database'}, {'from': 'database', 'to': 'api'},
                {'from': 'api', 'to': 'deploy'}
            ],
            'faqs': [
                {'question': 'What is a Full Stack Developer?', 'answer': 'Someone who works on both frontend and backend.'}
            ]
        },
        {
            'slug': 'devops-engineer',
            'title': 'DevOps Engineer',
            'description': 'Roadmap to becoming a DevOps engineer',
            'category': 'devops',
            'nodes': [
                {'id': 'linux', 'title': 'Linux', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Shell Commands', 'File System', 'Permissions']},
                {'id': 'networking', 'title': 'Networking', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['TCP/IP', 'DNS', 'HTTP', 'SSH']},
                {'id': 'scripting', 'title': 'Scripting', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Bash', 'Python']},
                {'id': 'git', 'title': 'Version Control', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['Git', 'GitHub', 'GitLab']},
                {'id': 'docker', 'title': 'Containers', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['Docker', 'Docker Compose']},
                {'id': 'kubernetes', 'title': 'Kubernetes', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['Pods', 'Services', 'Deployments']},
                {'id': 'ci-cd', 'title': 'CI/CD', 'x': 500, 'y': 720, 'type': 'required', 'topics': ['Jenkins', 'GitHub Actions', 'GitLab CI']},
                {'id': 'cloud', 'title': 'Cloud Providers', 'x': 500, 'y': 840, 'type': 'required', 'topics': ['AWS', 'GCP', 'Azure']},
                {'id': 'iac', 'title': 'Infrastructure as Code', 'x': 500, 'y': 960, 'type': 'required', 'topics': ['Terraform', 'Ansible', 'CloudFormation']},
                {'id': 'monitoring', 'title': 'Monitoring', 'x': 500, 'y': 1080, 'type': 'required', 'topics': ['Prometheus', 'Grafana', 'ELK Stack']},
            ],
            'connections': [
                {'from': 'linux', 'to': 'networking'}, {'from': 'networking', 'to': 'scripting'},
                {'from': 'scripting', 'to': 'git'}, {'from': 'git', 'to': 'docker'},
                {'from': 'docker', 'to': 'kubernetes'}, {'from': 'kubernetes', 'to': 'ci-cd'},
                {'from': 'ci-cd', 'to': 'cloud'}, {'from': 'cloud', 'to': 'iac'},
                {'from': 'iac', 'to': 'monitoring'}
            ],
            'faqs': [
                {'question': 'What is DevOps?', 'answer': 'DevOps combines development and operations to improve deployment speed and reliability.'}
            ]
        },
        {
            'slug': 'data-scientist',
            'title': 'Data Scientist',
            'description': 'Complete roadmap to becoming a data scientist',
            'category': 'data',
            'nodes': [
                {'id': 'python', 'title': 'Python', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Basics', 'NumPy', 'Pandas']},
                {'id': 'stats', 'title': 'Statistics', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Descriptive', 'Inferential', 'Probability']},
                {'id': 'viz', 'title': 'Data Visualization', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Matplotlib', 'Seaborn', 'Plotly']},
                {'id': 'ml', 'title': 'Machine Learning', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['Scikit-learn', 'Regression', 'Classification']},
                {'id': 'dl', 'title': 'Deep Learning', 'x': 500, 'y': 480, 'type': 'recommended', 'topics': ['TensorFlow', 'PyTorch', 'Neural Networks']},
                {'id': 'sql', 'title': 'SQL', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['Queries', 'Joins', 'Aggregations']},
            ],
            'connections': [
                {'from': 'python', 'to': 'stats'}, {'from': 'stats', 'to': 'viz'},
                {'from': 'viz', 'to': 'ml'}, {'from': 'ml', 'to': 'dl'},
                {'from': 'ml', 'to': 'sql'}
            ],
            'faqs': [
                {'question': 'What does a Data Scientist do?', 'answer': 'Analyzes data to extract insights and build predictive models.'}
            ]
        },
        {
            'slug': 'react',
            'title': 'React Developer',
            'description': 'Master React and its ecosystem',
            'category': 'frontend',
            'nodes': [
                {'id': 'js', 'title': 'JavaScript', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['ES6+', 'Async/Await', 'Modules']},
                {'id': 'react-basics', 'title': 'React Basics', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['JSX', 'Components', 'Props']},
                {'id': 'hooks', 'title': 'Hooks', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['useState', 'useEffect', 'useContext', 'Custom Hooks']},
                {'id': 'state', 'title': 'State Management', 'x': 300, 'y': 360, 'type': 'required', 'topics': ['Redux', 'Zustand', 'Jotai']},
                {'id': 'routing', 'title': 'Routing', 'x': 700, 'y': 360, 'type': 'required', 'topics': ['React Router', 'TanStack Router']},
                {'id': 'styling', 'title': 'Styling', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['Tailwind', 'Styled Components', 'CSS Modules']},
                {'id': 'testing', 'title': 'Testing', 'x': 500, 'y': 600, 'type': 'required', 'topics': ['Jest', 'React Testing Library', 'Playwright']},
                {'id': 'nextjs', 'title': 'Next.js', 'x': 500, 'y': 720, 'type': 'recommended', 'topics': ['App Router', 'Server Components', 'API Routes']},
            ],
            'connections': [
                {'from': 'js', 'to': 'react-basics'}, {'from': 'react-basics', 'to': 'hooks'},
                {'from': 'hooks', 'to': 'state'}, {'from': 'hooks', 'to': 'routing'},
                {'from': 'state', 'to': 'styling'}, {'from': 'routing', 'to': 'styling'},
                {'from': 'styling', 'to': 'testing'}, {'from': 'testing', 'to': 'nextjs'}
            ],
            'faqs': [
                {'question': 'Why learn React?', 'answer': 'React is the most popular frontend library with a huge job market.'}
            ]
        },
        {
            'slug': 'python',
            'title': 'Python Developer',
            'description': 'Complete Python learning path',
            'category': 'backend',
            'nodes': [
                {'id': 'basics', 'title': 'Python Basics', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Syntax', 'Data Types', 'Functions', 'OOP']},
                {'id': 'advanced', 'title': 'Advanced Python', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Decorators', 'Generators', 'Context Managers']},
                {'id': 'web', 'title': 'Web Frameworks', 'x': 300, 'y': 240, 'type': 'required', 'topics': ['Flask', 'Django', 'FastAPI']},
                {'id': 'data', 'title': 'Data Science', 'x': 700, 'y': 240, 'type': 'alternative', 'topics': ['NumPy', 'Pandas', 'Matplotlib']},
                {'id': 'databases', 'title': 'Databases', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['SQLAlchemy', 'PostgreSQL', 'MongoDB']},
                {'id': 'testing', 'title': 'Testing', 'x': 500, 'y': 480, 'type': 'required', 'topics': ['pytest', 'unittest', 'Mock']},
            ],
            'connections': [
                {'from': 'basics', 'to': 'advanced'},
                {'from': 'advanced', 'to': 'web'}, {'from': 'advanced', 'to': 'data'},
                {'from': 'web', 'to': 'databases'}, {'from': 'data', 'to': 'databases'},
                {'from': 'databases', 'to': 'testing'}
            ],
            'faqs': [
                {'question': 'Why learn Python?', 'answer': 'Python is versatile - used in web dev, data science, AI, automation, and more.'}
            ]
        },
        {
            'slug': 'javascript',
            'title': 'JavaScript Developer',
            'description': 'Master JavaScript from basics to advanced',
            'category': 'frontend',
            'nodes': [
                {'id': 'basics', 'title': 'JS Basics', 'x': 500, 'y': 0, 'type': 'required', 'topics': ['Variables', 'Functions', 'Arrays', 'Objects']},
                {'id': 'dom', 'title': 'DOM Manipulation', 'x': 500, 'y': 120, 'type': 'required', 'topics': ['Selectors', 'Events', 'Modifications']},
                {'id': 'async', 'title': 'Async JavaScript', 'x': 500, 'y': 240, 'type': 'required', 'topics': ['Promises', 'Async/Await', 'Fetch API']},
                {'id': 'es6', 'title': 'ES6+ Features', 'x': 500, 'y': 360, 'type': 'required', 'topics': ['Arrow Functions', 'Destructuring', 'Modules', 'Classes']},
                {'id': 'typescript', 'title': 'TypeScript', 'x': 500, 'y': 480, 'type': 'recommended', 'topics': ['Types', 'Interfaces', 'Generics']},
                {'id': 'node', 'title': 'Node.js', 'x': 500, 'y': 600, 'type': 'alternative', 'topics': ['NPM', 'Express', 'File System']},
            ],
            'connections': [
                {'from': 'basics', 'to': 'dom'}, {'from': 'dom', 'to': 'async'},
                {'from': 'async', 'to': 'es6'}, {'from': 'es6', 'to': 'typescript'},
                {'from': 'es6', 'to': 'node'}
            ],
            'faqs': [
                {'question': 'Is JavaScript hard to learn?', 'answer': 'JavaScript has an easy learning curve but depth takes time to master.'}
            ]
        }
    ]
    
    for roadmap_data in roadmaps:
        # Check if already exists
        existing = Roadmap.query.filter_by(slug=roadmap_data['slug']).first()
        if existing:
            print(f"Roadmap '{roadmap_data['slug']}' already exists, skipping...")
            continue
        
        roadmap = Roadmap(
            slug=roadmap_data['slug'],
            title=roadmap_data['title'],
            description=roadmap_data['description'],
            category=roadmap_data['category'],
            nodes=roadmap_data['nodes'],
            connections=roadmap_data['connections'],
            faqs=roadmap_data['faqs'],
            is_official=True,
            is_published=True
        )
        db.session.add(roadmap)
        print(f"Added roadmap: {roadmap_data['title']}")
    
    db.session.commit()
    print("\nSeeding complete!")


if __name__ == '__main__':
    app = create_app('development')
    with app.app_context():
        seed_roadmaps()

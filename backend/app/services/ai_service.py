"""
CareerSage AI Service — Parallel Generation + MongoDB Cache + Streaming
Uses 3 NVIDIA API keys for concurrent roadmap generation.
"""
import json
import re
import random
import eventlet
from flask import current_app
from openai import OpenAI


class AIService:
    """AI-powered roadmap and quiz generation with parallel API calls."""

    NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

    def __init__(self):
        self._clients = {}
        self._key_counter = 0  # Round-robin across 3 keys

    # ──────────────────────────────────────────
    #  Client / API helpers
    # ──────────────────────────────────────────

    def _get_api_key(self, key_index=0):
        """Get API key for a specific slot (0/1/2)."""
        key_names = ['NVIDIA_API_KEY', 'NVIDIA_API_KEY_2', 'NVIDIA_API_KEY_3']
        key_name = key_names[key_index] if key_index < len(key_names) else key_names[0]
        return current_app.config.get(key_name, '') or current_app.config.get('NVIDIA_API_KEY', '')

    def _get_model(self):
        return current_app.config.get('NVIDIA_MODEL', 'meta/llama-3.1-8b-instruct')

    def call_nvidia_api(self, prompt, key_index=0, system_msg="You are an expert career roadmap generator. Output ONLY valid JSON."):
        """Call NVIDIA API directly using requests to avoid eventlet/httpx hangs."""
        import requests
        try:
            api_key = self._get_api_key(key_index)
            model = self._get_model()
            current_app.logger.info(f"[API-{key_index}] Calling {model} via requests...")

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.6,
                "top_p": 0.95,
                "max_tokens": 4096,
                "stream": False
            }

            response = requests.post(
                f"{self.NVIDIA_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=40
            )
            response.raise_for_status()
            
            data = response.json()
            if 'choices' not in data or not data['choices']:
                return None

            content = data['choices'][0]['message']['content']
            current_app.logger.info(f"[API-{key_index}] Response: {len(content or '')} chars")
            return content

        except Exception as e:
            current_app.logger.error(f"[API-{key_index}] Exception: {type(e).__name__}: {e}")
            return None

    def parse_json_response(self, content):
        """Extract and parse JSON from AI response."""
        if not content:
            return None
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        for pattern in [r'```json\s*(\{.*?\})\s*```', r'```\s*(\{.*?\})\s*```', r'(\{.*\})']:
            match = re.search(pattern, content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    continue

        current_app.logger.error("Could not parse JSON from response")
        return None

    # ──────────────────────────────────────────
    #  Streaming progress via Socket.IO
    # ──────────────────────────────────────────

    def _emit_progress(self, user_id, step, message, progress):
        """Push real-time progress to the user's browser."""
        if not user_id:
            return
        try:
            from ..routes.battle import user_sid_map
            from ..extensions import socketio
            sid = user_sid_map.get(user_id)
            if sid:
                socketio.emit('roadmap_progress', {
                    'step': step,
                    'message': message,
                    'progress': progress
                }, to=sid, namespace='/')
        except Exception:
            pass

    # ──────────────────────────────────────────
    #  MongoDB Cache
    # ──────────────────────────────────────────

    def _check_cache(self, topic, mode, experience_level):
        """Return cached roadmap or None."""
        from ..models.cache import RoadmapCache
        key = RoadmapCache.make_key(topic, mode, experience_level)
        cached = RoadmapCache.objects(cache_key=key).first()
        if cached:
            cached.update(inc__hit_count=1)
            current_app.logger.info(f"[CACHE HIT] {key} (hits: {cached.hit_count + 1})")
            return cached.roadmap_data
        return None

    def _save_cache(self, topic, mode, experience_level, roadmap_data):
        """Upsert roadmap into cache."""
        from ..models.cache import RoadmapCache
        key = RoadmapCache.make_key(topic, mode, experience_level)
        try:
            RoadmapCache.objects(cache_key=key).update_one(
                set__roadmap_data=roadmap_data,
                set__topic=topic,
                set__mode=mode,
                set__experience_level=experience_level,
                upsert=True
            )
            current_app.logger.info(f"[CACHE SAVED] {key}")
        except Exception as e:
            current_app.logger.error(f"[CACHE ERROR] {e}")

    # ──────────────────────────────────────────
    #  Topic validation
    # ──────────────────────────────────────────

    def is_tech_topic(self, topic):
        """Check if topic is technology-related."""
        topic_lower = topic.lower().strip()

        blocked_keywords = [
            'pornstar', 'porn', 'adult', 'sex', 'escort',
            'movie star', 'actor', 'actress', 'singer', 'musician',
            'athlete', 'football', 'soccer', 'basketball', 'sport'
        ]
        for blocked in blocked_keywords:
            if blocked in topic_lower:
                if 'ethical' in topic_lower and 'hack' in topic_lower:
                    continue
                return False

        tech_keywords = [
            'developer', 'engineer', 'programmer', 'software', 'web', 'mobile',
            'architect', 'administrator', 'analyst', 'consultant', 'devrel',
            'data', 'ai', 'machine learning', 'ml', 'deep learning',
            'nlp', 'neural', 'generative', 'llm', 'chatbot',
            'devops', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
            'terraform', 'ansible', 'jenkins', 'ci/cd', 'linux', 'sre',
            'frontend', 'backend', 'fullstack', 'full stack', 'api',
            'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
            'node', 'django', 'flask', 'spring', 'express', 'fastapi',
            'c#', 'csharp', 'c sharp', '.net', 'dotnet', 'asp.net',
            'c++', 'cpp', 'rust', 'golang', 'go lang', 'swift', 'kotlin',
            'ruby', 'rails', 'php', 'laravel', 'perl', 'scala', 'elixir',
            'r ', 'dart', 'lua', 'haskell', 'clojure',
            'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
            'redis', 'cassandra', 'dynamodb', 'firebase', 'supabase',
            'embedded', 'iot', 'robotics', 'firmware', 'arduino', 'raspberry',
            'plc', 'scada', 'microcontroller',
            'cyber', 'security', 'hacking', 'penetration', 'ethical hack',
            'soc', 'siem', 'forensic',
            'blockchain', 'crypto', 'smart contract', 'solidity', 'web3',
            'game', 'unity', 'unreal', 'godot',
            'android', 'ios', 'flutter', 'react native', 'swiftui',
            'ui', 'ux', 'design', 'product', 'figma', 'wireframe',
            'qa', 'testing', 'automation', 'selenium', 'playwright', 'cypress',
            'autocad', 'solidworks', 'catia', 'creo', 'revit', 'fusion 360',
            'inventor', 'freecad', 'openscad', 'sketchup',
            '3d', 'cad', 'cam', 'cae', 'modeling', 'simulation',
            'blender', 'maya', '3ds max', 'zbrush', 'houdini',
            'ansys', 'abaqus', 'comsol', 'fea', 'cfd',
            'matlab', 'mathematica', 'labview', 'simulink', 'octave',
            'spss', 'stata', 'tableau', 'power bi', 'sas',
            'sap', 'erp', 'crm', 'salesforce', 'servicenow', 'oracle',
            'tech', 'it', 'computer', 'coding', 'programming',
            'networking', 'cisco', 'ccna', 'comptia', 'vmware',
            'photoshop', 'illustrator', 'premiere', 'after effects',
            'excel', 'vba', 'macro', 'sharepoint', 'office 365',
            'git', 'github', 'gitlab', 'version control',
        ]

        return any(kw in topic_lower for kw in tech_keywords)

    # ──────────────────────────────────────────
    #  Prompt builders
    # ──────────────────────────────────────────

    def _build_beginner_prompt(self, topic, skills_text, experience_level, career_goal):
        return f"""Generate a simple learning roadmap for: **{topic}**

**User Profile:** Skills: {skills_text} | Level: {experience_level} | Goal: {career_goal}

**Requirements:**
1. Exactly 7-8 nodes. Each with: id (lowercase-hyphens), title (4-5 words), description (1-2 sentences), topics (3-4 items), estimatedTime, type ("required"/"recommended"), resources: []
2. DAG flow: 1 root → 2 branches → 1 merge → 2 branches → 1 final
3. Edges define dependency

**Output ONLY valid JSON:**
{{"title": "{topic} - Quick Path", "description": "...", "nodes": [{{"id": "x", "title": "X", "description": "...", "type": "required", "estimatedTime": "2 weeks", "topics": ["A","B"], "resources": []}}], "edges": [{{"source": "a", "target": "b"}}]}}

Keep it simple. 7-8 nodes. NO resources. Branching edges."""

    def _build_structure_prompt(self, topic, skills_text, experience_level, career_goal):
        """Prompt for structure-only (no resources) — used as Step 1 of parallel generation."""
        return f"""Generate a learning roadmap STRUCTURE for: **{topic}**

**User Profile:** Skills: {skills_text} | Level: {experience_level} | Goal: {career_goal}

**Requirements:**
1. Create 12-15 nodes. Each with: id (lowercase-hyphens), title (4-5 words), description (2-3 sentences), topics (3-5 items), estimatedTime, type ("required"/"recommended"), resources: [] (EMPTY)
2. DAG flow: 1 root → 2-3 branches → merge → 2-3 branches → merge → 1 final
3. Edges define dependency

**Output ONLY valid JSON:**
{{"title": "{topic} - Complete Learning Path", "description": "...", "nodes": [{{"id": "x", "title": "X", "description": "...", "type": "required", "estimatedTime": "2 weeks", "topics": ["A","B","C"], "resources": []}}], "edges": [{{"source": "a", "target": "b"}}]}}

IMPORTANT: NO resources. Just structure with 12-15 nodes and branching edges."""

    def _build_resources_prompt(self, topic, node_titles):
        """Prompt for generating resources for a list of node titles."""
        titles_list = "\n".join(f"- {t}" for t in node_titles)
        return f"""For a **{topic}** learning roadmap, generate 3 FREE learning resources for EACH of these topics:

{titles_list}

For each topic provide exactly 3 resources:
1. A YouTube video tutorial (real youtube.com URL)
2. A blog/article (real URL from popular tech sites)
3. Official documentation (real docs URL)

**Output ONLY valid JSON:**
{{"resources": [{{"node_title": "Topic Title", "resources": [{{"title": "Video Name", "url": "https://youtube.com/...", "type": "video"}}, {{"title": "Article", "url": "https://...", "type": "article"}}, {{"title": "Docs", "url": "https://...", "type": "docs"}}]}}]}}

Use REAL, working URLs. Output valid JSON only."""

    def _build_advanced_prompt(self, topic, skills_text, experience_level, career_goal):
        """Full advanced prompt (fallback if parallel fails)."""
        return f"""Generate a personalized learning roadmap for: **{topic}**

**User Profile:** Skills: {skills_text} | Level: {experience_level} | Goal: {career_goal}

**Requirements:**
1. 12-15 nodes with: id, title, description, topics, estimatedTime, type, 3 resources each (1 YouTube, 1 article, 1 docs with REAL URLs)
2. DAG flow: 1 root → 2-3 branches → merge → 2-3 branches → merge → 1 final
3. Edges define dependency

**Output ONLY valid JSON:**
{{"title": "{topic} - Complete Learning Path", "description": "...", "nodes": [{{"id": "x", "title": "X", "description": "...", "type": "required", "estimatedTime": "2 weeks", "topics": ["A","B","C"], "resources": [{{"title": "V", "url": "https://youtube.com/...", "type": "video"}}, {{"title": "A", "url": "https://...", "type": "article"}}, {{"title": "D", "url": "https://...", "type": "docs"}}]}}], "edges": [{{"source": "a", "target": "b"}}]}}

Use REAL URLs. Create branching edges, NOT a linear chain."""

    # ──────────────────────────────────────────
    #  Layout + Validation (unchanged)
    # ──────────────────────────────────────────

    def _apply_hierarchical_layout(self, data):
        """Apply hierarchical grid layout for node positioning."""
        nodes = data.get('nodes', [])
        connections = data.get('connections', [])
        if not nodes:
            return

        NODE_WIDTH, NODE_HEIGHT, RANK_SEP, NODE_SEP = 220, 80, 100, 80
        node_map = {n['id']: n for n in nodes}
        adj = {n['id']: [] for n in nodes}
        rev_adj = {n['id']: [] for n in nodes}
        in_degree = {n['id']: 0 for n in nodes}

        for conn in connections:
            u = conn.get('from') or conn.get('source')
            v = conn.get('to') or conn.get('target')
            if u in node_map and v in node_map:
                adj[u].append(v)
                rev_adj[v].append(u)
                in_degree[v] += 1

        ranks = {}
        queue = [n['id'] for n in nodes if in_degree[n['id']] == 0]
        if not queue and nodes:
            queue = [nodes[0]['id']]
        for root in queue:
            ranks[root] = 0

        process_queue = [(n, 0) for n in queue]
        while process_queue:
            curr, rank = process_queue.pop(0)
            ranks[curr] = max(ranks.get(curr, 0), rank)
            for neighbor in adj[curr]:
                if ranks.get(neighbor, -1) < rank + 1 and rank < 50:
                    process_queue.append((neighbor, rank + 1))

        max_rank = max(ranks.values()) if ranks else 0
        for node in nodes:
            if node['id'] not in ranks:
                max_rank += 1
                ranks[node['id']] = max_rank

        rank_groups = {}
        for nid, r in ranks.items():
            rank_groups.setdefault(r, []).append(nid)

        sorted_ranks = sorted(rank_groups.keys())
        for r in sorted_ranks:
            rank_groups[r].sort()

        for _ in range(4):
            for i in range(1, len(sorted_ranks)):
                r = sorted_ranks[i]
                prev_r = sorted_ranks[i - 1]
                prev_order = {nid: idx for idx, nid in enumerate(rank_groups[prev_r])}

                def avg_parent_pos(nid, _po=prev_order, _ra=rev_adj):
                    parents = [p for p in _ra[nid] if p in _po]
                    return sum(_po[p] for p in parents) / len(parents) if parents else 9999

                rank_groups[r].sort(key=avg_parent_pos)

        for r in sorted_ranks:
            group = rank_groups[r]
            row_w = len(group) * NODE_WIDTH + (len(group) - 1) * NODE_SEP
            start_x = 600 - (row_w / 2)
            y_pos = r * (NODE_HEIGHT + RANK_SEP)
            for idx, nid in enumerate(group):
                node = node_map[nid]
                node['targetPosition'] = 'top'
                node['sourcePosition'] = 'bottom'
                node['x'] = int(start_x + idx * (NODE_WIDTH + NODE_SEP))
                node['y'] = int(y_pos)

    def validate_roadmap(self, data, topic):
        """Validate and fix roadmap structure."""
        data['title'] = f"{topic.title()} - Complete Path"
        data['description'] = f"Comprehensive learning path for {topic} covering all key concepts."

        if 'nodes' not in data or not isinstance(data['nodes'], list):
            data['nodes'] = []
        if 'edges' in data and isinstance(data['edges'], list):
            data['connections'] = data['edges']
        if 'connections' not in data or not isinstance(data['connections'], list):
            data['connections'] = []

        for i, node in enumerate(data['nodes']):
            node.setdefault('id', f"node-{i+1}")
            node.setdefault('title', f"Learning Step {i+1}")
            node.setdefault('description', "Important learning milestone")
            node.setdefault('type', 'custom')
            node.setdefault('topics', [])
            node.setdefault('resources', [])
            node.setdefault('estimatedTime', '2 weeks')

        try:
            self._apply_hierarchical_layout(data)
        except Exception as e:
            current_app.logger.error(f"Layout failed: {e}")
            for i, node in enumerate(data['nodes']):
                node['x'] = 500
                node['y'] = i * 200

        return data

    # ──────────────────────────────────────────
    #  Roadmap generation (with parallel + cache)
    # ──────────────────────────────────────────

    def generate_roadmap(self, topic, skills=None, experience_level="beginner",
                         career_goal="learn", mode="beginner", user_id=None):
        """Generate roadmap with caching, parallel API calls, and streaming progress."""
        skills = skills or []

        if not self.is_tech_topic(topic):
            return {
                "error": "non_tech_topic",
                "message": f"'{topic}' is not a valid technology career topic. Please enter a tech-related career."
            }

        # ── Check cache ──
        cached = self._check_cache(topic, mode, experience_level)
        if cached:
            self._emit_progress(user_id, 1, '⚡ Loaded from cache!', 100)
            current_app.logger.info(f"Returning cached roadmap for '{topic}'")
            return cached

        current_app.logger.info(f"Generating AI roadmap for: {topic} (mode: {mode})")
        skills_text = ", ".join(skills) if skills else "None specified"

        if mode == 'beginner':
            roadmap = self._generate_beginner(topic, skills_text, experience_level, career_goal, user_id)
        else:
            roadmap = self._generate_advanced_parallel(topic, skills_text, experience_level, career_goal, user_id)

        # ── Save to cache ──
        if roadmap and 'error' not in roadmap:
            self._save_cache(topic, mode, experience_level, roadmap)

        return roadmap

    def _generate_beginner(self, topic, skills_text, experience_level, career_goal, user_id=None):
        """Beginner mode — single API call + DuckDuckGo resources."""
        self._emit_progress(user_id, 1, '🧠 Generating roadmap...', 30)

        prompt = self._build_beginner_prompt(topic, skills_text, experience_level, career_goal)
        key_idx = self._key_counter % 3
        self._key_counter += 1
        content = self.call_nvidia_api(prompt, key_index=key_idx)
        if not content:
            return None

        data = self.parse_json_response(content)
        if not data:
            return None

        # Fetch real resources via DuckDuckGo
        self._emit_progress(user_id, 2, '🔍 Finding learning resources...', 60)
        self._fetch_ddg_resources(data.get('nodes', []), topic)

        self._emit_progress(user_id, 3, '✅ Finalizing...', 90)
        return self.validate_roadmap(data, topic)

    def _generate_advanced_parallel(self, topic, skills_text, experience_level, career_goal, user_id=None):
        """Advanced mode — Step 1: AI structure, Step 2: DuckDuckGo resources (real URLs)."""

        # ── Step 1: Generate structure with AI ──
        self._emit_progress(user_id, 1, '🏗️ Building roadmap structure...', 15)

        structure_prompt = self._build_structure_prompt(topic, skills_text, experience_level, career_goal)
        key_idx = self._key_counter % 3
        self._key_counter += 1
        content = self.call_nvidia_api(structure_prompt, key_index=key_idx)

        if not content:
            current_app.logger.warning("Structure call failed, trying fallback")
            return self._generate_advanced_fallback(topic, skills_text, experience_level, career_goal, user_id)

        data = self.parse_json_response(content)
        if not data or 'nodes' not in data or len(data['nodes']) < 3:
            return self._generate_advanced_fallback(topic, skills_text, experience_level, career_goal, user_id)

        nodes = data['nodes']
        current_app.logger.info(f"Structure ready: {len(nodes)} nodes. Fetching resources via DuckDuckGo...")
        self._emit_progress(user_id, 2, f'🔍 Searching real resources for {len(nodes)} nodes...', 50)

        # ── Step 2: Fetch REAL resources via DuckDuckGo (parallel) ──
        self._fetch_ddg_resources(data['nodes'], topic)

        self._emit_progress(user_id, 3, '✅ Roadmap ready!', 95)
        return self.validate_roadmap(data, topic)

    def _fetch_ddg_resources(self, nodes, topic):
        """Fetch real resources using the existing SearchService (proven to work)."""
        from .search_service import search_service
        import eventlet
        
        app = current_app._get_current_object()

        def fetch_for_node(node):
            with app.app_context():
                title = node.get('title', '')
                try:
                    results = search_service.search_resources(f"{title} {topic}", max_results=3)
                    node['resources'] = results
                    app.logger.info(f"[RES] {title}: {len(results)} resources found")
                except Exception as e:
                    app.logger.warning(f"[RES] Failed for '{title}': {e}")
                    node['resources'] = []

        # Run DuckDuckGo searches in parallel using Eventlet GreenPool (since the app uses eventlet)
        pool = eventlet.GreenPool(size=10)
        for _ in pool.imap(fetch_for_node, nodes):
            pass

        matched = sum(1 for n in nodes if n.get('resources'))
        app.logger.info(f"[RES] Total: {matched}/{len(nodes)} nodes have resources")

    def _generate_advanced_fallback(self, topic, skills_text, experience_level, career_goal, user_id=None):
        """Fallback: single full API call if parallel fails."""
        self._emit_progress(user_id, 2, '🔄 Generating full roadmap (fallback)...', 40)

        prompt = self._build_advanced_prompt(topic, skills_text, experience_level, career_goal)
        content = self.call_nvidia_api(prompt, key_index=0)
        if not content:
            return None
        data = self.parse_json_response(content)
        if not data:
            return None
        return self.validate_roadmap(data, topic)

    # ──────────────────────────────────────────
    #  Skill Test generation (unchanged)
    # ──────────────────────────────────────────

    def generate_skill_test(self, skill, topics=None):
        """Generate a skill test with 10 MCQ questions for a given skill."""
        topics_text = ", ".join(topics) if topics else skill

        prompt = f"""Generate a skill assessment test for: **{skill}**

Topics to cover: {topics_text}

Create exactly 10 multiple-choice questions that test practical knowledge of {skill}.

**Output ONLY valid JSON** in this exact format:
{{
  "skill": "{skill}",
  "questions": [
    {{
      "id": 1,
      "question": "What is the purpose of X in {skill}?",
      "category": "Core Concepts",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why the answer is correct."
    }}
  ]
}}

Rules:
- Questions should range from beginner to intermediate difficulty
- Each question must have exactly 4 options
- "correct" is the 0-based index of the correct option
- Include a brief explanation for each answer
- Cover different aspects of {skill}
- Make questions practical and applied, not just theoretical
- IMPORTANT: Randomize the position of the correct answer across questions. Do NOT always put the correct answer at the same index.

Generate the test now."""

        current_app.logger.info(f"Generating skill test for: {skill}")

        content = self.call_nvidia_api(prompt)
        if not content:
            return None

        data = self.parse_json_response(content)
        if not data or 'questions' not in data:
            return None

        for q in data['questions']:
            if 'options' not in q or len(q['options']) != 4:
                continue
            if 'correct' not in q or not isinstance(q['correct'], int):
                q['correct'] = 0
            if 'explanation' not in q:
                q['explanation'] = ''
            correct_idx = q['correct']
            if 0 <= correct_idx < len(q['options']):
                correct_answer = q['options'][correct_idx]
                shuffled = list(q['options'])
                random.shuffle(shuffled)
                q['options'] = shuffled
                q['correct'] = shuffled.index(correct_answer)

        current_app.logger.info(f"Generated {len(data['questions'])} questions for {skill}")
        return data


ai_service = AIService()

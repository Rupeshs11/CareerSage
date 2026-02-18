import json
import re
from flask import current_app
from openai import OpenAI


class AIService:
    """Service for AI-powered roadmap generation using NVIDIA API."""
    
    NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
    # NVIDIA_API_KEY removed - loaded from config
    NVIDIA_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5"
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            self._client = OpenAI(
                base_url=self.NVIDIA_BASE_URL,
                api_key=current_app.config['NVIDIA_API_KEY']
            )
            current_app.logger.info("NVIDIA API client initialized")
        return self._client
    
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
                current_app.logger.warning(f"Blocked topic: '{topic}'")
                return False
        
        tech_keywords = [
            'developer', 'engineer', 'programmer', 'software', 'web', 'mobile',
            'data', 'ai', 'machine learning', 'ml', 'deep learning',
            'devops', 'cloud', 'aws', 'azure', 'gcp',
            'frontend', 'backend', 'fullstack', 'full stack',
            'python', 'java', 'javascript', 'react', 'angular', 'vue',
            'node', 'django', 'flask', 'spring',
            'database', 'sql', 'nosql', 'mongodb', 'postgresql',
            'embedded', 'iot', 'robotics', 'firmware',
            'cyber', 'security', 'hacking', 'penetration',
            'blockchain', 'crypto', 'smart contract',
            'game', 'unity', 'unreal',
            'android', 'ios', 'flutter', 'react native',
            'ui', 'ux', 'design', 'product',
            'qa', 'testing', 'automation',
            'tech', 'it', 'computer', 'coding', 'programming'
        ]
        
        is_tech = any(keyword in topic_lower for keyword in tech_keywords)
        
        if not is_tech:
            current_app.logger.warning(f"Non-tech topic rejected: '{topic}'")
        
        return is_tech
    
    def build_roadmap_prompt(self, topic, skills, experience_level, career_goal):
        """Build the AI prompt for roadmap generation."""
        skills_text = ", ".join(skills) if skills else "None specified"
        
        return f"""Generate a personalized learning roadmap for: **{topic}**

**User Profile:**
- Current Skills: {skills_text}
- Experience Level: {experience_level}
- Career Goal: {career_goal}

**Requirements:**
1. Create 12-15 learning nodes covering the complete journey
2. Each node must have:
   - Unique ID (lowercase-with-hyphens)
   - Clear title (keep it short, max 4-5 words)
   - Description (2-3 sentences)
   - Topics list (3-5 key concepts)
   - Estimated time
   - 3 FREE resources with REAL, working URLs:
     * 1 YouTube video tutorial (use real youtube.com URLs)
     * 1 blog article/guide (use real URLs from popular tech blogs)
     * 1 official documentation (use real documentation URLs)
   - Type: "required" or "recommended"

3. **CRITICAL - Create a proper DAG (Directed Acyclic Graph) flow:**
   - Start with 1 foundation node at the top
   - Branch into 2-3 parallel paths for related skills that can be learned simultaneously
   - Merge branches back into a single node before branching again
   - The flow pattern should look like: 
     * 1 root → 2-3 branches → 1 merge → 2-3 branches → 1 merge → 1 final
   - This creates a diamond/tree-like structure, NOT a simple linear chain
   - Every node must have at least one incoming and one outgoing edge (except first/last)

4. Edges define the learning dependency flow

**Output ONLY valid JSON** in this exact format:
{{
  "title": "{topic} - Complete Learning Path",
  "description": "Comprehensive roadmap for {topic}...",
  "nodes": [
    {{
      "id": "node-id",
      "title": "Node Title",
      "description": "What you'll learn...",
      "type": "required",
      "estimatedTime": "2 weeks",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "resources": [
        {{"title": "Video Title", "url": "https://youtube.com/...", "type": "video"}},
        {{"title": "Article Title", "url": "https://...", "type": "article"}},
        {{"title": "Docs Title", "url": "https://...", "type": "docs"}}
      ]
    }}
  ],
  "edges": [
    {{"source": "node1-id", "target": "node2-id"}}
  ]
}}

IMPORTANT: Use real, working URLs. Create branching and merging edges for a proper flowchart structure, NOT a purely linear chain.

Generate the roadmap now."""

    def call_nvidia_api(self, prompt):
        """Call NVIDIA API and return response content."""
        try:
            current_app.logger.info("Calling NVIDIA API...")
            
            response = self.client.chat.completions.create(
                model=self.NVIDIA_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert career roadmap generator. Output ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                top_p=0.95,
                max_tokens=8192,
                stream=False
            )
            
            if not response or not response.choices:
                current_app.logger.error("API returned empty response")
                return None
            
            content = response.choices[0].message.content
            
            if not content:
                current_app.logger.error("API returned None content")
                return None
            
            current_app.logger.info(f"API response received ({len(content)} chars)")
            return content
            
        except Exception as e:
            current_app.logger.error(f"API Exception: {type(e).__name__}: {str(e)}")
            return None
    
    def parse_json_response(self, content):
        """Extract and parse JSON from AI response."""
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        json_patterns = [
            r'```json\s*(\{.*?\})\s*```',
            r'```\s*(\{.*?\})\s*```',
            r'(\{.*\})'
        ]
        
        for pattern in json_patterns:
            match = re.search(pattern, content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    continue
        
        current_app.logger.error("Could not parse JSON from response")
        current_app.logger.debug(f"Response preview: {content[:500]}...")
        return None
    
    def _apply_hierarchical_layout(self, data):
        """Apply hierarchical grid layout for node positioning."""
        nodes = data.get('nodes', [])
        connections = data.get('connections', [])
        
        if not nodes:
            return

        NODE_WIDTH = 220
        NODE_HEIGHT = 80
        RANK_SEP = 100
        NODE_SEP = 80
        DIRECTION = "TB"

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
        if not queue and nodes: queue = [nodes[0]['id']]
        
        for root in queue: ranks[root] = 0
            
        process_queue = [(n, 0) for n in queue]
        visited_in_path = {}
        
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
            if r not in rank_groups: rank_groups[r] = []
            rank_groups[r].append(nid)
            
        sorted_ranks = sorted(rank_groups.keys())
        
        for r in sorted_ranks:
            rank_groups[r].sort(key=lambda nid: nid)
            
        MAX_ITERATIONS = 4
        for _ in range(MAX_ITERATIONS):
            for i in range(1, len(sorted_ranks)):
                r = sorted_ranks[i]
                prev_r = sorted_ranks[i-1]
                prev_order = {nid: idx for idx, nid in enumerate(rank_groups[prev_r])}
                
                def avg_parent_pos(nid):
                    parents = [p for p in rev_adj[nid] if p in prev_order]
                    if not parents: return 9999
                    return sum(prev_order[p] for p in parents) / len(parents)
                
                rank_groups[r].sort(key=avg_parent_pos)
        
        canvas_width_per_rank = {}
        
        for r in sorted_ranks:
            group = rank_groups[r]
            row_width = len(group) * NODE_WIDTH + (len(group) - 1) * NODE_SEP
            canvas_width_per_rank[r] = row_width
            
            start_x = 600 - (row_width / 2)
            current_x = start_x
            y_pos = r * (NODE_HEIGHT + RANK_SEP)
            
            for nid in group:
                node = node_map[nid]
                node['targetPosition'] = 'top'
                node['sourcePosition'] = 'bottom'
                node['x'] = int(current_x)
                node['y'] = int(y_pos)
                current_x += NODE_WIDTH + NODE_SEP
                
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
            if 'id' not in node:
                node['id'] = f"node-{i+1}"
            if 'title' not in node:
                node['title'] = f"Learning Step {i+1}"
            if 'description' not in node:
                node['description'] = "Important learning milestone"
            if 'type' not in node:
                node['type'] = 'custom'
            if 'topics' not in node:
                node['topics'] = []
            if 'resources' not in node:
                node['resources'] = []
            if 'estimatedTime' not in node:
                node['estimatedTime'] = '2 weeks'
                
        try:
            self._apply_hierarchical_layout(data)
        except Exception as e:
            current_app.logger.error(f"Layout failed: {e}")
            for i, node in enumerate(data['nodes']):
                node['x'] = 500
                node['y'] = i * 200
        
        current_app.logger.info(f"Validated roadmap with {len(data['nodes'])} nodes")
        return data
    
    def generate_roadmap(self, topic, skills=None, experience_level="beginner", career_goal="learn"):
        """Generate a personalized learning roadmap."""
        skills = skills or []
        
        if not self.is_tech_topic(topic):
            return {
                "error": "non_tech_topic",
                "message": f"'{topic}' is not a valid technology career topic. Please enter a tech-related career like 'Web Developer', 'Data Scientist', 'Cloud Engineer', etc."
            }
        
        current_app.logger.info(f"Generating AI roadmap for: {topic}")
        
        prompt = self.build_roadmap_prompt(topic, skills, experience_level, career_goal)
        
        content = self.call_nvidia_api(prompt)
        if not content:
            current_app.logger.warning("API failed, returning None for fallback")
            return None
        
        data = self.parse_json_response(content)
        if not data:
            current_app.logger.warning("JSON parsing failed, returning None for fallback")
            return None
        
        roadmap = self.validate_roadmap(data, topic)
        
        current_app.logger.info(f"Successfully generated roadmap with {len(roadmap['nodes'])} nodes")
        return roadmap


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
        
        current_app.logger.info(f"Generated {len(data['questions'])} questions for {skill}")
        return data


ai_service = AIService()

import re

class SearchService:
    def search_resources(self, skill_name, max_results=6):
        """
        Instant fallback-style search links to bypass DuckDuckGo rate-limiting.
        This takes 0.001s instead of 3 minutes and guarantees no 404s.
        """
        safe_query = re.sub(r'[^a-zA-Z0-9 ]', '', skill_name).strip().replace(' ', '+')
        
        # Determine if it's a frontend topic for MDN, otherwise general docs
        docs_url = f'https://developer.mozilla.org/en-US/search?q={safe_query}' if any(x in skill_name.lower() for x in ['html', 'css', 'js', 'javascript', 'react']) else f'https://www.google.com/search?q={safe_query}+official+documentation'

        return [
            {
                'title': f'{skill_name} Video Tutorial',
                'url': f'https://www.youtube.com/results?search_query={safe_query}+tutorial',
                'snippet': f'Watch top-rated video tutorials on YouTube to learn {skill_name}.',
                'type': 'video'
            },
            {
                'title': f'Official Docs: {skill_name}',
                'url': docs_url,
                'snippet': f'Read the official documentation and guides for {skill_name}.',
                'type': 'docs'
            },
            {
                'title': f'Articles & Guides: {skill_name}',
                'url': f'https://www.google.com/search?q={safe_query}+tutorial+guide',
                'snippet': f'Find the best written tutorials and articles for {skill_name}.',
                'type': 'article'
            }
        ]

    def _fallback_results(self, skill_name):
        safe_query = re.sub(r'[^a-zA-Z0-9 ]', '', skill_name).replace(' ', '+')
        return [
            {
                'title': f'Search Google for {skill_name}',
                'url': f'https://www.google.com/search?q={safe_query}+tutorial',
                'snippet': f'Find tutorials and guides for {skill_name}',
                'type': 'article'
            },
            {
                'title': f'{skill_name} on YouTube',
                'url': f'https://www.youtube.com/results?search_query={safe_query}+tutorial',
                'snippet': f'Video tutorials for {skill_name}',
                'type': 'video'
            }
        ]


search_service = SearchService()

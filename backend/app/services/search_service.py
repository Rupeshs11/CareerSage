import re

class SearchService:
    def search_resources(self, skill_name, max_results=6):
        try:
            from duckduckgo_search import DDGS
            results = []
            queries = [
                f"{skill_name} tutorial",
                f"{skill_name} documentation",
                f"learn {skill_name} youtube"
            ]
            
            with DDGS() as ddgs:
                for query in queries:
                    for r in ddgs.text(query, max_results=2):
                        url = r.get('href', '')
                        title = r.get('title', '')
                        snippet = r.get('body', '')
                        
                        res_type = 'article'
                        if 'youtube.com' in url or 'youtu.be' in url:
                            res_type = 'video'
                        elif 'docs.' in url or 'documentation' in url.lower() or 'developer.' in url:
                            res_type = 'docs'
                        elif 'github.com' in url:
                            res_type = 'docs'
                        
                        if not any(existing['url'] == url for existing in results):
                            results.append({
                                'title': title,
                                'url': url,
                                'snippet': snippet[:150],
                                'type': res_type
                            })
                        
                        if len(results) >= max_results:
                            break
                    if len(results) >= max_results:
                        break

            return results
            
        except ImportError:
            return self._fallback_results(skill_name)
        except Exception as e:
            return self._fallback_results(skill_name)

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

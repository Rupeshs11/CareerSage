"""
Utility Functions
"""


def paginate(query, page=1, per_page=20):
    """Paginate a MongoEngine query"""
    pagination = query.paginate(page=page, per_page=per_page)
    return {
        'items': pagination.items,
        'total': pagination.total,
        'pages': pagination.pages,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    }


def safe_int(value, default=0):
    """Safely convert to int"""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def clean_string(value):
    """Clean and sanitize a string"""
    if not value:
        return ''
    return str(value).strip()

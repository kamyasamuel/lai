tools = [
    {
        "type": "function",
        "function": {
            "name": "search_internet",
            "description": "Search the internet for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query",
                    },
                    "num_results": {
                        "type": "integer",
                        "description": "Number of search results to return",
                        "default": 5
                    }
                },
                "required": ["query"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "retrieve_from_vector_db",
            "description": "Retrieve semantic search results from FAISS vector database",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The query to find similar content for",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of most similar results to return",
                        "default": 3
                    },
                    "namespace": {
                        "type": "string",
                        "description": "Optional namespace to search within the vector database",
                    }
                },
                "required": ["query"],
            },
        }
    },
]
import json
from openai import OpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt
from termcolor import colored  

GPT_MODEL = "gpt-4o"
client = OpenAI()

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

@retry(wait=wait_random_exponential(multiplier=1, max=40), stop=stop_after_attempt(3))
def chat_completion_request(messages, tools=None, tool_choice=None, model=GPT_MODEL):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools, # type: ignore
            tool_choice=tool_choice, # type: ignore
        )
        return response
    except Exception as e:
        print("Unable to generate ChatCompletion response")
        print(f"Exception: {e}")
        return e

def pretty_print_conversation(messages):
    role_to_color = {
        "system": "red",
        "user": "green",
        "assistant": "blue",
        "function": "magenta",
    }
    
    for message in messages:
        if message["role"] == "system":
            print(colored(f"system: {message['content']}\n", role_to_color[message["role"]]))
        elif message["role"] == "user":
            print(colored(f"user: {message['content']}\n", role_to_color[message["role"]]))
        elif message["role"] == "assistant" and message.get("function_call"):
            print(colored(f"assistant: {message['function_call']}\n", role_to_color[message["role"]]))
        elif message["role"] == "assistant" and not message.get("function_call"):
            print(colored(f"assistant: {message['content']}\n", role_to_color[message["role"]]))
        elif message["role"] == "function":
            print(colored(f"function ({message['name']}): {message['content']}\n", role_to_color[message["role"]]))

# Step #1: Prompt with content that may result in function call. In this case the model can identify the information requested by the user is potentially available in the database schema passed to the model in Tools description. 
messages = [{
    "role":"user", 
    "content": "What is the name of the album with the most tracks?"
}]

response = client.chat.completions.create(
    model='gpt-4o', 
    messages=messages,  # type: ignore
    tools= tools,  # type: ignore
    tool_choice="auto"
)

# Append the message to messages list
response_message = response.choices[0].message
messages.append(response_message) # type: ignore

print(response_message.content)  # type: ignore

# Step 2: determine if the response from the model includes a tool call.   
tool_calls = response_message.tool_calls
if tool_calls:
    # If true the model will return the name of the tool / function to call and the argument(s)  
    tool_call_id = tool_calls[0].id
    tool_function_name = tool_calls[0].function.name
    tool_query_string = json.loads(tool_calls[0].function.arguments)['query']

    # Step 3: Call the function and retrieve results. Append the results to the messages list.      
    if tool_function_name == 'search_internet':
        # Implement the search_internet functionality or use a mock result
        results = f"Mock search results for: {tool_query_string}"
        
        messages.append({
            "role":"tool", 
            "tool_call_id":tool_call_id, 
            "name": tool_function_name, 
            "content":results
        })
    elif tool_function_name == 'retrieve_from_vector_db':
        # Implement the retrieve_from_vector_db functionality or use a mock result
        results = f"Mock vector database results for: {tool_query_string}"
        
        messages.append({
            "role":"tool", 
            "tool_call_id":tool_call_id, 
            "name": tool_function_name, 
            "content":results
        })
        
        # Step 4: Invoke the chat completions API with the function response appended to the messages list
        # Note that messages with role 'tool' must be a response to a preceding message with 'tool_calls'
        model_response_with_function_call = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,  # type: ignore
        )  # get a new response from the model where it can see the function response
        print(model_response_with_function_call.choices[0].message.content)
    else: 
        print(f"Error: function {tool_function_name} does not exist")
else: 
    # Model did not identify a function to call, result can be returned to the user 
    print(response_message.content) 
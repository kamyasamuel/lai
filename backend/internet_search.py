import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

def lambda_handler(event, context):
    query = event['query']
    url = f"https://www.googleapis.com/customsearch/v1?key={os.getenv('GOOGLE_API_KEY')}&cx={os.getenv('GOOGLE_CSE_ID')}&q={query}"
    response = requests.get(url)
    data = response.json()
    results = data['items']
    return {
        'statusCode':200,
        'body': results
    }
if __name__ == '__main__':
    event = {'query': 'What is the latest price of crude oil?'}
    response = lambda_handler(event, {})['body']
    for _ in response:    print(_['snippet'], end="\n\n") 
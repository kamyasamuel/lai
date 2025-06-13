import logging
import sys
import json
import argparse
from openai import OpenAI
from groq import Groq
import os
import tornado.ioloop
from  tornado.web import Application, HTTPError, StaticFileHandler # type: ignore
import tornado
import tornado.escape
from dotenv import load_dotenv
from googleapiclient.discovery import build
import tornado
from docx import Document
import PyPDF2
import glob  # Import the glob module
from urllib.parse import urlparse, parse_qs, unquote
import requests
from bs4 import BeautifulSoup
import tornado.websocket
from auth import *
from vector_db import Memory
from pdf2image import convert_from_bytes
import cv2
import pytesseract
import subprocess
import uuid
from mongo_db import libraryDocsCollection
from auth import *
from base_handler import BaseCORSHandler
from mongo_db import userDocumentsCollection, sessionsCollection
import secrets
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
deepseek_client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url="https://api.deepseek.com")
gemmini_client = OpenAI(api_key=os.getenv("GEMINI_API_KEY"), base_url="https://generativelanguage.googleapis.com/v1beta/openai/")

UPLOAD_DIR = './uploads'

# Initialize vector database
memory = Memory(use_gpu=False)
try:
    logging.info("Loading vector database from disk...")
    memory.load_from_disk()
    logging.info("Vector database loaded successfully.")
except FileNotFoundError:
    logging.warning("Vector database not found on disk. It will be empty until data is added.")
except Exception as e:
    logging.error(f"Error loading vector database: {e}")

async def generate_draft(prompt: str) -> str:
    """
    Calls the OpenAI Chat API with a system prompt that tells the model
    to act as a legal assistant, then returns the drafted text.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert legal assistant. "
                "When given a user request, you will draft a clear, "
                "concise legal document or agreement that fulfills the requirements. "
                "Use proper legal structure, headings, and plain English."
                "For mathematical formulas, use KaTeX syntax (e.g., $$...$$ for block and $...$ for inline). "
                "For diagrams and graphs, use Mermaid syntax inside a 'mermaid' code block (e.g., ```mermaid\ngraph TD;\\nA-->B;\\n```)."
                "Avoid ** at all cost"
            )
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    # call the OpenAI chat completion endpoint
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=messages, # type: ignore
        temperature=0.2,      # lower = more precise/legal
        max_tokens=1500       # adjust to taste
    )

    # extract the assistant's reply
    draft_text = response.choices[0].message.content.strip() # type: ignore
    return draft_text

def get_document_text(file_data) -> str:
    """
    Extracts text content from docx or pdf file data.
    Employ OCD processing for pdf files.
    """
    filename = file_data['filename']
    file_body = file_data['body']

    text = ""
    if filename.lower().endswith(".docx"):
        # Create a BytesIO object from the file body
        from io import BytesIO
        byte_stream = BytesIO(file_body)
        document = Document(byte_stream)
        for paragraph in document.paragraphs:
            text += paragraph.text + ' '

    elif filename.lower().endswith(".pdf"):
        # Create a BytesIO object from the file body
        from io import BytesIO
        byte_stream = BytesIO(file_body)
        try:
            # Use PdfReader from PyPDF2
            temporary_text = ""
            reader = PyPDF2.PdfReader(byte_stream)
            for page_num in range(len(reader.pages)):
                temporary_text += reader.pages[page_num].extract_text() + ' '
            
            if any(c.isalpha() or c.isdigit() for c in temporary_text):
                text += temporary_text
            else:
                # If PyPDF2 fails, try converting to images and using OCR
                # Ensure the 'tmp' folder exists in the parent folder of this script
                parent_folder = os.path.dirname(os.path.abspath(__file__))
                store_folder = os.path.join(parent_folder, "tmp")
                os.makedirs(store_folder, exist_ok=True)

                images = convert_from_bytes(file_body)
                for idx, img in enumerate(images):
                    img.save(os.path.join(store_folder, f'page{idx}.jpg'), 'JPEG')
                
                img_list = os.listdir(store_folder)
                img_list.sort()
                for i in range(len(img_list)):
                    img = cv2.imread(f"{store_folder}/{img_list[i]}")
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
                    # Performing OTSU threshold
                    ret, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
                    
                    # Specify structure shape and kernel size. 
                    # Kernel size increases or decreases the area 
                    # of the rectangle to be detected.
                    # A smaller value like (10, 10) will detect 
                    # each word instead of a sentence.
                    rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 18))
                    
                    # Applying dilation on the threshold image
                    dilation = cv2.dilate(thresh1, rect_kernel, iterations = 1)
                    
                    # Finding contours
                    contours, hierarchy = cv2.findContours(dilation, cv2.RETR_EXTERNAL, 
                                                                    cv2.CHAIN_APPROX_NONE)
                    
                    # Creating a copy of image
                    im2 = img.copy()
                    
                    for cnt in contours:
                        x, y, w, h = cv2.boundingRect(cnt)
                        
                        # Drawing a rectangle on copied image
                        rect = cv2.rectangle(im2, (x, y), (x + w, y + h), (0, 255, 0), 2)
                        
                        # Cropping the text block for giving input to OCR
                        cropped = im2[y:y + h, x:x + w]
                        text += pytesseract.image_to_string(cropped)    
                try:    
                    for i in img_list:  subprocess.run(["rm", f"{store_folder}/{i}"])
                except: ...
        except Exception as e:
            print(f"Error reading PDF file {filename}: {e}")
            raise HTTPError(400, f"Could not read PDF file {filename}.")
    else:
        raise HTTPError(400, f"Unsupported file type: {filename}. Only .docx and .pdf are supported.")

    return text

class DraftHandler(BaseCORSHandler):
    async def post(self):
        try:
            data = tornado.escape.json_decode(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            return self.write({"error": "Invalid JSON"})

        prompt = data.get("prompt", "").strip()
        if not prompt:
            self.set_status(400)
            return self.write({"error": 'Missing "prompt" in request body'})

        draft_text = await generate_draft(prompt)

        self.set_header("Content-Type", "application/json")
        self.write({"draft": draft_text})

class AnalysisHandler(BaseCORSHandler):
    async def post(self, *args, **kwargs):
         # Check if the upload directory exists, create if not
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        # Get the files from the request
        files = self.request.files.get("file", [])

        if not files:
            raise HTTPError(400, "No file uploaded")

        for file_info in files:
            # Extract the filename and file body
            filename = file_info['filename']
            file_body = file_info['body']

            # Create a full path for the new file
            file_path = os.path.join(UPLOAD_DIR, filename)

            # Write the file to the specified path for backup purposes
            with open(file_path, 'wb') as f:
                f.write(file_body)

            text = get_document_text(file_info)

            # Generate summary
            # Try OpenAI first, then fallback to other clients if it fails
            analysis = None
            error_messages = []
            system_prompt = """You are an analysis agent. You analyze documents for major key points and take-aways.
                 Format your output as Markdown. Use headings, tables, lists, etc. where possible.
                 For mathematical formulas, use KaTeX syntax (e.g., $$...$$ for block and $...$ for inline).
                 For diagrams and graphs, use Mermaid syntax inside a 'mermaid' code block (e.g., ```mermaid\ngraph TD;\nA-->B;\n```).
            """
            user_prompt = f"Analyse the following document: {text}"

            # Try OpenAI
            try:
                analysis = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.5,
                    top_p=1
                )
            except Exception as e:
                error_messages.append(f"OpenAI failed: {e}")

            # Try Gemini if OpenAI failed
            if analysis is None:
                try:
                    analysis = gemmini_client.chat.completions.create(
                        model="gemini-2.5-flash-preview-05-20",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=0.5,
                        top_p=1
                    )
                except Exception as e:
                    error_messages.append(f"Gemini failed: {e}")

            # Try Groq if Gemini failed
            if analysis is None:
                try:
                    analysis = groq_client.chat.completions.create(
                        model="llama3-70b-8192",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=0.5,
                        top_p=1
                    )
                except Exception as e:
                    error_messages.append(f"Groq failed: {e}")

            # Try DeepSeek if Groq failed
            if analysis is None:
                try:
                    analysis = deepseek_client.chat.completions.create(
                        model="deepseek-chat",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=0.5,
                        top_p=1
                    )
                except Exception as e:
                    error_messages.append(f"DeepSeek failed: {e}")

            if analysis is None:
                raise HTTPError(500, f"All analysis providers failed: {' | '.join(error_messages)}")
        self.write(json.dumps({'summary': analysis.choices[0].message.content, 'filename':filename})) # type: ignore

class ChatWebSocketHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        # allow React dev server or any origin you trust:
        return True

    async def on_message(self, message):
        """
        Expects a JSON payload:
          { "message": "Hello, please draft ..." }
        Streams back JSON messages:
          { "content": "First bit..." }
          { "content": "Next chunk..." }
          { "event": "done" }
        """
        try:
            data = json.loads(message)
            logging.info(f"Received message: {data}")
            prompt = data.get("user_message")
            if not prompt:
                await self.write_message(json.dumps({"error":"Missing prompt"}))
                return

            # Try each client in sequence for redundancy, starting with Gemini
            error_messages = []
            request = None
            
            # System prompt for all clients
            system_prompt = """You are a chat agent for Legal Ai Africa.
                     Format your output into paragraphs.
                     For mathematical formulas, use KaTeX syntax (e.g., $$...$$ for block and $...$ for inline).
                     For diagrams and graphs, use Mermaid syntax inside a 'mermaid' code block 
                     (e.g., ```mermaid\ngraph TD;\nA-->B;\n```).
                    """
            
            # First try Gemini
            try:
                request = gemmini_client.chat.completions.create(
                    model="gemini-2.5-flash-preview-05-20",
                    stream=True,
                    messages=[
                        {"role":"system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ]
                )
            except Exception as e:
                error_messages.append(f"Gemini failed: {e}")
            
            # If Gemini failed, try OpenAI
            if request is None:
                try:
                    request = openai_client.chat.completions.create(
                        model="gpt-4o",
                        stream=True,
                        messages=[
                            {"role":"system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ]
                    )
                except Exception as e:
                    error_messages.append(f"OpenAI failed: {e}")
            
            # If OpenAI failed, try Groq
            if request is None:
                try:
                    request = groq_client.chat.completions.create(
                        model="llama3-70b-8192",
                        stream=True,
                        messages=[
                            {"role":"system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ]
                    )
                except Exception as e:
                    error_messages.append(f"Groq failed: {e}")
            
            # If Groq failed, try DeepSeek
            if request is None:
                try:
                    request = deepseek_client.chat.completions.create(
                        model="deepseek-chat",
                        stream=True,
                        messages=[
                            {"role":"system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ]
                    )
                except Exception as e:
                    error_messages.append(f"DeepSeek failed: {e}")
            
            # If all failed, return an error
            if request is None:
                await self.write_message(json.dumps({
                    "error": f"All providers failed: {' | '.join(error_messages)}"
                }))
                return

            for chunk in request:
                print(chunk)
                message = chunk.choices[0].delta.content
                await self.write_message(json.dumps({ "content": message }))

            # indicate end of stream
            await self.write_message(json.dumps({ "event": "done" }))

        except Exception as e:
            print(e)
            await self.write_message(json.dumps({
                "error": f"Server error: {e}"
            }))
            
class QueryHandler(BaseCORSHandler):
    async def post(self):
        try:
            data = json.loads(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            return self.write({"error": "Invalid JSON"})

        query_type = data.get("type")
        query_text = data.get("query")

        if not query_type or not query_text:
            self.set_status(400)
            return self.write({"error": 'Missing "type" or "query" in request body'})

        response_payload = []
        try:
            if query_type in ["Contract Search", "Laws & Regulations", "Case Law"]:
                search_results = memory.search_memory(query_text, k=5)
                for result in search_results:
                    meta = result.get('metadata', {})
                    response_payload.append({
                        "title": meta.get('doc_name', 'N/A'),
                        "snippet": f"Found in document library with distance: {result.get('distance', 0):.4f}",
                        "link": meta.get('doc_url', '#')
                    })

            else:
                self.set_status(400)
                return self.write({"error": f"Unsupported query type: {query_type}"})

            self.set_header("Content-Type", "application/json")
            self.write({"results": response_payload})
        except Exception as e:
            logging.error(f"An error occurred during query processing: {e}", exc_info=True)
            raise HTTPError(500, "An error occurred during query processing.")
            
class UploadDriveDocumentHandler(BaseCORSHandler):
    async def post(self):
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        files = self.request.files.get("file", [])
        if not files:
            raise HTTPError(400, "No file uploaded")

        file_info = files[0]
        filename = file_info['filename']
        file_body = file_info['body']
        # Generate a unique filename to prevent overwrites and standardize storage
        file_uuid = str(uuid.uuid4())
        file_extension = os.path.splitext(filename)[1]
        stored_filename = f"{file_uuid}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, stored_filename)

        try:
            with open(file_path, 'wb') as f:
                f.write(file_body)
            
            # Save metadata to MongoDB for document listing
            libraryDocsCollection.insert_one({
                "doc_name": filename, # Original filename
                "doc_uuid": file_uuid,
                "doc_url": f"/static/uploads/{stored_filename}" # URL for direct access
            })
            
            self.set_header("Content-Type", "application/json")
            self.write({"message": "File uploaded successfully", "filename": filename, "stored_filename": stored_filename})

        except Exception as e:
            logging.error(f"Error uploading document: {e}", exc_info=True)
            raise HTTPError(500, f"Failed to upload document: {e}")
            
class DocumentComparisonHandler(BaseCORSHandler):
    async def post(self):
        try:
            files = self.request.files
            if 'file1' not in files or 'file2' not in files:
                self.set_status(400)
                return self.write({"error": "Two document files named 'document1' and 'document2' are required."})

            doc1_file_data = files['file1'][0]
            doc2_file_data = files['file2'][0]

            # Extract text content from files
            doc1_content = get_document_text(doc1_file_data)
            doc2_content = get_document_text(doc2_file_data)

            # Use OpenAI API to compare documents
            comparison_response = openai_client.chat.completions.create(
                model="gpt-4o", # Or a suitable model for comparison
                messages=[
                    {"role": "system", "content": "You are an expert document comparison AI. Analyze the two provided documents and highlight key differences and similarities in a clear and concise manner. Format the output as Markdown. For mathematical formulas, use KaTeX syntax (e.g., $$...$$ for block and $...$ for inline). For diagrams and graphs, use Mermaid syntax inside a 'mermaid' code block (e.g., ```mermaid\ngraph TD;\nA-->B;\n```)."},
                    {"role": "user", "content": f"Compare Document 1 and Document 2. Document 1:{doc1_content} Document 2:{doc2_content}"}
                ],
                temperature=0.2,
                max_tokens=2000 # Adjust as needed
            )

            comparison_result = comparison_response.choices[0].message.content
            if comparison_result is not None:
                comparison_result = comparison_result.strip()
            else:
                comparison_result = "No comparison result available."

            self.set_header("Content-Type", "application/json")
            self.write({"comparisonResult": comparison_result})

        except HTTPError as e:
            # Re-raise HTTPError to be handled by Tornado
            raise e
        except Exception as e:
            logging.error(f"Error during document comparison: {e}")
            self.set_status(500)
            self.write({"error": "Failed to compare documents using AI.", "details": str(e)})

class DocumentLibraryHandler(BaseCORSHandler):
    async def get(self):
        try:
            # Get the search term from the query string
            uri = self.request.uri or ""
            parsed_url = urlparse(uri)
            query = parsed_url.query or ""
            query_params = parse_qs(query)
            search_term = query_params.get('search', [''])[0]  # Default to empty string if no search term

            document_list = []
            
            # If search term provided, use vector search for semantic search
            if search_term:
                search_term_lower = search_term.lower()
                # Use FAISS vector database for semantic search
                vector_results = memory.search_memory(search_term_lower, k=5)
                
                # Extract document information from search results
                if vector_results:
                    for result in vector_results:
                        meta = result.get('metadata', {})
                        doc_name = meta.get('doc_name', '')
                        if doc_name:  # Only include results with a valid document name
                            document_list.append({
                                'name': doc_name,
                                'url': meta.get('doc_url', '#'),
                                'relevance': str(result.get('distance', 1.0))
                            })
                            print(document_list)
            else:
                # If no search term, get all documents from MongoDB
                all_docs = list(libraryDocsCollection.find({}, {"_id": 0, "doc_name": 1, "doc_uuid": 1, "doc_url": 1}))
                # Format the document list for the response
                document_list = [{'name': doc['doc_name'], 'url': doc['doc_url']} 
                                for doc in all_docs]
            self.set_header("Content-Type", "application/json")
            self.write(json.dumps(document_list))

        except Exception as e:
            logging.error(f"Error in document library handler: {e}")
            self.set_status(500)
            self.write({"error": "Failed to retrieve document list.", "details": str(e)})

class AgenticSearchWebSocketHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    async def on_message(self, message):
        try:
            data = json.loads(message)
            query = data.get("query")
            if not query:
                await self.write_message(json.dumps({"error": "Missing query"}))
                return

            # 1. Start and notify client
            await self.write_message(json.dumps({"type": "status", "content": "Searching Legal AI Africa's document library..."}))

            # 2. Vector DB Search
            vector_results = memory.search_memory(query, k=3)
            vector_payload = []
            if vector_results:
                for result in vector_results:
                    meta = result.get('metadata', {})
                    vector_payload.append({
                        "title": meta.get('doc_name', 'N/A'),
                        "snippet": f"Found in document library. Distance: {result.get('distance', 0):.4f}",
                        "link": meta.get('doc_url', '#')
                    })
                await self.write_message(json.dumps({"type": "vector_results", "content": vector_payload}))
            else:
                await self.write_message(json.dumps({"type": "status", "content": "No relevant documents found in the library."}))

            # 3. Web Search
            await self.write_message(json.dumps({"type": "status", "content": "Searching the web for supplementary information..."}))
            
            web_search_content = ""
            web_links = []
            google_api_key = os.getenv('GOOGLE_API_KEY')
            google_cse_id = os.getenv('GOOGLE_CSE_ID')
            if google_api_key and google_cse_id:
                search_url = f"https://www.googleapis.com/customsearch/v1?key={google_api_key}&cx={google_cse_id}&q={query}"
                search_response = requests.get(search_url)
                if search_response.ok:
                    search_data = search_response.json()
                    search_items = search_data.get('items', [])
                    
                    for item in search_items[:3]: # top 3
                        link = item.get('link')
                        if link:
                            web_links.append(link)
                            try:
                                page_response = requests.get(link, timeout=5)
                                if page_response.ok:
                                    soup = BeautifulSoup(page_response.text, 'html.parser')
                                    page_text = ' '.join(p.get_text() for p in soup.find_all('p'))
                                    web_search_content += f"Source: {link}\nContent: {page_text[:1000]}\n\n" # Truncate
                            except Exception as e:
                                snippet = item.get('snippet')
                                if snippet:
                                    web_search_content += f"Source: {link}\nContent: {snippet}\n\n"

            if web_search_content:
                 await self.write_message(json.dumps({"type": "status", "content": "Found web results. Synthesizing final answer..."}))
            else:
                 await self.write_message(json.dumps({"type": "status", "content": "No web results found. Synthesizing answer from library results..."}))

            # 4. Synthesize final answer
            links_for_llm = "\n".join([f"- {l}" for l in web_links])
            synthesis_prompt = f"""You are an expert research assistant. Your goal is to provide a comprehensive and well-structured answer to the user's query, synthesizing information from both an internal document library and external web search results.

                User Query: "{query}"

                Here is the information I have gathered:

                ---
                INTERNAL LIBRARY RESULTS:
                {json.dumps(vector_payload, indent=2)}
                ---
                WEB SEARCH RESULTS (content and sources):
                {web_search_content}

                Relevant Web Source Links:
                {links_for_llm}
                ---

                Please provide a synthesized answer that integrates information from these sources. Where possible, cite the web sources using markdown links. Structure your answer clearly using Markdown (headings, lists, etc.).
                For mathematical formulas, use KaTeX syntax (e.g., $$...$$ for block and $...$ for inline).
                For diagrams and graphs, use Mermaid syntax inside a 'mermaid' code block (e.g., ```mermaid\ngraph TD;\nA-->B;\n```).
            """
            
            # Stream the final response
            final_response_stream = openai_client.chat.completions.create(
                model="gpt-4o",
                stream=True,
                messages=[{"role": "user", "content": synthesis_prompt}],
                temperature=0.4
            )

            for chunk in final_response_stream:
                content = chunk.choices[0].delta.content
                if content:
                    await self.write_message(json.dumps({"type": "final_answer", "content": content}))

            await self.write_message(json.dumps({"type": "event", "content": "done"}))

        except Exception as e:
            logging.error(f"Agentic search error: {e}", exc_info=True)
            await self.write_message(json.dumps({"error": f"An error occurred: {e}"}))

class UserDocumentsHandler(BaseCORSHandler):
    def get(self):
        # Get token from Authorization header
        auth_header = self.request.headers.get("Authorization", "")
        print(f"Authorization header: {auth_header}")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Authentication required"})
            return
        
        # Debug: Check all sessions in database
        all_sessions = list(sessionsCollection.find({}, {"token": 1, "user_id": 1, "_id": 0}))
        print(f"Total sessions in DB: {len(all_sessions)}")
        if len(all_sessions) > 0:
            print(f"Sample session: {all_sessions[0]}")
        
        # Find session in MongoDB
        session = sessionsCollection.find_one({"token": token})
        if session is None:
            print(f"No session found with token: {token[:10]}...")
            self.set_status(401)
            self.write({"message": "Invalid token"})
            return
        
        # Get user email from session
        user_email = session.get("user_id")
        print(f"Found session for user: {user_email}")
        
        # Query documents associated with this user
        documents = list(userDocumentsCollection.find({"user_email": user_email}, 
                                                   {"_id": 0, "filename": 1, "upload_date": 1}))
        
        # Return documents array
        self.write(json.dumps(documents))

class UserDocumentUploadHandler(BaseCORSHandler):
    def post(self):
        # Get token from Authorization header
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Authentication required"})
            return
        
        # Find session in MongoDB
        session = sessionsCollection.find_one({"token": token})
        if not session:
            self.set_status(401)
            self.write({"message": "Invalid token"})
            return
            
        # Get user email from session
        user_email = session.get("user_id")
        
        if not self.request.files or "file" not in self.request.files:
            self.set_status(400)
            self.write({"message": "No file provided"})
            return
            
        fileinfo = self.request.files["file"][0]
        original_filename = fileinfo["filename"]
        
        # Generate unique filename to avoid collisions
        extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{user_email.split('@')[0]}_{secrets.token_hex(4)}{extension}"
        
        # Define user uploads directory - create separate directory for user files
        upload_dir = os.path.join(os.path.dirname(__file__), "user_uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Write file to disk
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, "wb") as f:
            f.write(fileinfo["body"])
            
        # Store file metadata in MongoDB
        userDocumentsCollection.insert_one({
            "user_email": user_email,
            "original_filename": original_filename,
            "filename": unique_filename,
            "upload_date": datetime.now().isoformat(),
            "file_size": len(fileinfo["body"])
        })
        
        self.write({
            "message": "File uploaded successfully",
            "filename": unique_filename
        })

class ViewDocumentHandler(BaseCORSHandler):
    def get(self):
        doc_url = self.get_argument('docUrl', '')
        title = self.get_argument('title', '')
        
        if not doc_url:
            self.set_status(400)
            self.write({"error": "Document URL parameter is required"})
            return
            
        try:
            # Decode URL if it's URL-encoded
            doc_url = unquote(doc_url)
            
            # Check if the URL is relative (starts with /)
            if doc_url.startswith('/'):
                # This is a local file, serve it directly from the filesystem
                file_path = os.path.join(os.path.dirname(__file__), doc_url.lstrip('/'))
                
                if not os.path.exists(file_path):
                    self.set_status(404)
                    self.write({"error": f"File not found: {doc_url}"})
                    return
                
                # Determine content type based on file extension
                content_type = "application/octet-stream"  # Default
                if doc_url.endswith('.pdf'):
                    content_type = 'application/pdf'
                elif doc_url.endswith('.docx'):
                    content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                elif doc_url.endswith('.txt'):
                    content_type = 'text/plain'
                
                # Read and serve the file
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.set_header("Content-Type", content_type)
                self.set_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
                self.write(content)
            else:
                # It's an external URL, fetch it
                response = requests.get(doc_url, timeout=10)
                if response.ok:
                    content_type = response.headers.get('Content-Type', 'application/octet-stream')
                    self.set_header("Content-Type", content_type)
                    self.set_header("Content-Disposition", f"attachment; filename={os.path.basename(doc_url) or 'document'}")
                    self.write(response.content)
                else:
                    self.set_status(response.status_code)
                    self.write({"error": f"Failed to fetch document: {response.reason}"})
            
        except Exception as e:
            self.set_status(500)
            self.write({"error": f"Error processing document request: {str(e)}"})

class Application(Application): # type: ignore
    def __init__(self):
        handlers = [
            (r"/api/draft", DraftHandler),
            (r"/api/analyze/(.*)", AnalysisHandler),
            (r"/api/ws/chat", ChatWebSocketHandler),
            (r"/api/ws/agentic-search", AgenticSearchWebSocketHandler),
            (r"/api/query", QueryHandler),
            (r"/api/compare-documents", DocumentComparisonHandler),
            (r"/api/documents", DocumentLibraryHandler),
            (r"/api/uploads/(.*)", StaticFileHandler, {'path': UPLOAD_DIR}),
            (r"/api/upload-drive-document", UploadDriveDocumentHandler),
            (r"/api/static/uploads/(.*)", StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), "static/uploads")}),
            (r"/api/user-uploads/(.*)", StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), "user_uploads")}),
            (r"/api/auth/signin", SignInHandler), # type: ignore
            (r"/api/auth/signup", SignUpHandler), # type: ignore
            (r"/api/auth/google/login", GoogleOAuth2LoginHandler), # type: ignore
            (r"/api/auth/facebook/login", FacebookOAuthHandler), # type: ignore
            (r"/api/auth/check", AuthCheckHandler), # type: ignore
            (r"/api/auth/logout", LogoutHandler), # type: ignore
            (r"/api/auth/profile", UserProfileHandler), # type: ignore
            (r"/api/auth/update-profile", UpdateProfileHandler), # type: ignore
            (r"/api/auth/delete-account", DeleteAccountHandler), # type: ignore
            (r"/api/auth/reset-password", ResetPasswordHandler), # type: ignore
            (r"/api/auth/change-password", ChangePasswordHandler), # type: ignore
            (r"/api/auth/oauth/logout", OAuthLogoutHandler), # type: ignore
            (r"/api/auth/oauth/callback", OAuthCallbackHandler), # type: ignore
            (r"/api/health", HealthCheckHandler), # type: ignore
            (r"/api/user-documents", UserDocumentsHandler),
            (r"/api/upload-user-document", UserDocumentUploadHandler),
            (r"/api/view-document", ViewDocumentHandler),
            (r".*", NotFoundHandler) # type: ignore
        ]
        settings = {
            "debug": True,   # reload on change, more verbose errors
            "autoreload": True,
            "google_redirect_base_uri": 'https://legalaiafrica.com/google_oauth',
            "facebook_redirect_base_uri": 'https://legalaiafrica.com/facebook_oauth',
            "google_oauth": {"key": os.getenv("GOOGLE_OAUTH_KEY"), "secret": os.getenv("GOOGLE_OAUTH_SECRET")},
            "facebook_secret": os.getenv("FACEBOOK_SECRET"),
            "facebook_api_key": os.getenv("FACEBOOK_API_KEY"),
            "cookie_secret": os.getenv("COOKIE_SECRET", "default_secret_key"),
        }
        super().__init__(handlers, **settings)  # type: ignore

def run_server(port: int = 4040):
    app = Application()
    app.listen(port)
    print(f"[server] Listening on http://localhost:{port}")
    tornado.ioloop.IOLoop.current().start()

def run_exec_mode(prompt: str):
    result = {"draft": generate_draft(prompt)}
    sys.stdout.write(json.dumps(result, indent=2))

def main():
    parser = argparse.ArgumentParser(description="Legal-AI Tornado Server")
    parser.add_argument(
        "--mode", choices=["server", "exec"], default="server",
        help="server = start HTTP server; exec = generate a draft and exit"
    )
    parser.add_argument(
        "--prompt", type=str,
        help="Prompt text (only used in --mode=exec)"
    )
    parser.add_argument(
        "--port", "-p", type=int, default=4040,
        help="Port to listen on (server mode)"
    )
    args = parser.parse_args()

    if args.mode == "exec":
        if not args.prompt:
            print("Error: --prompt is required in exec mode", file=sys.stderr)
            sys.exit(1)
        run_exec_mode(args.prompt)
    else:
        run_server(port=args.port)

if __name__ == "__main__":
    from mongo_db import libraryDocsCollection
    import uuid
    main()
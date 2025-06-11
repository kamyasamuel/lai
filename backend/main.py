from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from docx import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global state for contract analysis
contract_context = ""
conversation_chain = None

def get_text_from_file(file_path):
    text = ""
    if file_path.endswith(".pdf"):
        pdf_reader = PdfReader(file_path)
        for page in pdf_reader.pages:
            text += page.extract_text()
    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "
"
    elif file_path.endswith(".txt"):
        with open(file_path, 'r') as f:
            text = f.read()
    return text

@app.route('/summarize', methods=['POST'])
def summarize_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    text = get_text_from_file(file_path)
    
    # Simple summarization using OpenAI
    llm = OpenAI()
    prompt = f"Please provide a concise summary of the following document:

{text}"
    summary = llm(prompt)
    
    return jsonify({"summary": summary})

@app.route('/analyse_contract', methods=['POST'])
def analyse_contract():
    global contract_context, conversation_chain
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    contract_context = get_text_from_file(file_path)
    
    # Perform initial analysis
    llm = OpenAI()
    prompt = f"Analyze the following contract and identify key clauses, potential risks, and obligations:

{contract_context}"
    analysis = llm(prompt)
    
    # Initialize conversation chain
    memory = ConversationBufferMemory()
    memory.chat_memory.add_user_message(f"Here is the contract for analysis: {contract_context}")
    memory.chat_memory.add_ai_message(analysis)
    conversation_chain = ConversationChain(llm=llm, memory=memory)
    
    return jsonify({"analysis": analysis})

@app.route('/chat_with_contract', methods=['POST'])
def chat_with_contract():
    global conversation_chain
    if not conversation_chain:
        return jsonify({"error": "Contract not analyzed yet"}), 400
        
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    response = conversation_chain.predict(input=prompt)
    
    return jsonify({"response": response})

@app.route('/documents', methods=['GET'])
def list_documents():
    # This should ideally be more robust, perhaps listing from a database
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return jsonify(files)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)

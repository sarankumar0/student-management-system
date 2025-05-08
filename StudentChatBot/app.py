import pandas as pd
from sentence_transformers import SentenceTransformer, util
from flask import Flask, request, jsonify
from flask_cors import CORS
import os # To construct file path safely

# --- Flask App Initialization ---
app = Flask(__name__)
# Enable CORS for all origins. This is fine for development,
# but you might restrict it in production.
CORS(app, supports_credentials=True)
print("Loading dataset...")
try:
    # Construct the full path to the CSV file relative to the script's location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "Student Chatbot Dataset.csv")

    if not os.path.exists(csv_path):
         raise FileNotFoundError(f"Error: Dataset file not found at {csv_path}")

    df = pd.read_csv(csv_path)
    print("Dataset loaded successfully.")
except FileNotFoundError as e:
    print(e)
    # Exit or handle gracefully if dataset is essential
    exit() # Exit if dataset cannot be loaded
except Exception as e:
    print(f"An error occurred loading the CSV: {e}")
    exit()


print("Loading sentence transformer model...")
try:
    # Using a specific cache folder can sometimes help manage downloads
    # cache_dir = os.path.join(script_dir, '.cache', 'sentence_transformers')
    # model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=cache_dir)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading Sentence Transformer model: {e}")
    exit() # Exit if model cannot be loaded


print("Extracting questions and answers...")
# Ensure columns exist - handle potential errors
if 'Question' not in df.columns or 'Answer' not in df.columns:
    print("Error: CSV must contain 'Question' and 'Answer' columns.")
    exit()

questions = df['Question'].fillna('').astype(str).tolist() # Handle potential NaN/non-string data
answers = df['Answer'].fillna('Sorry, I don\'t have an answer for that.').astype(str).tolist()
print(f"Extracted {len(questions)} Q&A pairs.")


print("Creating question embeddings (this may take a moment)...")
try:
    question_embeddings = model.encode(questions, convert_to_tensor=True, show_progress_bar=True)
    print("Embeddings created successfully.")
except Exception as e:
    print(f"Error creating embeddings: {e}")
    exit()


# --- Chatbot Function (from your original script) ---
def get_answer(query, top_k=1):
    """
    Finds the most similar question in the dataset and returns its answer.
    """
    try:
        query_embedding = model.encode(query, convert_to_tensor=True)
        # Find the closest `top_k` questions
        hits = util.semantic_search(query_embedding, question_embeddings, top_k=top_k)
        # Get the top hit (most similar)
        top_hit = hits[0][0]
        corpus_id = top_hit['corpus_id']
        score = float(top_hit['score'])

        # Basic threshold - adjust as needed
        similarity_threshold = 0.5 # Example threshold
        if score < similarity_threshold:
             return {
                 "answer": "Could you please raise a query relevant to our acadmey?",
                 "matchedQuestion": None,
                 "score": score 
             }

        return {
            "answer": answers[corpus_id],
            "matchedQuestion": questions[corpus_id],
            "score": score
        }
    except Exception as e:
        print(f"Error during semantic search: {e}")
        return {
            "answer": "Sorry, an error occurred while processing your request.",
            "matchedQuestion": None,
            "score": 0.0
        }

# --- API Endpoint ---
@app.route('/api/chatbot/query', methods=['POST'])
def handle_query():
    """
    API endpoint to receive a query and return the chatbot's answer.
    """
    print(f"Received request: {request.method} {request.url}")
    if not request.is_json:
        print("Error: Request must be JSON")
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    print(f"Request JSON data: {data}")

    query = data.get('query') # Use .get() for safer access
    if not query:
        print("Error: 'query' key missing in JSON payload")
        return jsonify({"error": "'query' key missing in JSON payload"}), 400

    if not isinstance(query, str) or len(query.strip()) == 0:
         print("Error: 'query' must be a non-empty string")
         return jsonify({"error": "'query' must be a non-empty string"}), 400

    print(f"Processing query: {query}")
    # Call the chatbot function
    response_data = get_answer(query)
    print(f"Sending response: {response_data}")

    # Return the result as JSON
    return jsonify(response_data)

# --- Run the App ---
if __name__ == '__main__':
    # Use port 5001 to avoid potential conflicts with Node.js server (often on 5000)
    # Use host='0.0.0.0' to make it accessible on your network (optional)
    app.run(debug=True, port=5001)
    # Use debug=False in production
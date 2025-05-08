import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Load CSV
df = pd.read_csv("Student Chatbot Dataset.csv")

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Extract Q&A
questions = df['Question'].tolist()
answers = df['Answer'].tolist()

# Create embeddings
question_embeddings = model.encode(questions, convert_to_tensor=True)

# Function to get response
def get_answer(query, top_k=1):
    query_embedding = model.encode(query, convert_to_tensor=True)
    hits = util.semantic_search(query_embedding, question_embeddings, top_k=top_k)
    top_hit = hits[0][0]
    return {
        "Your Query": query,
        "Matched Question": questions[top_hit['corpus_id']],
        "Answer": answers[top_hit['corpus_id']],
        "Similarity Score": float(top_hit['score'])
    }

# Sample usage
while True:
    q = input("Ask the bot: ")
    if q.lower() in ["exit", "quit"]:
        break
    print(get_answer(q))

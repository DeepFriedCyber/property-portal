from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")  # or other local model
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
class TextsInput(BaseModel):
    texts: List[str]
@app.post("/embed")
async def embed(input: TextsInput):
    vectors = model.encode(input.texts, normalize_embeddings=True).tolist()
    return {"embeddings": vectors}
import requests
import json

def test_embedding_service():
    url = "http://localhost:5000/embed"
    
    # Test data
    payload = {
        "texts": [
            "Beautiful 3-bedroom house in London with garden",
            "Modern apartment in Manchester city center"
        ]
    }
    
    # Make the request
    response = requests.post(url, json=payload)
    
    # Check if request was successful
    if response.status_code == 200:
        data = response.json()
        
        # Print the first few dimensions of each embedding
        for i, embedding in enumerate(data["embeddings"]):
            print(f"Text {i+1} embedding (first 5 dimensions): {embedding[:5]}")
            print(f"Embedding length: {len(embedding)}")
        
        return True
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    print("Testing embedding service...")
    success = test_embedding_service()
    if success:
        print("Test completed successfully!")
    else:
        print("Test failed!")
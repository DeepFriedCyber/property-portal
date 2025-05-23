# Embedding Microservice

This is a simple microservice that provides text embedding functionality using the `sentence-transformers` library.

## Features

- Converts text into vector embeddings using the `all-MiniLM-L6-v2` model
- Exposes a simple REST API endpoint for embedding generation
- Supports batch processing of multiple texts

## Setup

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Run the service:
   ```
   docker-compose up -d
   ```
3. The service will be available at http://localhost:5000

### Manual Setup

1. Create a Python virtual environment:
   ```
   python -m venv venv
   ```
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the service:
   ```
   uvicorn embedding_server:app --reload
   ```

## API Usage

### Endpoint: `/embed`

**Method:** POST

**Request Body:**

```json
{
  "texts": ["This is a sample text", "Another example text"]
}
```

**Response:**

```json
{
  "embeddings": [
    [0.1, 0.2, 0.3, ...],  // Vector for "This is a sample text"
    [0.4, 0.5, 0.6, ...]   // Vector for "Another example text"
  ]
}
```

## Example Usage with JavaScript/TypeScript

```typescript
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch('http://localhost:5000/embed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texts }),
  })

  const data = await response.json()
  return data.embeddings
}
```

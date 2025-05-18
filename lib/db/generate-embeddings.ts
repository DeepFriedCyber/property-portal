import dotenv from 'dotenv'

import { processAllMissingEmbeddings } from './property-processor'

// Load environment variables
dotenv.config()

async function main() {
  try {
    console.log('Starting to generate embeddings for all properties...')
    await processAllMissingEmbeddings()
    console.log('Embedding generation completed successfully')
  } catch (error) {
    console.error('Error generating embeddings:', error)
    process.exit(1)
  }
}

// Run the script
main()

// scripts/generate-property-embeddings.ts
import dotenv from 'dotenv'
import { Pool } from 'pg'
import pgvector from 'pgvector'

import { generateEmbeddings } from '../services/vectorSearch'

// Load environment variables
dotenv.config()

// Initialize pgvector
pgvector.init()

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

/**
 * Generate embeddings for all properties that don't have them
 */
async function generatePropertyEmbeddings() {
  const client = await pool.connect()

  try {
    console.log('Starting embedding generation for properties...')

    // Start a transaction
    await client.query('BEGIN')

    // Get properties without embeddings
    const { rows: properties } = await client.query(`
      SELECT id, title, description, location, property_type
      FROM properties
      WHERE embedding IS NULL
      LIMIT 100
    `)

    console.log(`Found ${properties.length} properties without embeddings`)

    // Process each property
    for (const [index, property] of properties.entries()) {
      try {
        // Create a text representation of the property for embedding
        const textToEmbed = `
          Property: ${property.title}
          Description: ${property.description || ''}
          Location: ${property.location || ''}
          Type: ${property.property_type || ''}
        `.trim()

        // Generate embeddings
        const embedding = await generateEmbeddings(textToEmbed)

        // Update the property with the embedding
        await client.query(`UPDATE properties SET embedding = $1 WHERE id = $2`, [
          pgvector.toSql(embedding),
          property.id,
        ])

        console.log(
          `[${index + 1}/${properties.length}] Generated embedding for property ${property.id}`
        )
      } catch (error) {
        console.error(`Failed to generate embedding for property ${property.id}:`, error)
      }
    }

    // Commit the transaction
    await client.query('COMMIT')

    console.log('Embedding generation completed')

    // If there are more properties to process, suggest running the script again
    if (properties.length === 100) {
      console.log(
        'There may be more properties without embeddings. Run the script again to process them.'
      )
    }
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK')
    console.error('Embedding generation failed:', error)
  } finally {
    // Release the client back to the pool
    client.release()

    // Close the pool
    await pool.end()
  }
}

// Run the script
generatePropertyEmbeddings().catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
})

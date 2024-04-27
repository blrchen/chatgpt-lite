import { MongoClient, ServerApiVersion } from 'mongodb'
const uri =
  'mongodb+srv://stevensonl7400:ehDBJOqy37mZjSih@odalysgpt.7dj97wg.mongodb.net/?retryWrites=true&w=majority&appName=OdalysGPT'
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function createDatabases() {
  try {
    await client.connect()
    console.log('Connecté à MongoDB!')

    // Création de la base de données pour les utilisateurs
    const usersDb = client.db('usersDatabase')
    const usersCollection = usersDb.collection('users')
    await usersCollection.insertOne({ name: 'John Doe', email: 'john@example.com' })
    console.log('Document inséré dans la collection des utilisateurs.')

    // Création de la base de données pour les prompts
    const promptsDb = client.db('promptsDatabase')
    const promptsCollection = promptsDb.collection('prompts')
    await promptsCollection.insertOne({
      prompt: "Bonjour, comment puis-je vous aider aujourd'hui ?",
      response: 'Je suis là pour aider!'
    })
    console.log('Document inséré dans la collection des prompts.')
  } catch (err) {
    console.error('Une erreur est survenue lors de la création des bases de données:', err)
  } finally {
    await client.close()
    console.log('Connexion à MongoDB fermée.')
  }
}

createDatabases().catch(console.dir)

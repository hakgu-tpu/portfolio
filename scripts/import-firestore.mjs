import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const isApply = process.argv.includes('--apply')
const isHelp = process.argv.includes('--help') || process.argv.includes('-h')
const dataPath = fileURLToPath(new URL('../firebase/firestore-data.json', import.meta.url))

if (isHelp) {
  console.log(`Usage:
  GOOGLE_APPLICATION_CREDENTIALS=~/Desktop/portfolio-2363e-firebase-adminsdk-fbsvc-70f6395a45.json npm run firebase:import:dry-run
  GOOGLE_APPLICATION_CREDENTIALS=~/Desktop/portfolio-2363e-firebase-adminsdk-fbsvc-70f6395a45.json npm run firebase:import

The script uses each object's id as its Firestore document ID. Existing documents with
the same ID are replaced. It does not delete documents absent from firestore-data.json.`)
  process.exit(0)
}

const source = JSON.parse(await readFile(dataPath, 'utf8'))
const entries = Object.entries(source).flatMap(([collectionName, documents]) => {
  if (!Array.isArray(documents)) {
    throw new Error(`Expected "${collectionName}" to be an array.`)
  }

  return documents.map((document) => {
    if (!document || typeof document !== 'object' || typeof document.id !== 'string' || !document.id) {
      throw new Error(`Every document in "${collectionName}" needs a non-empty string id.`)
    }

    const { id, ...data } = document
    return { collectionName, id, data }
  })
})

const byCollection = entries.reduce((result, entry) => {
  result.set(entry.collectionName, (result.get(entry.collectionName) ?? 0) + 1)
  return result
}, new Map())

console.log(
  `Prepared ${entries.length} documents: ${[...byCollection.entries()]
    .map(([collectionName, count]) => `${collectionName} (${count})`)
    .join(', ')}.`,
)

if (!isApply) {
  console.log('Dry run only. Re-run with --apply (or npm run firebase:import) to write data.')
  process.exit(0)
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to an absolute service-account JSON file path.')
}

initializeApp({ credential: applicationDefault() })
const db = getFirestore()

for (let start = 0; start < entries.length; start += 500) {
  const batch = db.batch()
  const chunk = entries.slice(start, start + 500)

  for (const { collectionName, id, data } of chunk) {
    batch.set(db.collection(collectionName).doc(id), data)
  }

  await batch.commit()
}

console.log(`Imported ${entries.length} documents into Firestore.`)

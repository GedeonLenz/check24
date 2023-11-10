import db from '$db/mongo'
export const collection_messages = db.collection('messages')
export const collection_conversations = db.collection('conversations')
export const collection_auth = db.collection('users')


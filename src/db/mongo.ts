import { MongoClient } from "mongodb"
import { SECRET_DB_URI } from '$env/static/private';

const client = new MongoClient(SECRET_DB_URI)

export function connectMongoDB() {
    return client.connect()
}
export default client.db('check24')
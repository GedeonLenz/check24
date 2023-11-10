import {collection_messages} from "$db/collections";
import type {PageServerLoad} from "./$types";
import {checkAuthentication} from "../api/auth/auth";
import type {User} from "../api/types";

export const load:PageServerLoad = async function ({cookies}) {
    const user:User = await checkAuthentication(cookies);

    const data = await collection_messages.find({},{limit:50, projection: {}}).toArray()
    const serializedData = data.map(item => ({ ...item, _id: item._id.toString() }));
    return {
        data: serializedData
    }
}
import {collection_messages} from "$db/collections";
import type {PageServerLoad} from "./$types";
import {checkAuthentication} from "../api/auth/auth";
import type {User} from "../api/types";

export const load:PageServerLoad = async function ({cookies}) {
    const user:User = await checkAuthentication(cookies);
    return {
        currentUser: user
    }
}
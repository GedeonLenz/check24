import type {PageServerLoad} from "./$types";
import {checkAuthentication} from "$lib/auth";
import type {User} from "$lib/types";

export const load:PageServerLoad = async function ({cookies}) {
    const user:User = await checkAuthentication(cookies);
    return {
        currentUser: user
    }
}
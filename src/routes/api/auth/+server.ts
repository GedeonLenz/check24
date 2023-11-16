import bcrypt from "bcrypt";
import {collection_auth} from "$db/collections";
import {extractFindData, getResponse_Success, getResponse_Unauthorized} from "$lib/tools/serverTools";
import type {UserObj} from "$lib/types";
import {generateJWT} from "$lib/auth";
export async function POST(event:any) {
    const cookies = event.cookies;

    const body = await event.request.json();
    const username = body.username;
    const password = body.password;

    const data = await collection_auth.find({username:username},{limit:1, projection: {}}).toArray()
    let userObjs = extractFindData<UserObj>(data);

    if (userObjs.length >= 1) {
        let storedUserPasswordHash:string = userObjs[0].passwordhash;
        let authenticated: boolean = await bcrypt.compare(password, storedUserPasswordHash);

        if (authenticated) {
            let JWT_TOKEN = await generateJWT(userObjs[0].username, userObjs[0].type, userObjs[0].pictureURL)
            cookies.set("sessionToken", JWT_TOKEN, {path: "/"});
            return getResponse_Success();
        }
    }
    return getResponse_Unauthorized();
}
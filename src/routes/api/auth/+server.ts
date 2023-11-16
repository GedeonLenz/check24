import bcrypt from "bcrypt";
import {collection_auth, collection_messages} from "$db/collections";
import {extractFindData, getResponse_Success, getResponse_Unauthorized} from "$lib/serverTools";
import type {UserObj, UserRole} from "../types";
import {generateJWT} from "./auth";
export async function POST(event:any) {
    //Get cookies
    const cookies = event.cookies;

    //Extract username / password
    const body = await event.request.json();
    const username = body.username;
    const password = body.password;

    //Get hashed stored user password for username
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
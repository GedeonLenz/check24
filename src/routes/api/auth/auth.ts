import {redirect, type Cookies} from '@sveltejs/kit';
import jwt from "jsonwebtoken";
import {SECRET_JWT_KEY} from "$env/static/private";
import type {User} from "../types";
import type {UserRole} from "../types";

export async function generateJWT(username:string,type:UserRole) {
    const payload = {
        username: username,
        type: type
    };
    return jwt.sign(payload, SECRET_JWT_KEY, {});
}
export async function verifyJWT(token: string) {
    const isValid = await jwt.verify(token, SECRET_JWT_KEY)
    if (isValid) {
        let jwtdecode:{username:string,type:UserRole,iat:number} = jwt.decode(token) as {username:string,type:UserRole,iat:number};
        let user:User = {username:jwtdecode.username,type:jwtdecode.type}
        return user;
    } else {
        return false;
    }
}

export async function checkAuthentication(cookies: Cookies) {
    let user:User | null = await getUser(cookies);
    if(user != null) {
        return user
    }
    else{
        throw redirect(307, '/login');
    }
}

export async function getUser(cookies: Cookies) {
    let session = cookies.get('sessionToken');
    if(session) {
        let payload = await verifyJWT(session)
        if(payload != false && payload != null) {
            let userObj:User = {username: payload.username, type:payload.type};
            return userObj
        }
    }
    return null
}

export function checkUserRole(user:User, role:UserRole) {
    return user.type == role;
}
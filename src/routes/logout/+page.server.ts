import {type Cookies, redirect} from '@sveltejs/kit';
import {currentUser} from "$lib/chat/user";
export async function load({ cookies }:{cookies:Cookies}) {
    cookies.delete('sessionToken');
    throw redirect(307, '/login');
}
import {type Cookies, redirect} from "@sveltejs/kit";

export async function load({ cookies }:{cookies:Cookies}) {
    throw redirect(307, '/chat');
}
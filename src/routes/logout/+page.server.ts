import {type Cookies, redirect} from '@sveltejs/kit';
export async function load({ cookies }:{cookies:Cookies}) {
    cookies.delete('sessionToken');
    throw redirect(307, '/login');
}
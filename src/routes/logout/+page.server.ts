import {type Cookies, redirect} from '@sveltejs/kit';
export async function load({ cookies }:{cookies:Cookies}) {
    let session = cookies.delete('sessionToken');
    throw redirect(307, '/login');
}
import {type Cookies, redirect} from '@sveltejs/kit';
export async function load({ cookies }:{cookies:Cookies}) {
    //Redirect if logged in
    let session = cookies.get('sessionToken');
    if(session) {
        throw redirect(307, '/chat');
    }
}
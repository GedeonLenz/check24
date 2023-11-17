import {type Writable, writable} from 'svelte/store';
export const error:Writable<boolean | string> = writable(false);
export const success:Writable<boolean | string>  = writable(false);

const duration:number = 5*1000;

export async function resetError(errorVal:string | boolean) {
    if(errorVal === false) return;
    setTimeout(() => {
        error.set(false);
    }, duration);
}

export async function resetSuccess(successVal:string | boolean) {
    if(successVal === false) return;
    setTimeout(() => {
        success.set(false);
    }, duration);
}
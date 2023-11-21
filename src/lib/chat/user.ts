import {writable, type Writable} from "svelte/store";
import type {User} from "$lib/types";

export const currentUser:Writable<User | undefined>  = writable(undefined);
import {writable, type Writable} from "svelte/store";
import type {Message} from "$lib/types";

export const messages:Writable<Message[]>  = writable([]);
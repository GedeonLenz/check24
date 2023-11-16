import {writable, type Writable} from "svelte/store";

export const loadingChatList:Writable<boolean>  = writable(true);
export const loadingChatPanel:Writable<boolean>  = writable(true);
export const newChatVisible:Writable<boolean>  = writable(false);
export const chatOpen:Writable<boolean>  = writable(false);
export const noChat:Writable<boolean>  = writable(false);
export const archiveMode:Writable<boolean>  = writable(false);
export const searchQuery:Writable<string>  = writable("");

export const sendProgress:Writable<number>  = writable(0);
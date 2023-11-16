import {writable, type Writable} from "svelte/store";

export const JOB_updateConversationList:Writable<NodeJS.Timeout>  = writable();
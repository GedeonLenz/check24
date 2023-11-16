import {writable, type Writable} from "svelte/store";
import type {ConversationEntry} from "$lib/types";

export const selectedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);
export const lastOpenedConversation:Writable<ConversationEntry | undefined>  = writable(undefined);

export const conversations:Writable<ConversationEntry[]>  = writable([]);
export const viewConversations:Writable<ConversationEntry[]>  = writable([]);
export const visibleConversations:Writable<ConversationEntry[]>  = writable([]);
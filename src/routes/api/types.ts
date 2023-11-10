/***************************/
//---------Users------------
/***************************/
//Enums
import type {ObjectId} from "mongodb";

export enum UserRole {
    Customer="customer",
    ServiceProvider="serviceprovider"
}

//----------Data----------//
export interface UserObj {
    _id: string;
    username: string;
    passwordhash: string;
    type: UserRole;
}

export interface User extends Omit<Omit<UserObj, '_id'>, 'passwordhash'> {}

function isUser(obj: any): obj is User {
    return (
        typeof obj === "object" &&
        typeof obj.username === "string" &&
        typeof obj.type === "string"
    );
}

/***************************/
//-------Conversations-------
/***************************/

//--------Requests--------//
//Insert
export interface ConversationInsertRequest {
    usernames: {
        customer: string;
        serviceprovider: string;
    };
    initMessage: Message_Offer
}
export function isConversationRequest(obj: any): obj is ConversationInsertRequest {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.usernames === "object" &&
        typeof obj.usernames.customer === "string" &&
        typeof obj.usernames.serviceprovider === "string"
    );
}
//List
export interface ConversationListRequest {
    query: object,
    offset: number,
    amount: number
}
export interface ConversationUpdateRequest {
    conversationID: string;
}

//--------Responses--------//
//Insert
export interface ConversationInsertResponse {
    conversation: Conversation,
    message:Message_Offer
}
//List
export interface ConversationListResponse {
    conversations: {
        conversationObj: Conversation,
        lastMessage: Message,
        unreadCount: number
    }[]
}

//----------Data----------//
//Enums
export enum ConversationState {
    Initalizing = "quoted",
    Quoted = "quoted",
    Chatting = "chatting",
    Accepted = "accepted",
    Rejected = "Rejected",
    Archived = "archived"
}
//Database
export interface Conversation {
    _id: string;
    usernames: {
        customer: string;
        serviceprovider: string;
    };
    state: ConversationState;
    dates: {
        created: string;
        updated: string;
        opened: string;
        deleted: string;
    };
};
//Insertions
export interface ConversationInsert extends Omit<Conversation, '_id'> {}


/***************************/
//---------Messages--------
/***************************/

//--------Requests--------//
//Insert
export interface Message_StandardRequest {
    _id: string;
    sender: User,
    messageType: MessageType.Standard,
    text:string;
}
export interface Message_OfferRequest extends Omit<Message_StandardRequest, 'messageType'>{
    messageType: MessageType.Offer;
    details: {
        price: number;
    };
}
export interface Message_AcceptRequest extends Omit<Message_StandardRequest, 'messageType'>{
    messageType: MessageType.Accept;
}
export interface Message_RejectRequest extends Omit<Message_StandardRequest, 'messageType'>{
    messageType: MessageType.Reject;
}
export interface Message_FileRequest extends Omit<Message_StandardRequest, 'messageType'>{
    messageType: MessageType.File;
}
export type MessageRequest = Message_StandardRequest | Message_OfferRequest | Message_AcceptRequest | Message_RejectRequest | Message_FileRequest;
//List
export interface ChatMessagesRequest {
    conversationID:string,
    offset: number,
    amount: number
}

//--------Responses--------//
//Insert
export interface NewMessageResponse {
    message: Message
}
export interface NewMessage_FileResponse extends NewMessageResponse {
    fileURL: string;
}
//List
export interface ChatMessagesResponse {
    messages: Message[]
}


//----------Data----------//
//Enums
export enum MessageType {
    Standard="standard",
    Offer="offer",
    Accept="accept",
    Reject="reject",
    File="file"
}
//Database
export interface Message_Standard {
    _id: string;
    conversationID: string;
    sender: User,
    messageType: MessageType.Standard,
    read:boolean;
    text:string;
    dates: {
        created: string;
        updated: string;
        read: string;
    },
}
export interface Message_Offer extends Omit<Message_Standard, 'messageType'> {
    messageType: MessageType.Offer;
    details: {
        price: number;
    };
}
export interface Message_Accept extends Omit<Message_Standard, 'messageType'> {
    messageType: MessageType.Accept;
}
export interface Message_Reject extends Omit<Message_Standard, 'messageType'> {
    messageType: MessageType.Reject;
}
export interface Message_File extends Omit<Message_Standard, 'messageType'> {
    messageType: MessageType.File;
}
export type Message = Message_Standard | Message_Offer | Message_Accept | Message_Reject | Message_File;

//Insertions
export interface Message_StandardInsert extends Omit<Message_Standard, '_id'> {}
export interface Message_OfferInsert extends Omit<Message_Offer, '_id'> {}
export interface Message_AcceptInsert extends Omit<Message_Accept, '_id'> {}
export interface Message_RejectInsert extends Omit<Message_Reject, '_id'> {}
export interface Message_FileInsert extends Omit<Message_File, '_id'> {}
export type MessageInsert = Message_StandardInsert | Message_OfferInsert | Message_AcceptInsert | Message_RejectInsert | Message_FileInsert;
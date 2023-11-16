/***************************/
//---------Users------------
/***************************/
//Enums

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
    pictureURL:string;
}

export interface User extends Omit<Omit<UserObj, '_id'>, 'passwordhash'> {}

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
    initMessage: Message_OfferRequest
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

export interface ConversationReviewRatingRequest {
    conversationID: string;
    review: {
        rating: number;
    }
}

//--------Responses--------//
//Insert
export interface ConversationInsertResponse {
    conversation: ConversationEntry,
    message:Message_Offer
}
//List
export interface ConversationListResponse {
    conversations: ConversationEntry[],
    lastOpened:ConversationEntry | undefined
}

export interface ConversationEntry {
    conversationObj: Conversation,
    lastMessage: Message,
    unreadCount: number,
    pictureURL:string
}

//----------Data----------//
//Enums
export enum ConversationState {
    Initalizing = "initializing",
    Quoted = "quoted",
    Chatting = "chatting",
    Accepted = "accepted",
    Rejected = "Rejected"
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
        accepted?: string;
        archived?: {
            customer: string,
            serviceprovider:string;
        }
    };
    review?: {
        requested: boolean;
        reviewed: boolean;
        rating: number;
    }
    archived?: {
        customer:boolean;
        serviceprovider:boolean;
    }
}
//Insertions
export interface ConversationInsert extends Omit<Conversation, '_id'> {}


/***************************/
//---------Messages--------
/***************************/

//--------Requests--------//
//Insert
export interface Message_StandardRequest {
    conversationID: string,
    sender: User,
    messageType: MessageType.Standard,
    text:string;
}
export interface Message_OfferRequest extends Omit<Omit<Message_StandardRequest, 'conversationID'>, 'messageType'>{
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
export interface Message_FileRequest extends Omit<Omit<Message_StandardRequest, 'text'>, 'messageType'>{
    messageType: MessageType.File;
}
export type MessageAndOfferRequest = Message_StandardRequest | Message_OfferRequest | Message_AcceptRequest | Message_RejectRequest | Message_FileRequest;
export type MessageRequest = Message_StandardRequest | Message_AcceptRequest | Message_RejectRequest | Message_FileRequest;

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
export interface Message_File extends Omit<Omit<Message_Standard, 'text'>, 'messageType'> {
    messageType: MessageType.File;
    filePath: string;
}
export type Message = Message_Standard | Message_Offer | Message_Accept | Message_Reject | Message_File;
export type TextMessage = Message_Standard | Message_Offer | Message_Accept | Message_Reject;
//Insertions
export interface Message_StandardInsert extends Omit<Message_Standard, '_id'> {}
export interface Message_OfferInsert extends Omit<Message_Offer, '_id'> {}
export interface Message_AcceptInsert extends Omit<Message_Accept, '_id'> {}
export interface Message_RejectInsert extends Omit<Message_Reject, '_id'> {}
export interface Message_FileInsert extends Omit<Message_File, '_id'> {}
export type MessageInsert = Message_StandardInsert | Message_OfferInsert | Message_AcceptInsert | Message_RejectInsert | Message_FileInsert;
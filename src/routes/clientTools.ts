import type {
    ConversationInsertRequest,
    ConversationListResponse,
    ConversationUpdateRequest, Message,
    Message_AcceptRequest,
    Message_FileRequest,
    Message_OfferRequest,
    Message_RejectRequest,
    Message_StandardRequest,
    MessageRequest,
    User
} from "./api/types";
import {MessageType, UserRole} from "./api/types";

/*GET and POST*/

export async function sendPOST(url:string,data:object) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data:data})
        });
        return response;
    } catch (error) {
        return false;
    }
}

export type StringParams = {
    [key: string]: string;
};
export async function sendGET(url:string,params:StringParams) {
    try {
        const fetchURL = url +'?' + new URLSearchParams(params);
        const response:Response = await fetch(fetchURL);
        return response;
    } catch (error) {
        return false;
    }
}

/*Conversations*/

export async function initConversation(sender:User,receiverUsername:string, text:string, price:number) {
    if(sender.type != UserRole.ServiceProvider || receiverUsername == '' || text == '' || price < 0) return false;
    let init_Message:Message_OfferRequest = {
        sender: sender,
        messageType: MessageType.Offer,
        text:text,
        details: {
            price: price
        }
    }
    let request:ConversationInsertRequest = {
        usernames: {
            customer: receiverUsername,
            serviceprovider: sender.username
        },
        initMessage: init_Message
    }
    let response:boolean | Response = await sendPOST("/api/conversations/init",request);
    return response
}

export async function openConversation(conversationID:string) {
    if(conversationID == '') return false;
    let message:ConversationUpdateRequest = {
        conversationID: conversationID
    }
    let response:boolean | Response = await sendPOST("/api/conversations/open",message);
    return response;
}

export async function archiveConversation(conversationID:string) {
    if(conversationID == '') return false;
    let message:ConversationUpdateRequest = {
        conversationID: conversationID
    }
    let response:boolean | Response = await sendPOST("/api/conversations/archive",message);
    return response;
}

export async function getConversations(user:User, receiverFilter:string = '',offset:number = 0, amount:number = 0):Promise<ConversationListResponse> {
    if(user == null) return {conversations:[],lastOpened:undefined};
    let filter;
    if(receiverFilter == '') filter = {}
    else{
        if(user.type == UserRole.ServiceProvider) {
            filter = {"usernames.customer":receiverFilter}
        }
        else{
            filter = {"usernames.serviceprovider":receiverFilter}
        }
    }
    const queryParams = {
        query: JSON.stringify(filter),
        offset: offset+"",
        amount: amount+""
    };
    let response = await sendGET('/api/conversations/list',queryParams)
    if(response == false) {
        return {conversations:[],lastOpened:undefined};
    }
    let responseObj = await response.json()
    return responseObj.data;
}

/*Messages*/

async function sendMessage(message:MessageRequest) {
    return await sendPOST("/api/messages/send",message);
}
export async function sendTextMessage(sender:User, conversationID:string, text:string) {
    if(conversationID == '' || text == '') return false;
    let message:Message_StandardRequest = {
        conversationID: conversationID,
        sender: sender,
        messageType: MessageType.Standard,
        text:text
    }
    return await sendMessage(message);
}

export async function sendAcceptMessage(sender:User, conversationID:string, text:string = '') {
    if(conversationID == '') return false;
    let message:Message_AcceptRequest = {
        conversationID: conversationID,
        sender: sender,
        messageType: MessageType.Accept,
        text:text
    }
    return await sendMessage(message);
}

export async function sendRejectMessage(sender:User, conversationID:string, text:string = '') {
    if(conversationID == '') return false;
    let message:Message_RejectRequest = {
        conversationID: conversationID,
        sender: sender,
        messageType: MessageType.Reject,
        text:text
    }
    return await sendMessage(message);
}


export async function sendFileMessage(sender:User, conversationID:string, file:File,callback:Function) {
    if(conversationID == '') return false;

    let message:Message_FileRequest = {
        conversationID: conversationID,
        sender: sender,
        messageType: MessageType.File
    };

    let formData:FormData = new FormData()
    formData.append('message', JSON.stringify(message));
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const response = await new Promise((resolve) => {
        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
                callback((event.loaded / event.total)*100);
            }
        });
        xhr.addEventListener("loadend", () => {
            resolve(xhr.readyState === 4 && xhr.status === 200);
        });
        xhr.open("POST", "/api/messages/send/file", true);
        xhr.send(formData);
    });
    return response;
}


export async function getMessages(conversationID:string,offset:number = 0,amount:number = 0) {
    if(conversationID == '') return false;
    const queryParams = {
        conversationID: conversationID,
        offset: offset+"",
        amount: amount+""
    };
    return await sendGET('/api/messages/receive',queryParams)
}


//Helpers
export function getOtherUsername(user:User,usernames:{customer:string,serviceprovider:string}) {
    if(user.type == UserRole.ServiceProvider) {
        return usernames.customer;
    }
    else{
        return usernames.serviceprovider;
    }
}

export function getFileExtension(filePath:string) {
    return filePath.slice(((filePath.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function getFileName(filePath:string) {
    const pathParts = filePath.split(/[\/\\]/);
    const fileNameWithExtension = pathParts[pathParts.length - 1];
    return fileNameWithExtension;
}
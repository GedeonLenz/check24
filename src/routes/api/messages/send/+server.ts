import {collection_messages} from "$db/collections";
import type {
    Conversation,
    Message_Accept,
    Message_AcceptInsert,
    Message_AcceptRequest,
    Message_Offer,
    Message_OfferInsert,
    Message_OfferRequest,
    Message_Reject,
    Message_RejectInsert,
    Message_RejectRequest,
    Message_Standard,
    Message_StandardInsert,
    Message_StandardRequest,
    MessageRequest,
    NewMessageResponse,
    User
} from "$lib/types";
import {ConversationState, MessageType, UserRole} from "$lib/types";
import {
    getConversation,
    getCurrentDateTime,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant, setConversationState, updateConversation
} from "$lib/tools/serverTools";
import {checkUserRole, getUser} from "$lib/auth";
import type {ObjectId} from "mongodb";

/*Send Conversation Init MSG POST*/
export async function _sendInitMessage(currentUser:User, msg:Message_OfferRequest, currentConversation:Conversation) {
    if(
        (currentUser == null) ||
        (currentConversation == null) ||
        (msg.sender.username != currentUser.username || msg.sender.type != currentUser.type) ||
        (
            !(
                checkUserRole(currentUser,UserRole.ServiceProvider) &&
                currentConversation.state == ConversationState.Initalizing
            )
        )
    ) return null;

    let messageToInsert:Message_OfferInsert = {
        conversationID: currentConversation._id.toString(),
        sender: msg.sender,
        messageType: msg.messageType,
        read:false,
        text:msg.text,
        dates: {
            created: getCurrentDateTime(),
            updated: getCurrentDateTime(),
            read: "",
        },
        details: msg.details
    }

    const result = await collection_messages.insertOne(messageToInsert);
    if(result.acknowledged) {
        //Update conversation
        const updated:boolean = await setConversationState(currentConversation._id,ConversationState.Quoted);
        if(!updated) {
            return null;
        }
        let messageID:ObjectId = result.insertedId
        let finalMessage: Message_Offer = {
            _id: messageID.toString(),
            ...messageToInsert
        };
        return finalMessage;
    }
    else return null;
}

//Send Messages
export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    //Request data
    const body = await event.request.json();
    let requestMessage:MessageRequest = body.data;
    let messageType:MessageType = requestMessage.messageType;

    //Checks
    let currentConversation:Conversation | null = await getConversation(requestMessage.conversationID);
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    if(
        (requestMessage.sender.username != currentUser.username || requestMessage.sender.type != currentUser.type) ||
        (!(await isUserConversationParticipant(currentUser,requestMessage.conversationID)))
    ) {
        return getResponse_Unauthorized();
    }

    //Message handling
    if(messageType == MessageType.Accept){
        if(isValidAcceptMessage(currentUser,currentConversation)) {
            return handleAcceptMessage(requestMessage as Message_AcceptRequest, currentConversation);
        }
    }
    else if(messageType == MessageType.Reject){
        if(isValidRejectMessage(currentUser,currentConversation)){
            return handleRejectMessage(requestMessage as Message_RejectRequest, currentConversation);
        }
    }
    else if(messageType == MessageType.Standard){
        if(isValidStandardMessage(currentUser,currentConversation)){
            return handleStandardMessage(requestMessage as Message_StandardRequest, currentConversation);
        }
    }
    return getResponse_BadRequest();
}

function isValidAcceptMessage(currentUser:User, currentConversation:Conversation) {
    let c1 = checkUserRole(currentUser,UserRole.Customer);
    let c2 = (currentConversation.state == ConversationState.Quoted || currentConversation.state == ConversationState.Chatting);
    return c1 && c2;
}
function isValidRejectMessage(currentUser:User, currentConversation:Conversation) {
    let c1 = checkUserRole(currentUser,UserRole.Customer);
    let c2 = (currentConversation.state == ConversationState.Quoted || currentConversation.state == ConversationState.Chatting);
    return c1 && c2;
}

function isValidStandardMessage(currentUser:User, currentConversation:Conversation) {
    let c1 = (currentConversation.state == ConversationState.Quoted || currentConversation.state == ConversationState.Rejected);
    let c2 = checkUserRole(currentUser,UserRole.Customer);

    let c4 = (currentConversation.state == ConversationState.Chatting || currentConversation.state == ConversationState.Accepted);
    let c5 = (checkUserRole(currentUser,UserRole.Customer) || checkUserRole(currentUser,UserRole.ServiceProvider));

    let c3 = c1 && c2;
    let c6 = c4 && c5;

    return (c3 || c6);
}

async function handleAcceptMessage(requestMessage:Message_AcceptRequest, currentConversation:Conversation) {
    let message = requestMessage;
    let messageToInsert:Message_AcceptInsert = {
        conversationID: currentConversation._id,
        sender: message.sender,
        messageType: message.messageType,
        read:false,
        text:message.text,
        dates: {
            created: getCurrentDateTime(),
            updated: getCurrentDateTime(),
            read: "",
        },
    }

    const result = await collection_messages.insertOne(messageToInsert);
    if(result.acknowledged) {
        const updated1: boolean = await setConversationState(currentConversation._id, ConversationState.Accepted);
        const updated2: boolean = await updateConversation(currentConversation);
        if (!updated1 && updated2) {
            return getResponse_InternalError();
        }

        let messageID:ObjectId = result.insertedId
        let finalMessage: Message_Accept = {
            _id: messageID.toString(),
            ...messageToInsert
        };
        let response:NewMessageResponse = {
            message: finalMessage,
        }
        return getResponse_Success(response);
    }
    else return getResponse_InternalError();
}

async function handleRejectMessage(requestMessage:Message_RejectRequest, currentConversation:Conversation) {
    let message = requestMessage;

    let messageToInsert:Message_RejectInsert = {
        conversationID: currentConversation._id,
        sender: message.sender,
        messageType: message.messageType,
        read:false,
        text:message.text,
        dates: {
            created: getCurrentDateTime(),
            updated: getCurrentDateTime(),
            read: "",
        },
    }

    const result = await collection_messages.insertOne(messageToInsert);

    if(result.acknowledged) {
        const updated1: boolean = await setConversationState(currentConversation._id, ConversationState.Rejected);
        const updated2: boolean = await updateConversation(currentConversation);
        if (!updated1 && updated2) {
            return getResponse_InternalError();
        }

        let messageID:ObjectId = result.insertedId
        let finalMessage: Message_Reject = {
            _id: messageID.toString(),
            ...messageToInsert
        };
        let response:NewMessageResponse = {
            message: finalMessage,
        }
        return getResponse_Success(response);
    }
    else return getResponse_InternalError();
}

export async function handleStandardMessage(requestMessage:Message_StandardRequest,currentConversation:Conversation){
    let message = requestMessage;

    let messageToInsert:Message_StandardInsert = {
        conversationID: currentConversation._id,
        sender: message.sender,
        messageType: message.messageType,
        read:false,
        text:message.text,
        dates: {
            created: getCurrentDateTime(),
            updated: getCurrentDateTime(),
            read: "",
        },
    }

    const result = await collection_messages.insertOne(messageToInsert);
    if(result.acknowledged) {
        if(currentConversation.state == ConversationState.Quoted) {
            const updated: boolean = await setConversationState(currentConversation._id, ConversationState.Chatting);
            if (!updated) {
                return getResponse_InternalError();
            }
        }
        const updated: boolean = await updateConversation(currentConversation);
        if (!updated) {
            return getResponse_InternalError();
        }
        let messageID:ObjectId = result.insertedId
        let finalMessage: Message_Standard = {
            _id: messageID.toString(),
            ...messageToInsert
        };
        let response:NewMessageResponse = {
            message: finalMessage
        }
        return getResponse_Success(response);
    }
    else return getResponse_InternalError();
}
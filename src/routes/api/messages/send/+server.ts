import {collection_conversations, collection_messages} from "$db/collections";
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
} from "../../types";
import {ConversationState, MessageType, UserRole} from "../../types";
import {
    extractFindData, getConversation,
    getCurrentDateTime,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized,
    isUserConversationParticipant, setConversationState, updateConversation
} from "$lib/serverTools";
import {checkUserRole, getUser} from "../../auth/auth";
import type {ObjectId} from "mongodb";

/*Send Conversation Init MSG POST*/
export async function _sendInitMessage(currentUser:User, msg:Message_OfferRequest, currentConversation:Conversation) {
    if(currentUser == null) return null;

    if(currentConversation == null) {
        return null;
    }

    if(msg.sender.username != currentUser.username || msg.sender.type != currentUser.type) {
        return null;
    }

    if(
        checkUserRole(currentUser,UserRole.ServiceProvider) &&
        currentConversation.state == ConversationState.Initalizing
    ) {
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
    }
    return null;
}

//Send Messages
export async function POST(event:any) {
    let currentUser = await getUser(event.cookies);
    if(currentUser == null) return getResponse_Unauthorized();

    //Request data
    const body = await event.request.json();
    let requestMessage:MessageRequest = body.data;
    let messageTye:MessageType = requestMessage.messageType;

    //Checks
    if(requestMessage.sender.username != currentUser.username || requestMessage.sender.type != currentUser.type) {
        return getResponse_Unauthorized();
    }

    let currentConversation:Conversation | null = await getConversation(requestMessage.conversationID);
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    if(!(await isUserConversationParticipant(currentUser,requestMessage.conversationID))) {
        return getResponse_Unauthorized();
    }

    //File check
    if(messageTye == MessageType.File){
        return getResponse_BadRequest();
    }

    //Message handling
    if(messageTye == MessageType.Accept){
        if(
            checkUserRole(currentUser,UserRole.Customer) &&
            (
                currentConversation.state == ConversationState.Quoted ||
                currentConversation.state == ConversationState.Chatting
            )
        ) {
            let message = requestMessage as Message_AcceptRequest
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
        }
        else {
            return getResponse_BadRequest();
        }
    }
    else if(messageTye == MessageType.Reject){
        if(
            checkUserRole(currentUser,UserRole.Customer) &&
            (
                currentConversation.state == ConversationState.Quoted ||
                currentConversation.state == ConversationState.Chatting
            )
        ) {
            let message = requestMessage as Message_RejectRequest

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

        }
        else {
            return getResponse_BadRequest();
        }
    }
    else if(messageTye == MessageType.Standard){
        if(
            (
                (
                    currentConversation.state == ConversationState.Quoted ||
                    currentConversation.state == ConversationState.Rejected
                )
                &&
                checkUserRole(currentUser,UserRole.Customer)
            )
            ||
            (
                (
                    currentConversation.state == ConversationState.Chatting ||
                    currentConversation.state == ConversationState.Accepted
                )
                &&
                (
                    checkUserRole(currentUser,UserRole.Customer) ||
                    checkUserRole(currentUser,UserRole.ServiceProvider)
                )
            )
        ) {
            let message = requestMessage as Message_StandardRequest

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
        }
        else {
            return getResponse_BadRequest();
        }
    }
    else{
        return getResponse_BadRequest();
    }
}
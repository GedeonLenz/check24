import {collection_conversations, collection_messages} from "$db/collections";
import type {
    Conversation, Message_Accept, Message_AcceptInsert,
    Message_AcceptRequest, Message_File, Message_FileInsert,
    Message_FileRequest, NewMessage_FileResponse,
    Message_Offer,
    Message_OfferInsert,
    Message_OfferRequest, Message_Reject, Message_RejectInsert,
    Message_RejectRequest, Message_Standard, Message_StandardInsert,
    Message_StandardRequest,
    MessageInsert,
    MessageRequest, NewMessageResponse,
    User
} from "../../types";
import {ConversationState, MessageType, UserRole} from "../../types";
import {
    extractFindData,
    getCurrentDateTime,
    getResponse_BadRequest,
    getResponse_InternalError,
    getResponse_Success,
    getResponse_Unauthorized
} from "../../tools";
import {checkUserRole, getUser} from "../../auth/auth";
import {ObjectId} from "mongodb";

/*Send Conversation Init MSG POST*/
export async function sendInitMessage(currentUser:User, msg:Message_OfferRequest) {
    if(currentUser == null) return null;

    let currentConversation:Conversation | null = await getConversation(msg._id);
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
            conversationID: currentConversation._id,
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

    const body = await event.request.json();

    let requestMessage:MessageRequest = body.data;
    let messageTye:MessageType = requestMessage.messageType;

    if(requestMessage.sender.username != currentUser.username || requestMessage.sender.type != currentUser.type) {
        return getResponse_Unauthorized();
    }

    let currentConversation:Conversation | null = await getConversation(requestMessage._id);
    if(currentConversation == null) {
        return getResponse_BadRequest();
    }

    if(messageTye == MessageType.Offer) {
        let res:Message_Offer | null = await sendInitMessage(currentUser,requestMessage as Message_OfferRequest)
        if(res != null) {
            let response:NewMessageResponse = {
                message: res,
            }
            return getResponse_Success(response);
        }
        else{
            return getResponse_BadRequest();
        }
    }
    else if(messageTye == MessageType.Accept){
        if(
            checkUserRole(currentUser,UserRole.Customer) &&
            currentConversation.state == ConversationState.Quoted
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
                const updated: boolean = await setConversationState(currentConversation._id, ConversationState.Accepted);
                if (!updated) {
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
            currentConversation.state == ConversationState.Quoted
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
                const updated: boolean = await setConversationState(currentConversation._id, ConversationState.Rejected);
                if (!updated) {
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
    else if(messageTye == MessageType.File){
        if(
            (
                currentConversation.state == ConversationState.Quoted &&
                checkUserRole(currentUser,UserRole.Customer)
            )
            ||
            (
                currentConversation.state == ConversationState.Chatting &&
                (
                    checkUserRole(currentUser,UserRole.Customer) ||
                    checkUserRole(currentUser,UserRole.ServiceProvider)
                )
            )
        ) {
            let message = requestMessage as Message_FileRequest

            //todo handle file upload

            let messageToInsert:Message_FileInsert = {
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

                let messageID:ObjectId = result.insertedId
                let finalMessage: Message_File = {
                    _id: messageID.toString(),
                    ...messageToInsert
                };
                let response:NewMessage_FileResponse = {
                    message: finalMessage,
                    fileURL: ""
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
                currentConversation.state == ConversationState.Quoted &&
                checkUserRole(currentUser,UserRole.Customer)
            )
            ||
            (
                currentConversation.state == ConversationState.Chatting &&
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

async function setConversationState(id:string,state:ConversationState) {
    const res = await collection_conversations.updateOne( { _id: new ObjectId(id) },
        {
            $set: {
                state: state
            }
        });
    return (res.modifiedCount == 1);
}

async function getConversation(id:string) {
    const data = await collection_conversations.find({_id:new ObjectId(id)},{limit:1, projection: {}}).toArray()
    let conversations:Conversation[] = extractFindData<Conversation>(data);
    if (conversations.length >= 1) {
        return conversations[0];
    }
    else{
        return null;
    }
}
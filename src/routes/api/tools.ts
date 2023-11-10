export function getCurrentDateTime(): string {
    const now = new Date();
    return now.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function extractFindData<GenericType>(data: any[]):GenericType[] {
    return data.map(item => ({
        ...item,
        _id: item._id.toString()
    })) as unknown as GenericType[];
}

export function getResponse_Success(data: any = {}) {
    let jsonBody = {
        success:true,
        data:data
    }
    return new Response(JSON.stringify(jsonBody), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    })
}

export function getResponse_ErrorCode(code:number) {
    return new Response(JSON.stringify({success:false}), {
        headers: {
            'Content-Type': 'application/json',
        },
        status: code
    });
}

export function getResponse_BadRequest() {
    return getResponse_ErrorCode(400);
}

export function getResponse_InternalError() {
    return getResponse_ErrorCode(500);
}

export function getResponse_Unauthorized() {
    return getResponse_ErrorCode(401);
}
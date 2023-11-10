import { connectMongoDB } from "$db/mongo"

connectMongoDB().then(() =>{
    console.log("Mongo db connected");
}).catch(e => {console.error(e)})

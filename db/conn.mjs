import { MongoClient } from "mongodb";

//this is allowing me to access the things that are in the .env
//file - so that i can  use sensitive information in my application
//but not upload it to github
import dotenv from "dotenv";
dotenv.config();

//this is creating new mongodb client
//we are accessing our .emv files (process.emv)
//if you're trying to access ALTAS_URI
//make sure this is in your .emv
const client = new MongoClient(process.env.ATLAS_URI);

let conn;

try {
  conn = await client.connect();
  console.log("connected");
} catch (err) {
  console.log(err);
}

let db = conn.db("sample_training");

export default db;

// This is where I connect to my mongoDB
//  remember that is hosted outside of my computer

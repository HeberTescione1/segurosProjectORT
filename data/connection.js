import "dotenv/config";
import { MongoClient } from "mongodb";
const uri = process.env.MONGODB;

const client = new MongoClient(uri);

let instance = null;

export default async function getConnection() {
  if (instance == null) {
    try {
      instance = await client.connect();
    } catch (error) {
      console.log(error.message);
    }
  }
  return instance;
}

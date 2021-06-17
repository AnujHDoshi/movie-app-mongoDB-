const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()

const mongoClient = require('mongodb').MongoClient;

const url = process.env.MONGO_ENV;

const dbname = "movie-app";
const collectionName = "movies";
let client;

const app = express();
const connectToDB = async() =>{
    client = await mongoClient.connect(url);
}
app.use(bodyParser.json());
app.get("/",(req,res)=>{
    res.json({message:"Server is up..."});
});
app.get("/movieList",async(req,res)=>{
    console.log(url)
    const collection = client.db(dbname).collection(collectionName);
    const response = await collection.find().toArray()
    res.json({response});
});

app.post("/addMovie",async(req,res)=>{
    const {title,year,length,actor} = req.body
    const collection = client.db(dbname).collection(collectionName);
    const insert = await collection.insertMany([{ 
                title:title,
                year:year,
                length:length,
                actor:actor
            }])
    res.json(insert.result);
});

app.put("/updateMovie/:name",async(req,res)=>{
    const { name:movieName } = req.params;
    const year = req.body.year;
    const collection = client.db(dbname).collection(collectionName);

    const response = await collection.updateOne(
        { title: movieName },
        {
            $set: {
                year : year
            }
        }
    );
    res.json(response.result);
});

app.delete("/deleteMovie/:name",async(req,res)=>{
    const { name:movieName } = req.params;
    
    const collection = client.db(dbname).collection(collectionName);

    const response = await collection.deleteOne({ title: movieName });
    res.json(response.result);
});

app.get("/actorAnalytics",async(req,res)=>{
    
    const collection = client.db(dbname).collection(collectionName);

    const response = await collection.aggregate([
        {
           $group:{
              ActorName:"$actor",
              runningTime:{"$sum":"$length"},
              totalMoviesOfActor:{"$sum":1}
           }
        }])
    res.json(response);
});
connectToDB();
app.listen(3000);
//const url = 'mongodb://localhost:27017';

// const connectToDB = async()=>{
//     const client = await mongoClient.connect(url);

//     const dbname = "movie-app";
//     const collectionName = "movies";
    
//     const collection = client.db(dbname).collection(collectionName);
    
//     const insert = await collection.insertMany([{ 
//         "title" : "Spiderman", 
//         "year" : "2020", 
//         "length" : 124.0, 
//         "actor" : "James Franco"
//     },{
//         "title" : "Godzilla", 
//         "year" : "2021", 
//         "length" : 130.0, 
//         "actor" : "Jony"
//     }])
//     console.log("Movie Added Successfully ");
//     client.close();
// }
// connectToDB();


var express = require('express');
var mongoose = require('mongoose');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
require('dotenv').config();
var port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false, serverSelectionTimeoutMS: 5000 });

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error: '));
connection.once('open', () => {
    console.log("MongoDB database connection established successfully ");
});
const Schema = mongoose.Schema;
var highScoreSchema = new Schema({
    name: String,
    score: Number
});
const High_Score = mongoose.model("High_Score", highScoreSchema);

//app.use("/public", express.static(process.cwd()+ '/public'));
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html')
});

app.post("/", async function (req, res) {
    var newName = req.body.p_name;
    var newScore = req.body.p_score;
    try {
        let findOne = await High_Score.findOne({
            name: newName
        })
        if (findOne) {
            var oldScore = parseInt(findOne.score);
            if (oldScore > newScore) {                        
                await High_Score.findOneAndUpdate({name: findOne.name}, {$set: {score: oldScore}});  
                console.log("score updated");              
            }
            else {                
                await High_Score.findOneAndUpdate({name: findOne.name}, {$set: {score: newScore}});  
                console.log("new score updated");            
            }
        }
        else {
            findOne = new High_Score({
                name: newName,
                score: newScore
            })
            await findOne.save();            

        }
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error...');
    }
})

app.get("/HS/new", (req, res) => {
    try {
        High_Score.find().sort({ score: -1 }).limit(5).exec((error, data) => { 
            if (data) {                        
            res.send(data);
            } else res.status(404).json('no data found') })
    }
    catch(err) {
        console.log(err).res.status(500).json("Server error");
    }
})

var listener = app.listen(port, () => {
    console.log("Server is listening on port: " + listener.address().port);
})
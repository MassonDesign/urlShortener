require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const { Schema } = mongoose;
const app = express();


const mySecret = process.env['MONGO_URI']
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  original_url: String,
  short_url: Number
})

const Url = mongoose.model("Url", urlSchema);



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.post("/api/shorturl", (req, res, next) => {
  console.log(req.body)
  
  const { url } = req.body
  const shortUrl = Math.floor(Math.random() * 1000);

 
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

  console.log(regex)

  if(regex.test(url)){

    const post = new Url({
      original_url: url,
      short_url: shortUrl
    })
    post.save((err, post) => {
      if(err) {return next(err)}
      res.json(201, {
        original_url: url,
        short_url: shortUrl
      })
    })
   
  } else {
    res.json({
      error: "Invalid url"
    })
  }
  
})

app.get("/api/shorturl/:shortUrl", (req, res) => {
  console.log(req.params)
  const { shortUrl } = req.params; 
  
 Url.findOne({short_url: shortUrl}, (err, url) => {
      if (err) return console.log(err)
      console.log(url)
      res.statusCode = 302;
      res.setHeader("Location", url.original_url);
      res.end() 
    })
  
  
  
  
  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

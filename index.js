require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const mongoose = require('mongoose');
mongoose.connect(process.env.DBURI, {useNewUrlParser: true});
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let urlShortSchema = mongoose.Schema({
  longUrl : {
    type:String,
    required: true
  }
});

let UrlShortModel = mongoose.model('UrlShort', urlShortSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req,res){ //check if url is okay and then save to the database
  let inputUrl = req.body.url;
  console.log(urlParser.parse(inputUrl).hostname);
  const something = dns.lookup(urlParser.parse(inputUrl).hostname, (error,address) => {
    if(!address){
      res.json({error: 'invalid url'});
    }
    else{
      let record = new UrlShortModel({
        longUrl : inputUrl
      });
      record.save(function(error, data){
         if(error) console.error(error);
         else{
          res.json({
            original_url : inputUrl,
            short_url : data.id
          });
         }
      });
    }
  });
})

app.get('/api/shorturl/:url', function(req,res){
  UrlShortModel.findById(req.params.url, (error,data) => {
    if(error) console.error(error);
    else{
      res.redirect(data.longUrl);
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

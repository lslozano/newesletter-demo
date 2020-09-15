require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https")
const AUDIENCE_ID = process.env.AUDIENCE_ID;
const US_SERVER = process.env.US_SERVER;
const MAIL_KEY = process.env.MAIL_KEY;

const PORT = process.env.PORT || 3000;
const signup = "/signup.html";
const success = "/success.html";
const failure = "/failure.html";

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}${signup}`);
})

app.post("/", (req, res) => { 
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  const url = `https://${US_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}`;

  const options = {
    method: "POST",
    auth: `ls:${MAIL_KEY}`
  }

  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.sendFile(`${__dirname}${success}`);
    } else {
      res.sendFile(`${__dirname}${failure}`);
    }

    response.on("data", (data) => console.log(JSON.parse(data)))
  })

  request.write(jsonData);
  request.end();
})

app.post("/failure", (req, res) => {
  res.redirect("/");
})

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
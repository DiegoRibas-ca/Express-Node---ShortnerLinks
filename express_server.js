const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
   const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
   let output = "";
   for (let i = 0; i < 6; i++) {
       let randomIndex = Math.floor(Math.random() * (vocabulary.length - 1));
       output += vocabulary[randomIndex];
   }
   return output;
}
// DATABASE
const urlDatabase ={
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//ROOT
app.get("/", function(req, res) {
  res.end("Hello!");
});

//COOKIES - username sign in -----------------
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//delete username
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
//-------------------------------------------
//ALL MAIN RENDERS BELOW ----------------------
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
    let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});
// ---------------------------------------
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
//DELETE url - url_index template post buttom
app.post("/urls/:id/delete", (req, res) => {
  let urlDetele = req.params.id;
  for (let lookKey in urlDatabase) {
    if(lookKey == urlDetele) {
      delete urlDatabase[lookKey];
    };
  };
  res.redirect("/urls");
});
//UPDATE ShortURL - urls_show template
app.post("/urls/:id/update", (req, res) => {
  let shortUpdate = req.params.id;
  urlDatabase[shortUpdate] = req.body.longURL;
  console.log(urlDatabase);  // debug statement to see POST parameters
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end(`<html>
            <body>Hello<b>World</b>
            </body>
          </html>\n`);
});

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});


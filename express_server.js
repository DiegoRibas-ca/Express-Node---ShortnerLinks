const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'))

//USEFUL FUNCTIONS -----------------------------------------------------------------
function generateRandomString() {
   const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
   let output = "";
   for (let i = 0; i < 6; i++) {
       let randomIndex = Math.floor(Math.random() * (vocabulary.length - 1));
       output += vocabulary[randomIndex];
   }
   return output;
}
function lookForRepeat(keyRequested, key, object) {
  for (i in object) {
    if (object[i][key] === keyRequested) {
      return true;
    };
  };
  return false;
};
function findUsersEmail(email) {
  for (i in users) {
    if(users[i].email === email) {
      return users[i].id;
    };
  };
  return false;
};
function findUsersPassword(password) {
  for (i in users) {
    if(users[i].password === password) {
      return users[i].password;
    };
  };
  return false;
};
function checkUser(req, res, next) {
  let currentUser = req.cookies.user_id;
  if (req.path === "/urls/new" && lookForRepeat(currentUser, "id", users) === false) {
  // if (req.path === "/login" || req.path ==="/register" || req.path === "/urls" || req.path === "/") {
    res.redirect('/login')
    return
  }
  next();
}
app.use(checkUser);

// -------------------------------------------------------------------------------
// DATABASES
const urlDatabase = {
  "b2xVn2": { website: "http://www.lighthouselabs.ca",
            userID: "userRandomID" },
  "9sm5xK":  { website: "http://www.google.com",
            userID: "user2RandomID" },
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
//ROOT
app.get("/", function(req, res) {
  // res.end("Hello!");
  res.redirect("/urls");
});


//ALL MAIN RENDERS BELOW ----------------------
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});
  // console.log(urlDatabase2[users.])
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  user: users[req.cookies["user_id"]]
};
  res.render("urls_show", templateVars);
});
app.get("/register", (req, res) => {
  let templateVars = {};
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  let templateVars = {};
  res.render("login", templateVars);
});
//REGISTER treatment
app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let user_email = req.body.email;
  let user_password = req.body.password;
  if (!user_email || !user_password) {
    res.status(400).send("Blank email or password");
  } else if (lookForRepeat(user_email, "email", users)) {
    res.status(400).send("E-mail already exist");
  } else {
  users[user_id] = {"id": user_id, "email": user_email, "password": user_password };
  res.cookie("user_id", user_id);
  res.redirect("/urls");
  }
});
//LOGIN treatment
app.post("/login", (req, res) => {
  let user_email = findUsersEmail(req.body.email);
  let user_password = findUsersPassword(req.body.password);
  if ((user_email) === false) {
    res.status(403).send("E-mail does NOT exist");
  } else if ((user_password) === false) {
    res.status(403).send("Password Incorrect");
  } else {
  res.cookie("user_id", findUsersEmail(req.body.email));
  res.redirect("/urls");
  }
});
// ---------------------------------------
//SHORT LINK GENERATOR
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let user_id = req.cookies.user_id;
  urlDatabase[shortURL] = { "website":req.body.longURL,
  "userID": user_id };
  console.log(urlDatabase[shortURL]);  // debug statement to see POST parameters
  res.redirect("/urls");
});
//Main Utility - when shortURL is used URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});
//DELETE url - url_index template post buttom
app.post("/urls/:id/delete", (req, res) => {
  let urlDetele = req.params.id;
  let user_id = req.cookies.user_id;
  for (let lookKey in urlDatabase) {
    if(lookKey == urlDetele && urlDatabase[lookKey]["userID"] === user_id) {
      delete urlDatabase[lookKey];
    };
  };
  res.redirect("/urls");
});
//UPDATE ShortURL - urls_show template
app.post("/urls/:id/update", (req, res) => {
  let shortUpdate = req.params.id;
  let user_id = req.cookies.user_id;
  for (let lookKey in urlDatabase) {
    if(lookKey == shortUpdate && urlDatabase[lookKey]["userID"] === user_id) {
      urlDatabase[shortUpdate]["website"] = req.body.longURL;
      console.log(urlDatabase.shortUpdate);  // debug statement to see POST parameters
    }
  }
  res.redirect("/urls");
});
//delete user_id from cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
//------------------------------------------


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//USELESS - EXAMPLE
app.get("/hello", (req, res) => {
  res.end(`<html>
            <body>Hello<b>World</b>
            </body>
          </html>\n`);
});

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});


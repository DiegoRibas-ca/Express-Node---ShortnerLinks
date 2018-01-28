const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser'); // keeping to remind later
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'))
// app.use(cookieParser()); // keeping to remind later
app.use(cookieSession({
  name: 'session',
  keys: ["trying something"]
}));

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
function findUsersIdByEmail(email) {
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
  let currentUser = req.session.user_id;
  if (req.path === "/urls/new" && lookForRepeat(currentUser, "id", users) === false) {
    res.redirect('/login')
    return;
  }
  next();
}
app.use(checkUser);

function urlsForUser(id) {
  databaseUrlUser = {};
  for (i in urlDatabase) {
    if (urlDatabase[i]["userID"] === id) {
      databaseUrlUser[i] = urlDatabase[i];
    };
  };
  return databaseUrlUser;
};

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
    password: "1234" //shouldn`t work because my passwords are passing through bcrypt now
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "4567"
  }
}

//ROOT
app.get("/", function(req, res) {
  // res.end("Hello!");
  res.redirect("/urls");
});

//ALL MAIN RENDERS BELOW ----------------------
app.get("/urls", (req, res) => {

  let templateVars = { urls: urlsForUser(req.session.user_id),
  user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  user: users[req.session.user_id]
};
  if (Object.keys(urlsForUser(req.session.user_id))[0] === req.params.id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("This feature is not possible for your user, come back");
  }
});
app.get("/register", (req, res) => {
  let templateVars = {};
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  let templateVars = {};
  res.render("login", templateVars);
});

//REGISTER treatment ------------------------------
app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let user_email = req.body.email;
  const user_password = bcrypt.hashSync(req.body.password, 10);
  console.log(user_password);
  if (!user_email || !user_password) {
    res.status(400).send("Blank email or password");
  } else if (lookForRepeat(user_email, "email", users)) {
    res.status(400).send("E-mail already exist");
  } else {
  users[user_id] = {
    "id": user_id,
    "email": user_email,
    "password": user_password
  };
  req.session.user_id = user_id
  // res.cookie("user_id", user_id); //just to remind later that I replaced to cookie session
  res.redirect("/urls");
  }
});
//LOGIN treatment
app.post("/login", (req, res) => {
  let user_id = findUsersIdByEmail(req.body.email);
  if (user_id && bcrypt.compareSync(req.body.password, users[user_id].password)) {
    req.session.user_id = user_id
    // res.cookie("user_id", user_id);
    res.redirect("/urls");
  } else if ((user_id) === false) {
    res.status(403).send("E-mail does NOT exist");
  } else {
    res.status(403).send("Password Incorrect");
  }
});
// --------------------------------------------------------
//SHORT LINK GENERATOR
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let user_id = req.session.user_id;
  urlDatabase[shortURL] = { "website":req.body.longURL,
  "userID": user_id };
  res.redirect("/urls");
});
//Main Utility - when shortURL is used URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL]["website"];
  res.redirect(longURL);
});
//DELETE url - url_index template post buttom
app.post("/urls/:id/delete", (req, res) => {
  let urlDetele = req.params.id;
  let user_id = req.session.user_id;
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
  let user_id = req.session.user_id;
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
  res.clearCookie("session");
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


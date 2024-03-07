const express = require("express");
const bodyParser = require("body-parser");
const app = express(); //express instance
const port = 3000;
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const {
  verifyToken,
  getTokenFromHeader,
} = require("./middleware/authMiddleware");

const uri =
  "mongodb+srv://niranjanchougule17:8UWcsLx7rn4OVDMR@cluster0.yi5kohj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect the client to the mondo db server
client.connect();

const databaseName = "free-code-camp";
function connectToDb() {
  // Send a ping to confirm a successful connection
  const db = client.db(databaseName);
  console.log("Successfully connected to db");
  return db;
}

app.get("/verify-existing-email", async (req, res) => {
  //verify if email is existing or not
  const db = connectToDb();
  //access users collection
  const users = db.collection("users");
  //find record matching given email
  const result = await users.findOne({ email: req.query.email });
  //if found return true else return false
  if (result) {
    res.send({
      verified: true,
    });
  } else {
    res.send(null);
  }
});

app.post("/signup", async (req, res) => {
  const db = connectToDb();
  // Access form data from req.body
  const formData = req.body;
  //access users collection
  const users = db.collection("users");

  // Do not create user if already exists
  const existingUser = await users.findOne({ email: req.query.email });
  if (existingUser) {
    res.send(null);
  }

  //create record with details
  const newUser = await users.insertOne({
    email: formData.email,
    name: formData.name,
    password: formData.password,
  });
  // Do something with the form data
  if (newUser) {
    const token = jwt.sign({ userId: newUser._id }, "secret-key-test", {
      expiresIn: "1h",
    });
    res.send({
      token,
    });
  } else {
    res.send(null);
  }
});

app.post("/signin", async (req, res) => {
  const db = connectToDb();
  // Access form data from req.body
  const formData = req.body;
  const users = db.collection("users");
  //find the user with provided email
  const existingUser = await users.findOne({
    email: formData.email,
  });
  //compare the password and if matched then create jwt token
  if (existingUser.password !== formData.password) {
    return res.status(401).json({ error: "Authentication failed" });
  }
  const token = jwt.sign({ userId: existingUser._id }, "secret-key-test", {
    expiresIn: "1h",
  });
  res.status(200).json({ token });
});

app.get("/user-by-tokan", verifyToken, async (req, res) => {
  //get logedin user details
  const db = connectToDb();
  //access users collection
  const users = db.collection("users");
  //find record matching given id
  const result = await users.findOne({
    _id: new ObjectId(req.userId),
  });
  //if found return data else return null
  if (result) {
    res.send(result);
  } else {
    res.send(null);
  }
});

app.get("/courses", verifyToken, async (req, res) => {
  //after login display course list
  const db = connectToDb();
  //access users collection
  const collection = db.collection("courses");
  const courses = await collection.find().toArray();
  res.send(courses);
});

app.get("/course-detail", verifyToken, async (req, res) => {
  //after login display course list
  const db = connectToDb();
  const collection = db.collection("courses");
  const course = await collection.findOne({
    _id: new ObjectId(req.query.id),
  });

  if (course) {
    res.send(course);
  } else {
    res.send(null);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});

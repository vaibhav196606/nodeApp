const express = require("express");
const connectDb = require("./config/dbConnections");
const dotenv = require("dotenv").config();
const session = require("express-session");
const bodyParser = require('body-parser');
const serverlessHttp = require('serverless-http');
const router = express.Router();

const port = process.env.PORT || 4000;
const app = express();

connectDb();


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret : "my secret key",
        saveUninitialized : true,
        resave: false,
    })
);
app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});
app.use(express.static('uploads'));

app.set("view engine","ejs");

app.use("/",require("./routes/routes.js"));

app.use('/.netlify/functions/api', router);
module.exports.handler = serverlessHttp(app);

// app.listen(4000, ()=>{
//     console.log(`App is up and live on Port : ${port}`);
// })
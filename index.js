import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

mongoose.connect("mongodb://localhost:27017",{
dbName: 'mongodb',    
}).then(() => console.log("Database connected")).catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const User = mongoose.model("User",userSchema);

const app = express();

//using middlewares.
app.use(express.static(path.join(path.resolve(),"public")))   //setting static path
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());    //extracting cookie data


app.set("view engine", "ejs");       //setting up view engine.
  
const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if(token) {

        const decoded = jwt.verify(token,"alsdkflaksjdf");
        req.user = await User.findById(decoded._id);        
       next();
       }else {
        res.redirect("/login");
       }
} 

app.get('/',isAuthenticated,(req, res) => {
res.render("logout",{name:req.user.name});
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.get('/register',(req, res) => {
    res.render("register");
    }) 

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if (!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render("login",{email,message:"Incorrect Password"});

    const token = jwt.sign({_id:user._id},"alsdkflaksjdf");

    res.cookie('token',token,{
        httpOnly:true,
        expires: new Date(Date.now() + 60 * 1000),
    });
res.redirect("/");
    
})

app.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    const userData = await User.findOne({email});

    if(userData) {
      return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = await User.create({name, email, password:hashedPassword});
    const token = jwt.sign({_id:user._id},"alsdkflaksjdf");

    res.cookie('token',token,{
        httpOnly:true,
        expires: new Date(Date.now() + 60 * 1000),
    });
res.redirect("/");
});

app.get('/logout', async (req, res) => {
    res.cookie('token',null,{
        httpOnly:true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");
    });



app.listen(3000, () => {
    console.log('Server is working');
})

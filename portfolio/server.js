const express=require("express") //express framewrk
const mongoose=require("mongoose") //mongodb
const bcrypt=require("bcrypt") //bcrypt for hashing 
const path=require("path")
//const axios=require("axios")
//const ejs=require("ejs")

const app=express()
app.use(express.static('public'));

app.use(express.static(path.resolve(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'signup.html')));



//schema create and name:loginschema
const loginschema=new mongoose.Schema({
    name:{
        type:String,
        required :true,
    },
    password:{
        type:String,
        required:true,
       
    }
})

//model create and name:user
const user=mongoose.model('user',loginschema)

//connecting to mongodb
mongoose
.connect('mongodb://127.0.0.1:27017/logsig')
.then(()=>console.log("Connected to mongodb"))
.catch((err)=>console.log("mongo error",err))

//app.use(express.static("Public"))

//converting into data formats
app.use(express.urlencoded({extended:false}))
app.use(express.json({extended:false}))

app.get('/',(req,res)=>{
    res.render("login")
})

app.get('/signup',(req,res)=>{
    res.render("signup")
})

app.post('/api/signup',async(req,res)=>{
    //const body=req.body //storing the parsed body of the req
    const result={ //creation of new user
        name:req.body.user, //user ios the key sent from postman and stored as name in the server
        password:req.body.password, //same here
        username:req.body.name, //same here
    }
    //checking the existence of above created user
    //console.log(result.username) //we will get the name sent from the postman
    const existinguser=await user.findOne({name:req.body.user})  //ckecks the name field with the req user stored in name
    //console.log(existinguser)
    if(existinguser)
    {
        return res.send("User already exists")
        
    }
    else
    {
        //hashing the passwords

        
        const saltround=10
        const hashed=await bcrypt.hash(result.password,saltround)

        result.password=hashed //storing the real pass in hashed pass

        const userdata=await user.insertMany(result) //inserting into db if the user not exists
        console.log(userdata) //o/p the data which is stored in the db
        return res.send("Success")

        

    }
    
})

app.post('/api/login',async(req,res)=>{
    const check=await user.findOne({name:req.body.user}) //find the name field for the requested user from postman
    if(!check){
        res.send("User not exists")
    }
    console.log(req.body.password)
    //console.log(check.password)
    const ismatch=await bcrypt.compare(req.body.password,check.password) //comparing the password which req and the password whose user is checked above
    console.log("Ismatch",ismatch)
    if(ismatch){
        res.json({Msg:"Logged in succesfully"})
    }
    else{
        res.json({Msg:"Wrong password"})
    }
})

app.listen(5000,()=>console.log("Server started"))
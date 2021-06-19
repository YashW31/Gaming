require("dotenv").config()
const express = require('express')
const app = express()
const path = require('path')
const logger = require("morgan")
const mongoose = require("mongoose")
const session = require("express-session")

app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: false}))

const User = require("./models/user")
const Blog = require("./models/blog")

//session
app.use(session({
    secret: process.env.SECRET ,
    resave: true ,
    saveUninitialized:true,
}))
//ejs
app.set("view-engine" , "ejs")

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
}).then(() => console.log("DB connected"))
  .catch(error => console.log(error))

app.get("/" , (req , res) =>{
    message = null,
    res.render("signup.ejs", {
        message: message
    })
})

app.get("/home" , (req , res) =>{
    res.render("index.ejs")
})


app.get("/mainblog/:id" , async (req , res) =>{
    await Blog.findById(req.params.id).then( blog => {
            res.render("main-blog.ejs" , {
                blogs: blog 
            })
        })
})

app.get("/Create" , (req , res) =>{
    res.render("blog-writing.ejs")
})

app.post("/signup" , async (req,res) => {
    try{
        const user = new User({
            username : req.body.username,
            email : req.body.email,
            password : req.body.password
        })
        await user.save();
        res.redirect("/home")
    } catch{
        res.redirect("/")
    }  
})

//middleware
function checkauthentication(req, res, next) {
    if(req.session.user){
        return next()
    }else {
        res.redirect("/")
    }
}

// app.get("/signup" ,checkauthentication,  async (req , res) => {
//     await Todo.find({ userId: req.session.user._id }).then(todo => {
//         res.render("/home" , {
//             todos: todo,
//             username: req.session.user.name,
//         })
//     })   
// })

//login post
app.post("/signin" , async (req, res) =>{
   await User.find({ username: req.body.username}).then(data => {
        if(data == undefined){
            const message = "Username or password incorrect"
            console.log(message)
            res.render("signup.ejs", {
                message: message
        })
        }
        if(req.body.password == data[0].password ){
           req.session.user = data[0]
           res.redirect("/home")
       }
       else{
        const message = "Username or password incorrect"
        console.log(message)
        res.render("signup.ejs", {
            message: message
        })
       }
   }).catch(e =>{
       console.log(e)
   })
})

// app.post("/signin", async (req, res) => {
//     await User.find({ email: req.body.email }).then(data => {
//         if(req.body.password == data[0].password){
//             req.session.user = data[0]
//             res.redirect("/home")
//         }
//     }).catch(e => {
//         console.log(e)
//         res.send("Error")
//     })
// })

app.post("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
})

//set up multer for storing uploaded files
var multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage: storage });

// the GET request handler that provides the HTML UI
 
app.get('/', (req, res) => {
    blogModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});

app.post('/Create', upload.single('image'), (req, res, next) => {
    const obj = new Blog({ 
        fname: req.body.fname,
        title: req.body.title,
        blogpost: req.body.blogpost,
        image: req.file.filename,
        userId: req.session.user._id
    });
    obj.save();
    res.redirect("/myblogs")
});

app.get("/myblogs",  async (req , res) => {
    await Blog.find({ userId: req.session.user._id }).then(blog => {
        // console.log(blog)
        res.render("my-blogs.ejs" , {
            blogs: blog,
            username: req.session.user.name
        })
    }).catch(e => {
        console.log(e)
    }) 
})

app.get("/blog",  async (req , res) => {
    await Blog.find().then(blog => {
        // console.log(blog)
        res.render("blogs.ejs" , {
            blog: blog,
        })
    }).catch(e => {
        console.log(e)
    }) 
})

//delete blog
app.post("/deleteblog/:id", async (req , res) =>{
    console.log("aala")
    await Blog.findByIdAndDelete({_id: req.params.id}).then(result =>{
        if(result){
            console.log("Blog deleted")
            res.redirect("/myblogs")
        }else{
            res.send("error")
        }
    }).catch(e => {
        res.send("error in catch")
    })
})

//edit blog Get
app.get("/editblog/:id" , async (req, res) =>{
    await Blog.findById(req.params.id).then( blog => {
        if(req.session.user._id == blog.userId){
            res.render("update.ejs" , {
                blog: blog 
            })
        }else {
            res.redirect("/myblogs")
        }      
    }).catch( e =>{
        console.log(e)
        res.send("error")
    })
})

//edit blog post
app.post("/updateblog/:id" , async(req , res) =>{
    console.log(req.body)
    await Blog.findOneAndUpdate({_id: req.params.id}, {
        $set: {
            fname: req.body.fname,
            title: req.body.title,
            blogpost: req.body.blogpost,
           
        }
    }, {new: true}).then(result => {
        if(result){
            console.log(result)
            console.log("Blog updated")
            res.redirect("/myblogs")
        }else{
            res.send("error")
        }
    }).catch(e => {
        console.log(e)
        res.send("error in catch")
    })
})

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on port 3000")
})
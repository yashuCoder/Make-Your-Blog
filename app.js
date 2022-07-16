const express = require('express');
const parser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/people-blogs");

const credentialsSchema = {
    name: String,
    password: String,
    belief: String,
    about: String,
    phone: String,
    gender: String,
    email: String
}

const blogSchema = {
    name: String,
    theme: String,
    blogContent: String
}

const User = mongoose.model("User",credentialsSchema);
const Blog = mongoose.model("Blog",blogSchema);

const app = express();

app.use(parser.urlencoded({extended: true}))
app.use(express.static("public"));
app.set("view engine","ejs");

app.get("/",function(req,res){
    res.render("index",{error: "First"});
})

app.get("/register",function(req,res){
    res.sendFile(__dirname+"/register.html");
})

app.get("/")

app.post("/",function(req,res){
    const _userName = req.body.username;
    const userName = _userName.replace(/\s/g,"_");
    const passwordEntered = req.body.password;
    User.findOne({name:userName},function(err,docs){
        if(err){
            console.log(err);
        }
        else{
            if(docs===null){
                if(userName === ""){
                    res.render("index",{error: "userName empty"});
                }else{
                    res.render("index",{error: "userName error"});
                }
            }
            else{
                if(passwordEntered === ""){
                    res.render("index",{error: "password empty"});
                }
                else if(passwordEntered != docs.password){
                    res.render("index",{error: "password wrong"});
                }
                else{
                    res.redirect("/"+userName+"/posts");
                }
            }
        }

    })
})

app.post("/register",function(req,res){
    console.log(req.body);
    const user_name = req.body.username.replace(/\s/g,"_");
    const user = new User({
        name: user_name,
        password: req.body.password,
        belief: req.body.belief,
        about: req.body.about,
        email: req.body.email,
        phone: req.body.phoneNumber,
        gender: req.body.gender
    })
    user.save();
    res.redirect("/");
})

app.listen(3000,function(){
    console.log("The app is running on port 3000");
})
app.get("/:name/posts",function(req,res){
    const user_name = req.params.name;
    const compose_path = "/"+user_name+"/compose";
    const home_path = "/"+user_name+"/home";
    User.findOne({name: user_name},function(err,docs){
        if(err){
            console.log(err);
        }
        else{
            Blog.find({name: user_name},function(err,arr){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("posts",{user: user_name.replace("_"," "),theme: docs.belief.replace("/\s/g","_"),about: docs.about,composePath: compose_path,homePath: home_path, docs: arr});
                }
            })
        }
    })
})

app.get("/:name/compose",function(req,res){
    const rePost = "/"+req.params.name+"/posts";
    res.render("compose",{repost: rePost,method: "create",blogTheme: "",blogContent: ""});
})

app.get("/:name/home",function(req,res){
    const boy = [3,6];
    const girl = [1,2,4,5];
    User.findOne({name: req.params.name},function(err,doc){
        if(err){
            console.log(err);
        }
        else{
            if(doc.gender === "Male"){
                const randm = Math.floor(Math.random()*boy.length);
                var rand = boy[randm]
            }
            else{
                const randg = Math.floor(Math.random()*girl.length);
                var rand = girl[randg];
            }
            console.log(rand);
            Blog.find({name: req.params.name},function(err,arr){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("home",{name:req.params.name, theme: doc.belief,email: doc.email,phone: doc.phone,blogs: arr,profileContent: doc.about,random: rand});
                }
            })

        }
    })
})

app.post("/:name/posts",function(req,res){
    const username = req.params.name
    const blog = new Blog({
        name: username,
        theme: req.body.theme,
        blogContent: req.body.blog_content
    });
    blog.save();
    res.redirect("/"+username+"/posts");
})

app.get("/:name/posts/delete/:blog",function(req,res){
    Blog.deleteOne({name: req.params.name, theme: req.params.blog},function(err,result){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/"+req.params.name+"/posts");
        }
    })
    
})

app.get("/:name/posts/:blog",function(req,res){
    Blog.findOne({name: req.params.name, theme: req.params.blog},function(err,doc){
        if(err){
            console.log(err);
        }
        else{
            res.render("blog",{username: req.params.name, blogTheme: req.params.blog,blogContent: doc.blogContent});
        }
    })
    
})

app.get("/:name/posts/:blog/edit",function(req,res){
    Blog.findOne({name: req.params.name,theme: req.params.blog},function(err,doc){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            const rePost = "/"+req.params.name+"/posts";
            res.render("compose",{repost: rePost,method: "edit",blogTheme: doc.theme,blogContent: doc.blogContent});
            Blog.deleteOne({name: req.params.name,theme: req.params.blog},function(err,result){
                if(err){
                    console.log(err);
                }
            })
        }
    });
})
//
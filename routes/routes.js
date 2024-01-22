const express = require("express");
const router = express.Router();
const Users = require("../models/users");
const multer = require("multer");
const fs = require("fs");

//image upload
var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./uploads");
    },
    filename : function(req,file,cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});

var upload = multer({
    storage : storage,
}).single("image");

router.get("/",async (req,res)=>{
    try{
        const users = await Users.find();
        console.log(users.length);
        res.render("index",{
            title : "My page",
            users : users,
            req : req
        });
    }
    catch(err){
        req.session.message = {
            type: "error",
            message: "Error in fatching data"
        }
        res.render("index",{
            title : "My page",
        });
    }
    
});

router.get("/add",(req,res)=>{
    res.render("add_users",{
        title : "Add Users"
    });
});

router.post("/add", upload, async (req,res)=>{
    console.log("debugging", req.body);
    const user = new Users({
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        image : req.file.filename
    });

    try {
        await user.save();
        req.session.message = {
            type: "success",
            message: "User added successfully!"
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: "Error while adding a user", type: "danger" });
        res.status(401);
    }
});

router.get("/edit/:id", async(req,res)=>{
    try{
        const id = req.params.id;
        console.log("id : ", id);
        const user = await Users.findById(id);
        console.log("name : ", user.name);
        res.render("edit_user",{
            title : "Edit User",
            user : user
        });
    }
    catch(err){
        res.json({ message: "Error finding a user", type: "danger" });
        res.status(401);
    }
})

router.get("/delete/:id",async (req,res)=>{
    try{
        const id = req.params.id;
        console.log("debug", id);
        const user = await Users.findById(id);
        console.log("debug",user);
        if(user){
            await Users.findByIdAndDelete(id);
            console.log("debug after delete");
            req.session.message = {
                type: "success",
                message: "User has been deleted successfully!"
            };
            res.redirect("/");
        }
    }
    catch(err){
        res.json({ message: "Error while deleting a user", type: "danger" });
        res.status(401);
    }
})

router.post("/update/:id", upload, async(req,res)=>{
    try{
        const id = req.params.id;
        const user = await Users.findById(id);
        let newImage = "";
        if(user){
            if(req.file){
                newImage = req.file.filename;
                try{
                    fs.unlinkSync("./uploads/"+req.body.old_image);
                }
                catch(err){
                    console.log(err);
                }
            }
            else{
                newImage = req.body.old_image;
            }

            await Users.findByIdAndUpdate(id,{
                name : req.body.name,
                email : req.body.email,
                phone : req.body.phone,
                image : newImage
            });

            req.session.message = {
                type: "success",
                message: "User updated successfully!"
            };
            res.redirect("/");
        }
    }
    catch(err){
        req.session.message = {
            type: "danger",
            message: "User not updated!"
        };
        res.redirect("/");
    }
})

module.exports = router;
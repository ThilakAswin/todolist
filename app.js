const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Thilak:toodamnhot@thilak.5d7jqob.mongodb.net/");

const itemsSchema = mongoose.Schema({
    name:String
});

const listSchema = mongoose.Schema({
    name: String,
    items:[itemsSchema]
});



const Item  = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Brush Teeth"
});

const item2 = new Item({
    name:"Take Bath"
});

const item3 = new Item({
    name:"Eat Food"
});


const defaultItems = [item1,item2,item3];

const List = mongoose.model("List",listSchema);


async function getItems(){
    const items = await Item.find({});
    return items;
}

app.get("/about",function(req,res){
    res.render("about");
})

app.get("/",function(req,res){
     let day = date.getDate();

    getItems().then(function(foundItems){
        if(foundItems.length === 0)
        {
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        else
             res.render("list", {listTitle:"Today: " + day, newListItems:foundItems})
    });
})

app.post("/", async function(req,res){

    try{
   let newItem = req.body.newItem;
   let listName = req.body.list;
   const item = new Item({
    name : newItem
   });
   
   if(listName === "Today:")
   {
    item.save();
    res.redirect("/");
   }

   else{
    let foundList = await List.findOne({name:listName});
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
   }
   
    }
    catch(err)
    {
        console.log(err);
    }
})

app.post("/delete",async function(req,res){

    try{
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if(listName === "Today:")
        {
            await Item.findByIdAndDelete(checkedItemId);
            console.log("Succefully Deleted")
            res.redirect("/")
            res.end();
        }
        else{
            await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
            res.redirect("/"+listName);
        }
        
    }
    catch(err){
        console.log(err)
    }
   

})

app.get("/:customListName", async function(req,res){

    try{
    const customListName = _.capitalize(req.params.customListName);
    let foundList = await List.findOne({name:customListName});
    

    if(!foundList){

        const list = new List({
            name: customListName,
            items: defaultItems
        });
        
        list.save();
        res.redirect("/"+ customListName);
    }
    else{
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items})
    }
    
}
catch(err){
    console.log(err);
}

})











app.listen(3000,function(){
    console.log("server is running on port 3000");
})
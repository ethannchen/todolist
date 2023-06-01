//jshint esversion:6

require("dotenv").config();
var _ = require('lodash');
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.DB);

  // await mongoose.connect("mongodb+srv://yy:esG6qOnYzwJT70Fl@cluster0.uynj9hu.mongodb.net/");
}

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);



const listSchema = {
  listName: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);





// const defaultItems = 
const workItems = [];

app.get("/", async function (req, res) {
  // const day = date.getDate();

  const data = await Item.find();
  if (data.length === 0) {    
    const item1 = new Item({ name: "cook" });
    const item2 = new Item({ name: "eat" });
    const item3 = new Item({ name: "wash" });

    await Item.insertMany([item1, item2, item3]);
    res.redirect('/')
    
  }else{
    res.render("list", { listName: "Today", newListItems: data });
  }
})


app.post("/", async function (req, res) {
  // const item = req.body.newItem;
  const newItem = req.body.newItem
  const listName = req.body.listName

  const item = new Item({name:newItem})


  if (listName==='Today') {
    item.save()
    res.redirect('/')
  }else{
    await List.findOne({listName:listName}).then((result)=>{
      result.items.push(item)
      // Item.insertMany([item]);
      result.save();
      res.redirect("/"+listName);
    }).catch(err => console.log(err))
  }

});


app.post("/delete", async function (req, res) {
  const itemId = new mongoose.Types.ObjectId(req.body.id)
  const listName = req.body.listName


  
  if (listName==='Today') {
    await Item.findByIdAndDelete(itemId).then().catch(err => console.log(err))
    res.redirect("/");
  }else{
    await List.findOneAndUpdate(
      {listName:listName},
      {$pull:{items:{_id:itemId}}}
    ).then((found)=>{found.save()}).catch(err => console.log(err))
    res.redirect("/"+listName);
  }
  
});



app.get("/work", function (req, res) {
  res.render("list", { listName: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});


app.get("/:listName", async (req,res)=>{
  let listName = _.capitalize(req.params.listName)
  await List.findOne({listName:listName}).then((result)=>{
    // console.log(result)
    if (!result) {
      let list = new List({ listName: listName, items: [] })
      list.save()
      res.redirect("/"+listName)
    }else{
      res.render("list", { listName: listName, newListItems: result.items });
    }
  }).catch(err => console.log(err))
  
  
})



let port = process.env.PORT;
if ( port == null || port == "") {
  port = 8000
}


app.listen(port, function () {
  console.log("Server started on port " + port);
});

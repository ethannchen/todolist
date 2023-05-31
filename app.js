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

app.get("/", function (req, res) {
  // const day = date.getDate();


  Item.find().then((data)=>{
    if (data.length === 0) {    
      const item1 = new Item({ name: "cook" });
      const item2 = new Item({ name: "eat" });
      const item3 = new Item({ name: "wash" });

      Item.insertMany([item1, item2, item3]);
      res.redirect('/')
      
    }else{
      res.render("list", { listName: "Today", newListItems: data });
    }
  })

});

app.post("/", function (req, res) {
  // const item = req.body.newItem;
  const newItem = req.body.newItem
  const listName = req.body.listName

  const item = new Item({name:newItem})


  if (listName==='Today') {
    item.save()
    res.redirect('/')
  }else{
    List.findOne({listName:listName}).then((result)=>{
      result.items.push(item)
      // Item.insertMany([item]);
      result.save();
      res.redirect("/"+listName);
    })
  }

});


app.post("/delete", function (req, res) {
  const itemId = new mongoose.Types.ObjectId(req.body.id)
  const listName = req.body.listName


  
  if (listName==='Today') {
    Item.findByIdAndDelete(itemId).then()
    res.redirect("/");
  }else{
    List.findOneAndUpdate(
      {listName:listName},
      {$pull:{items:{_id:itemId}}}
    ).then((found)=>{found.save()})
    res.redirect("/"+listName);
  }
  
});



app.get("/work", function (req, res) {
  res.render("list", { listName: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});


app.get("/:listName", (req,res)=>{
  let listName = _.capitalize(req.params.listName)
  List.findOne({listName:listName}).then((result)=>{
    console.log(result)
    if (!result) {
      let list = new List({ listName: listName, items: [] })
      list.save()
      res.redirect("/"+listName)
    }else{
      res.render("list", { listName: listName, newListItems: result.items });
    }
  })
  
  
})




if (process.env.PORT === null || ) {
  
}


app.listen(3000, function () {
  console.log("Server started on port 3000");
});

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import {fileURLToPath} from "url";
import path from "path";

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

dotenv.config();

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.eeqa1bn.mongodb.net/todolistDB`);

const itemSchema = {
  name: String,
  list: String
};

const Item = mongoose.model("Item", itemSchema);

app.get("/", async (req, res) => {
  try {
    // Find unchecked items
    const uncheckedItems = await Item.find({list: "Today"});

    // Combine default items and unchecked items
    const foundItems = uncheckedItems;

    //const foundItems = await Item.find({list: "Today"});
    if (foundItems.length === 0) {
      
// Fetch the items again after inserting
const updatedItems = await Item.find({list: "Today"});
const today = new Date();
const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
const day = today.toLocaleDateString("en-US", options);
res.render("index", { listTitle: day, newListItems: updatedItems });
  } else {
  const today = new Date();
  const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
  const day = today.toLocaleDateString("en-US", options);
  res.render("index", { listTitle: day, newListItems: foundItems });
  }
  } catch (error) {
  console.error("Error fetching items:", error);
  res.status(500).send("Error fetching items from the database");
  }
});
  
app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  // const listName = req.body.list;

  // Create a new item document
  const todayItem = new Item({
    name: itemName,
    list: "Today"

  });

  const allItem = new Item({
    name: itemName,
    list: "All"
  });

  // Save the new item documents to the database
  try {
    await todayItem.save();
    await allItem.save();
    console.log("Successfully saved new item to DB.");
    res.redirect("/");
  } catch (err) {
    console.error("Error saving new item:", err);
    res.status(500).send("Error saving new item to the DB.");
  }
});

// Delete item from "/" endpoint
app.post("/delete", async (req, res) => {
  const itemId = req.body.itemId;

  try {
    // Get the item from the "Today" list
    const item = await Item.findOne({ _id: itemId, list: "Today" });

    // If item exists in "Today" list, delete it from both lists
    if (item) {
      await Item.deleteMany({ name: item.name });
    }

    console.log("Successfully deleted the item.");
    res.redirect("/"); // Redirect back to the "/" endpoint
  } catch (err) {
    console.error("Error deleting this item:", err);
    res.status(500).send("Error deleting this item from the DB.");
  }
});

// Delete item from "/all" endpoint
app.post("/all/delete", async (req, res) => {
  const itemId = req.body.itemId;

  try {
    // Get the item from the "All" list
    const item = await Item.findOne({ _id: itemId, list: "All" });

    // If item exists in "All" list, delete it
    if (item) {
      await Item.deleteMany({ name: item.name });
    }

    console.log("Successfully deleted the item.");
    res.redirect("/all"); // Redirect back to the "/all" endpoint
  } catch (err) {
    console.error("Error deleting this item:", err);
    res.status(500).send("Error deleting this item from the DB.");
  }
});   

app.get("/all", async (req, res) => {
  try {
    // Find all items in the "This Week" list
    const allItems = await Item.find({ list: "All"});

    // Render the 'list' view with all items
    res.render("all", { listTitle: "All", newListItems: allItems });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send("Error fetching items from the database");
  }
});

app.post("/all", async (req, res) => {
  const itemName = req.body.newItem;

  try {
    // Create a new item document
    const itemAll = new Item({
      name: itemName,
      list: "All"
    });

    const itemToday = new Item({
      name: itemName,
      list: "Today"
    });

    // Save the new item documents to the database
    await itemAll.save();
    await itemToday.save();

    console.log("Successfully saved new item to DB.");

    // Redirect to "/all" after adding the item
    res.redirect("/all");
  } catch (err) {
    console.error("Error saving new item:", err);
    res.status(500).send("Error saving new item to the DB.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

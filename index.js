import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];
let workItems = [];

app.get("/", function (req, res) {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  const day = today.toLocaleDateString("en-US", options);

  res.render("index.ejs", {
    listTitle: day,
    newListItems: items,
  });
});

app.post("/", (req, res) => {
  const item = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", (req, res) => {
  res.render("index.ejs", {
    listTitle: "Work List",
    newListItems: workItems,
  });
});
app.post("/work", (req, res) => {
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${port}`);
});

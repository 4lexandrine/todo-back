const express = require("express");
const expressMiddleware = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require('dotenv').config();


app.use(cors({
    origin: process.env.ALLOWED_APPS,
}));
app.use(expressMiddleware());

mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const ToDo = mongoose.model("ToDo", {
    title: String,
    done: Boolean
});

app.post("/create", async (req, res) => {
    try {
        const newToDo = new ToDo({
            title: req.fields.title,
            done: req.fields.done
        });

        await newToDo.save();
        res.json({ message: "new task created", newToDo });
    } catch (error) {
        res.status(400).send({ error: error.status });
    }
});

app.get("/read", async (req, res) => {
    try {
        const todos = await ToDo.find();
        res.json(todos);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post("/update", async (req, res) => {
    try {
        const idUpdateTask = await ToDo.findById({ _id: req.fields.id });
        idUpdateTask.done = req.fields.done;

        await idUpdateTask.save();

        res.status(200).send({ message: "task successfully updated" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post("/remove", async (req, res) => {
    try {
        const idRemoveTask = await ToDo.findById({ _id: req.fields.id });
        await idRemoveTask.remove();
        res.status(200).send({ message: "task successfully deleted" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

app.post("/search", async (req, res) => {
    try {
        const todos = await ToDo.find({ title: { $regex: req.fields.title, $options: 'i' } });

        if (todos) {
            res.json({ todos });
        }
        else {
            res.json({ message: "No task found" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

app.get("/", (req, res) => {
    try {
        res.send("React Todolist !");
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.all("*", (req, res) => {
    res.status(404).send({ message: "page introuvable" });
});

app.listen(process.env.PORT || 3100, () => {
    console.log("Server started");
});
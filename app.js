var express = require("express"),
    app = express(),
    session = require('express-session'),
    dbConf = require("./conf.json"),
    bodyParser = require("body-parser"),
    MongoDB = require('mongodb');

var mongoclient, Users, Notes;

var dir = __dirname + "/public/";

MongoDB.MongoClient.connect(dbConf.url, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        mongoclient = db;
        Users = mongoclient.collection("users");
        Notes = mongoclient.collection("notes");

        app.listen(8000, function () {
            console.log("Express server listening on port %d", 8000)
        });
    }
});

app.use(session({
    secret: 'something',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.redirect('/login')
});
app.get('/login', function (req, res) {
    res.sendFile(dir + 'login.html');
});

app.post('/notes', loadUser);

function loadUser(req, res, next) {
    Users.findOne({_id: req.body.username, password: req.body.password}, function (error, user) {
        if (user) {
            delete req.body.password;
            req.session.username = req.body.username;
            res.redirect('main/' + req.session.username);
        } else {
            res.redirect('/login');
        }
    });
}

app.get('/main/:username', showMainPage);

function showMainPage(req, res) {
    if (req.session.username) {
        res.sendFile(dir + 'main.html');
    } else {
        res.redirect('/login');
    }
}

app.get('/main/:username/notes/:noteID', getNotesByID);

function getNotesByID(req, res) {

    if (req.session.username == req.params.username) {
        var noteID = Number(req.params.noteID);

        Notes.find({_id: req.session.username}, {notes: {$elemMatch: {"_id": noteID}}}).next(function (error, doc) {

            if (doc && doc.notes && doc.notes.length && doc.notes.length > 0) {
                res.send(doc.notes[0]);
            } else {
                res.status(404).send({});
            }
        });
    } else {
        res.redirect("/login");
    }
}

app.get('/main/:username/notes', getNotes);

function getNotes(req, res) {

    if (req.session.username == req.params.username) {

        Notes.find({_id: req.session.username}).next(function (error, doc) {
            if (doc) {
                res.send(doc.notes);
            }
        });
    } else {
        res.redirect("/login");
    }
}

app.post('/main/:username/notes/:noteID', saveNote);

function saveNote(req, res) {
    if (req.session.username == req.params.username) {
        var userID = req.session.username;
        var noteID = Number(req.params.noteID);
        // Update a note

        //console.log(req.body, req.files);

        req.body.edited = new Date().toJSON();

        Notes.findOneAndUpdate({_id: userID, 'notes._id': noteID},
            {$set: {"notes.$": getNote(req.body)}}, logMongo);

    }
    else {
        res.redirect("/login");
    }
}

app.post('/main/:username/notes/', createNote);

function createNote(req, res) {

    if (req.session.username == req.params.username) {
        var userID = req.session.username;

        // Create a new note
        Notes.aggregate([
            {$match: {_id: userID}},
            {$unwind: "$notes"}, {$group: {"_id": null, "maximum": {$max: {$ifNull: ["$notes._id", 0]}}}}
        ]).next(function (err, obj) {

            console.log(err);

            if (obj === null)
                obj = {maximum: 0};

            var note = getNote(req.body);
            note._id = obj.maximum + 1;
            note.created = new Date().toJSON();
            note.edited = note.created;

            Notes.findOneAndUpdate({_id: userID}, {$push: {notes: note}}, logMongo);

            res.send(req.body);

        });
    }

}

app.delete('/main/:username/notes/:noteID', deleteNote);

function deleteNote(req, res) {
    if (req.session.username == req.params.username) {

        var userID = req.session.username;
        var noteID = Number(req.params.noteID);
        // Delete a note.
        Notes.findOneAndUpdate({_id: userID}, {$pull: {notes: {_id: noteID}}}, logMongo);

        res.send({_id: noteID});

    }
    else {
        res.redirect("/login");
    }
}

function logMongo(err, obj) {
    if (err) {
        console.warn(err.message);
    } else {
        //console.dir(obj);
    }
}

function getNote(data) {
    return {
        _id: data._id,
        title: data.title,
        content: data.content,
        created: data.created,
        edited: data.edited
    }
}
/*
app.post('/uploadImage', addImage);

function addImage(req, res) {
    var userID = req.session.username;

    console.log(req.body, req.files);

    if (userID) {
        // Update a note

        //console.log(req.body);

        // Notes.findOneAndUpdate({_id: userID},
        //   {$set: {"notes.images": req.body.image}}, logMongo);
    }
    else {
        res.redirect("/login");
    }
}*/
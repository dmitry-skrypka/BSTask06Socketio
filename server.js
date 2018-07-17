const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
const UserModel = require('./models/users');
const MessageModel = require('./models/messages');


mongoose.connect('mongodb://localhost:27017/chat', {useNewUrlParser: true});
app.use(express.static(path.join(__dirname, '/public')));

io.on('connection', (socket) => {
    console.log('Client Connected');
    socket.join('all');
    socket.on('newUser', (obj) => {

        UserModel.findOneAndUpdate({username: obj.username, name: obj.name}, obj.name, {
            new: true,
            upsert: true
        }, function (err, user) {
            socket.to('all').emit("global", user);
            socket.to('all').emit("addUser", user);
        });

        socket.username = obj.username;
        console.log(socket.username + "socketuserbane");
        socket.emit('login', obj);
    });


    socket.on('msg', content => {
        const obj = {
            date: new Date(),
            content: content,
            username: socket.username
        };
        MessageModel.create(obj, err => {
            if (err) return console.error("MessageModel, err");
            socket.emit("message", obj);
            socket.to('all').emit("message", obj)
        });
    });


    socket.on('receiveHistory', () => {
        MessageModel
            .find()
            .sort({$natural: -1})
            .limit(100)
            .exec((err, messages) => {
                if (!err) {
                    socket.emit("history", messages.reverse());
                }
            })
    });

    socket.on('receiveUsers', () => {
        UserModel
            .find({})
            .lean()
            .exec((err, users) => {
                if (!err) {
                    socket.emit("users", users);
                }
            })

    });
    socket.on('typingMessage', () => {
        let user = socket.username;
        let typer = {
            username: user,
            status: 'typing'
        };
        socket.to('all').emit("userIsTyping", typer)
    });

    socket.on('noLongerTypingMessage', () => {
        let user = socket.username;
        let typer = {
            username: user,
            status: 'nottyping'
        };

        socket.to('all').emit("userIsTyping", typer)
    })

});

http.listen(7777, () => {
    console.log('Server Started on 7777')
});
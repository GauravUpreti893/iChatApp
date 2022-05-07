const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyparser = require('body-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// const { setTimeout } = require('timers/promises');
const io = new Server(server);
const users = {};
app.use('/static', express.static('static'));
app.use(express.urlencoded());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb+srv://ChatAdmin:Abc%401234@ichatapp.i9eqi.mongodb.net/ChatDatabase?retryWrites=true&w=majority');
    console.log('connected');
};
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const ichatuser = mongoose.model('ichatuser', userSchema);
app.get('/', function (req, res) {
    res.render('index', {});
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});
let roomslist = [];
io.on('connection', socket => {
    socket.on('new-connection', (newuser, size, type) => {
        if (type == 'Sign up') {
            ichatuser.find({ username: newuser.username }, function (err, docs) {
                if (err) {
                    console.log(err);
                }
                else {
                    object = docs[0];
                    if (docs.length == 0) {
                        socket.emit('successful-connection');
                        let arr = getDetails(io);
                        let rn = [], rc = [];
                        let n = arr.length;
                        for (let i = 0; i < n; i++) {
                            rn[i] = arr[i][0];
                            rc[i] = arr[i][1].size;
                        }
                        socket.emit('connection-established', rn, rc);
                        users[socket.id] = newuser;
                        let object = new ichatuser(newuser);
                        object.save(function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                // console.log('User Added');
                                console.log(result);
                            }
                        });
                        socket.user = newuser;
                        roomslist = new Array(size).fill(0);
                    }
                    else {
                        socket.emit('unsuccessful-connection', type);
                    }
                }
            });
        }
        else {
            ichatuser.find({ username: newuser.username, password: newuser.password }, function (err, docs) {
                if (err) {
                    console.log(err);
                }
                else {
                    object = docs[0];
                    if (docs.length == 1) {
                        let arr = getDetails(io);
                        let rn = [], rc = [];
                        let n = arr.length;
                        for (let i = 0; i < n; i++) {
                            rn[i] = arr[i][0];
                            rc[i] = arr[i][1].size;
                        }
                        let flag3 = 0;
                        for (u in users)
                        {
                            if (users[u].username == newuser.username)
                            {
                                flag3 = 1;
                                break;
                            }
                        }
                        if (!flag3) {
                            socket.emit('successful-connection');
                            socket.emit('connection-established', rn, rc);
                            users[socket.id] = newuser;
                            socket.user = newuser;
                            roomslist = new Array(size).fill(0);
                        }
                        else {
                            socket.emit('unsuccessful-connection', 'multiplesignin');
                        }
                    }
                    else {
                        socket.emit('unsuccessful-connection', type);
                    }
                }
            });
        }
    });
    socket.on('new-user-login', (newuser, room) => {
        socket.room = room;
        socket.join(room);
        socket.emit('newjoin', room);
        let s = '';
        let m = room.length;
        for (let j = 4; j < m; j++) {
            s += room[j];
        }
        let n1 = parseInt(s);
        roomslist[n1 - 1] = 1;
        socket.broadcast.to(room).emit('user-login', newuser, room);
        for (key in users) {
            socket.broadcast.to(key).emit('updaterooms', room, 1);
        }
    });
    socket.on('send', (messagev, room) => {
        socket.broadcast.to(room).emit('recieve', { user: users[socket.id], message: messagev }, room);
    });
    function getDetails(io) {
        const arr = Array.from(io.sockets.adapter.rooms);
        const filtered = arr.filter(room => !room[1].has(room[0]));
        return filtered;
    }
    socket.on('updateroom', (room) => {
        let arr = getDetails(io);
        let flag = 1;
        let idx;
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            if (arr[i][0] == room) {
                flag = 0;
                idx = i;
                break;
            }
        }
        if (flag == 0) {
            let flag1 = 1;
            arr[idx][1].forEach(function (value) {
                if (value == socket.id) {
                    flag1 = 0;
                }
            });
            flag = flag1;

        }
        if (flag) {
            socket.join(room);
            socket.room = room;
            let s = '';
            let m = room.length;
            for (let j = 4; j < m; j++) {
                s += room[j];
            }
            let n1 = parseInt(s);
            roomslist[n1 - 1] = 1;
            // let count1 = io.engine.clientsCount;     //Total Count
            socket.emit('newjoin', room);
            for (key in users) {
                socket.broadcast.to(key).emit('updaterooms', room, 1);
            }
            socket.broadcast.to(room).emit('user-login', socket.user, room);
        }
    });
    socket.on('updateleave', (room) => {
        socket.emit('user-left', room);
        for (key in users) {
            socket.broadcast.to(key).emit('updaterooms', room, -1);
        }
        socket.broadcast.to(room).emit('left', users[socket.id], room);
        socket.leave(room);
        let s = '';
        let m = room.length;
        for (let j = 4; j < m; j++) {
            s += room[j];
        }
        let n1 = parseInt(s);
        roomslist[n1 - 1] = 0;
    });
    socket.on('disconnect', () => {
        let nm = users[socket.id];
        delete users[socket.id];
        let arr = getDetails(io);
        let rn = [], rc = [];
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            rn[i] = arr[i][0];
            rc[i] = arr[i][1].size;
        }
        let m = roomslist.length;
        for (let i = 0; i < m; i++) {
            if (roomslist[i]) {
                let room1 = 'room';
                let n1 = i + 1;
                room1 += n1;
                socket.broadcast.to(room1).emit('disconnected', nm, room1);
            }
        }
        for (let i = 0; i < n; i++) {
            socket.broadcast.to(rn[i]).emit('connection-established', rn, rc);
        }


    });
});


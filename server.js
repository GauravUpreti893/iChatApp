const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { setTimeout } = require('timers/promises');
const io = new Server(server);
const users = {};
app.use('/static', express.static('static'));
app.use(express.urlencoded());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.get('/', function (req, res) {
    res.render('index', {});
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});
let roomslist = [];
io.on('connection', socket => {
    socket.on('new-connection', (newuser, size) => {
        let arr = getDetails(io);
        let rn = [], rc = [];
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            rn[i] = arr[i][0];
            rc[i] = arr[i][1].size;
        }
        socket.emit('connection-established', rn, rc);
        users[socket.id] = newuser;
        socket.user = newuser;
        roomslist = new Array(size).fill(0);
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


const socket = io();

const loginbox = document.getElementById('loginbox');
const innermain = document.getElementById('innermain');
const loginform = document.getElementById('loginform');
const loginbtn = document.getElementById('loginbtn');
const main = document.getElementById('main');
const sidebar = document.getElementById('sidebar');
const chatcontainer = document.getElementById('chatcontainer');
const sendcontainer = document.getElementById('sendcontainer');
const message = document.getElementById('message');
const box = document.getElementsByClassName('box');
const end = document.getElementsByClassName('end');
const activecount = document.getElementsByClassName('activecount');
const gn = document.getElementsByClassName('gn');
const searchgroups = document.getElementById('searchgroups');
const gssubmit = document.getElementById('gssubmit');
const circle = document.getElementsByClassName('circle');
const top1 = document.getElementById('top');
const groupicon = document.getElementById('groupicon');
const groupn = document.getElementById('groupn');
const topinv = document.getElementById('topinv');
const members = document.getElementById('members');
const joinbtn = document.getElementById('joinbtn');
const leavebtn = document.getElementById('leavebtn');
const countmess = document.getElementsByClassName('countmess');
const username = document.getElementById('username');
const password = document.getElementById('password');
const usern = document.getElementById('usern');
const userimg = document.getElementById('userimg');
const beforechat = document.getElementById('beforechat');
const loginsignup = document.getElementById('loginsignup');
const invalidbox = document.getElementById('invalidbox');
const send = document.getElementById('send');
message.disabled = true;
message.placeholder = '';
message.style.cursor = 'not-allowed';
sendcontainer.style.cursor = 'not-allowed';
username.focus();
let hasjoined, flag2 = 0, check = 0, newcount = [], prevpos = [], prevtyped = [], prevroom = 0, prevmessage = -1, check1 = 0, firstjoin = [];
const messagelist = [];
const user = {};
function ignoreFavicon(req, res, next) {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end()
    }
    next();
}

$(window).ready(function () {
    $("#loginform").on("keypress", function (event) {
        var keyPressed = event.keyCode || event.which;
        if (keyPressed === 13) {
            event.preventDefault();
            var $this = $(event.target);
            var index = parseFloat($this.attr('data-index'));
            $('[data-index="' + (index + 1).toString() + '"]').focus();
            return false;
        }
    });
});

function change() {
    let type = loginbtn.innerHTML;
    socket.emit('new-connection', user, box.length, type);
}
function toggle() {
    if (loginsignup.innerHTML == 'Sign in') {
        loginsignup.innerHTML = 'Sign up';
        loginbtn.innerHTML = 'Sign in';
    }
    else {
        loginsignup.innerHTML = 'Sign in';
        loginbtn.innerHTML = 'Sign up';
    }
}
const music = {
    receivesound: new Howl({
        src: ['/static/SOUND/receive sound.mp3']
    }),
    sendsound: new Howl({
        src: ['/static/SOUND/send sound.mp3']
    }),
    joinsound: new Howl({
        src: ['/static/SOUND/joinsound.mp3']
    })
}
function save() {
    let n = topinv.innerHTML;
    prevtyped[n - 1] = message.value;
}
function showhide() {
    main.style.display = "none";
    sidebar.style.display = 'block';
    sidebar.style.width = '100vw';
}
function func(room, n, roomname) {
    if (window.innerWidth <= 888) {
        main.style.display = "block";
        main.style.width = "100vw";
        send.style.width = "100vw";
        message.style.width = "75vw";
        sidebar.style.display = 'none';
        main.style.minHeight = "100vh";
    }
    else
    {
        main.style.display = "block";
        sidebar.style.display = "block";
        main.style.width = "70vw";
        sidebar.style.width = "30vw";
        message.style.width = "55vw";
    }
    let mlist = [];
    let m = box.length;
    let rno = topinv.innerHTML;
    let s2 = 'room';
    s2 += rno;
    for (let i = 0; i < m; i++) {
        box[i].classList.remove('active');
    }
    box[n - 1].classList.add('active');
    if (flag2 == 1) {
        setTimeout(() => {
            box[n - 1].scrollIntoView();
        }, 400);
        flag2 = 0;
    }
    if (message.disabled == true && loginform.style.display == 'none' && check == 0) {
        joinbtn.style.display = 'block';
        const picon = circle[n - 1].innerHTML;
        groupicon.innerHTML = picon;
        groupicon.style.display = 'block';
        members.style.display = 'block';
        const pgn = gn[n - 1].innerHTML;
        groupn.innerHTML = pgn;
        topinv.innerHTML = n;
        message.placeholder = '';
    }
    else if (message.disabled == true && check == 0) {
        box[n - 1].classList.remove('active');
    }
    else {
        const picon = circle[n - 1].innerHTML;
        groupicon.innerHTML = picon;
        groupicon.style.display = 'block';
        groupn.innerHTML = roomname;
        topinv.innerHTML = n;
        if (hasjoined[n - 1] == 1) {
            leavebtn.style.display = 'block';
            joinbtn.style.display = 'none';
            message.disabled = false;
            message.placeholder = 'Type a message';
            message.style.cursor = 'auto';
            sendcontainer.style.cursor = 'pointer';
        }
        else {
            joinbtn.style.display = 'block';
            leavebtn.style.display = 'none';
            message.disabled = true;
            message.placeholder = '';
            message.style.cursor = 'not-allowed';
            sendcontainer.style.cursor = 'not-allowed';
        }
    }
    let k = prevpos[n - 1];
    let n1 = messagelist.length;
    let membermessage;
    let count = 0, flag = 0, c = 0, last = 0;
    for (let i = 0; i < n1; i++) {
        membermessage = messagelist[i].children;
        if (i == prevmessage && room != s2) {
            membermessage[1].innerHTML = 'room0';
            messagelist[i].style.display = 'none';
            prevmessage = -1;
        }
        if (i == k) {
            c = count;
            prevmessage = k;
            if (newcount[n - 1]) {
                if (newcount[n - 1] == 1) {
                    let s = membermessage[0].innerHTML;
                    let len = s.length;
                    s = s.substring(0, len - 1);
                    membermessage[0].innerHTML = newcount[n - 1] + s;
                }
                else
                    membermessage[0].innerHTML = newcount[n - 1] + membermessage[0].innerHTML;
                messagelist[i].style.display = 'flex';
                flag = 1;
            }
            else {
                membermessage[1].innerHTML = 'room0';
                messagelist[i].style.display = 'none';
            }
            prevpos[n - 1] = -1;
            continue;
        }
        if (membermessage[1].innerHTML == room && firstjoin[n - 1]) {
            if (membermessage[0].innerHTML.includes(' UNREAD MESSAGES')) {
                membermessage[1].innerHTML = 'room0';
                messagelist[i].style.display = 'none';
                continue;
            }
            messagelist[i].style.display = 'flex';
            if (i < k)
                mlist.push(i);
            count++;
            last = i;
        }
        else {
            messagelist[i].style.display = 'none';
        }
    }
    if (flag && s2 != room) {
        let sz = mlist.length;
        if (sz == 0) {
            chatcontainer.children[k].scrollIntoView();
        }
        else {
            if (sz == 1) {
                chatcontainer.children[mlist[0]].scrollIntoView();
            }
            else {
                chatcontainer.children[mlist[sz - 2]].scrollIntoView('end');
            }
        }
    }
    else if (count) {
        chatcontainer.children[last].scrollIntoView();
    }
    newcount[n - 1] = 0;
    countmess[n - 1].innerHTML = 0;
    countmess[n - 1].style.display = 'none';
    message.value = prevtyped[n - 1];
    message.focus();
    let s = 'room';
    s += prevroom;
    if (prevroom != 0 && n != prevroom) {
        append(' UNREAD MESSAGES', 'center', 'Admin', s);
    }
    prevroom = n;
    if (check == 0) {
        message.value = '';
        message.placeholder = '';
    }
}

function logic() {
    let room = 'room';
    let n = topinv.innerHTML;
    room += n;
    if (message.disabled == true && loginform.style.display == 'none' && check == 0) {
        socket.emit('new-user-login', user, room);
        let size = box.length;
        hasjoined = new Array(size);
        for (let i = 0; i < size; i++) {
            hasjoined[i] = 0;
        }
        hasjoined[n - 1] = 1;
        check = 1;
    }
    else if (message.disabled == false || check == 1) {
        hasjoined[n - 1] = 1;
        socket.emit('updateroom', room);
    }
    firstjoin[n - 1] = 1;
    message.placeholder = 'Type a message';
    leavebtn.style.display = 'block';
    joinbtn.style.display = 'none';
    message.disabled = false;
    message.focus();
    message.style.cursor = 'auto';
    sendcontainer.style.cursor = 'pointer';
    let n1 = messagelist.length;
    for (let i = 0; i < n1; i++) {
        membermessage = messagelist[i].children;
        if (membermessage[1].innerHTML == room && firstjoin[n - 1]) {
            messagelist[i].style.display = 'flex';
            if (i < k)
                mlist.push(i);
            count++;
            last = i;
        }
        else {
            messagelist[i].style.display = 'none';
        }
    }
}
function leaveroom() {
    let room = 'room';
    let n = topinv.innerHTML;
    room += n;
    socket.emit('updateleave', room);
    hasjoined[n - 1] = 0;
    leavebtn.style.display = 'none';
    joinbtn.style.display = 'block';
    message.disabled = true;
    message.placeholder = '';
    message.style.cursor = 'not-allowed';
    sendcontainer.style.cursor = 'not-allowed';

}

document.addEventListener('submit', (e) => {
    e.preventDefault();
    user.username = username.value;
    user.password = password.value;
    username.value = '';
    password.value = '';
    if (user.username != '' && user.password != '' && check1 == 0) {
        change();
    }
    else if ((user.username == '' || user.password == '') && (check1 == 0)) {
        username.value = user.username;
        password.value = user.password;
        invalidbox.innerHTML = 'Username/Password should be atleast 1 character long.';
        invalidbox.style.opacity = 0.75;
        invalidbox.style.height = '2.7rem';
        setTimeout(() => {
            invalidbox.style.opacity = 0;
        }, 4000);

    }
    const messagev = message.value;
    message.value = '';
    let room1 = 'room';
    let n = topinv.innerHTML;
    prevtyped[n - 1] = '';
    message.focus();
    room1 += n;
    if (messagev != '') {
        append(messagev, 'right', 'You', room1);
        socket.emit('send', messagev, room1);
    }
});

function append(message1, position, name1, room) {
    const newmessage = document.createElement('div');
    const invp = document.createElement('p');
    invp.classList.add('inv');
    invp.innerHTML = room;
    newmessage.classList.add(position);
    if (position == 'center') {
        const newp = document.createElement('p');
        newp.innerHTML = message1;
        newmessage.append(newp);
        newmessage.append(invp);
        if (name1 != 'Admin')
            music.joinsound.play();
        if (name1 == 'Admin') {
            newmessage.classList.add('transparentblock');
        }
        let room1 = 'room';
        let n = topinv.innerHTML;
        room1 += n;
        if (room != room1) {
            newmessage.style.display = 'none';
            let s = '';
            let m = room.length;
            for (let j = 4; j < m; j++) {
                s += room[j];
            }
            let ri = parseInt(s);
            if (name1 != 'Admin')
                newcount[ri - 1]++;
            else
                prevpos[ri - 1] = messagelist.length;
            if (newcount[ri - 1] == 1) {
                countmess[ri - 1].style.display = 'flex';
            }
            countmess[ri - 1].innerHTML = newcount[ri - 1];
        }
        messagelist.push(newmessage);
        newp.classList.add('centermessage');
        chatcontainer.append(newmessage);
        return;
    }
    const newcombine = document.createElement('div');
    const newtop = document.createElement('div');
    const newbottom = document.createElement('div');
    newcombine.classList.add('combine');
    newtop.classList.add('toppart');
    if (name1 == user.username) {
        newtop.innerHTML = 'You';
    }
    else
        newtop.innerHTML = name1;
    newbottom.classList.add('bottompart');
    newbottom.innerHTML = message1;
    newcombine.append(newtop);
    newcombine.append(newbottom);
    newmessage.append(newcombine);
    newmessage.append(invp);
    if (position == 'left') {
        music.receivesound.play();
        newtop.classList.add('rmessaget');
        newbottom.classList.add('rmessageb');
    }
    else if (position == 'right') {
        music.sendsound.play();
        newtop.classList.add('smessaget');
        newbottom.classList.add('smessageb');
    }
    let room1 = 'room';
    let n = topinv.innerHTML;
    room1 += n;
    if (room != room1) {
        newmessage.style.display = 'none';
        let s = '';
        let m = room.length;
        for (let j = 4; j < m; j++) {
            s += room[j];
        }
        let ri = parseInt(s);
        newcount[ri - 1]++;
        if (newcount[ri - 1] == 1) {
            countmess[ri - 1].style.display = 'flex';
        }
        countmess[ri - 1].innerHTML = newcount[ri - 1];
        if (newcount[ri - 1] > 99) {
            countmess[ri - 1].style.fontSize = '11px';
        }
    }
    messagelist.push(newmessage);
    chatcontainer.append(newmessage);
}
function searchgroup() {
    let n = box.length;

    const val = searchgroups.value.toUpperCase();
    let s;
    if (val == '') {
        gssubmit.innerHTML = '<i class="fa-solid fa-magnifying-glass">';
        for (let i = 0; i < n; i++) {
            box[i].style.display = 'flex';
        }
        flag2 = 0;
    }
    else {
        gssubmit.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        flag2 = 1;
    }
    for (let i = 0; i < n; i++) {
        s = gn[i].innerHTML.toUpperCase();
        if (!(s.includes(val))) {
            box[i].style.display = 'none';
        }
        else {
            box[i].style.display = 'flex';
        }
    }

}
async function obfunc() {
    searchgroups.value = '';
    let n = box.length;
    gssubmit.innerHTML = '<i class="fa-solid fa-magnifying-glass">';
    setTimeout(() => {
        for (let i = 0; i < n; i++) {
            box[i].style.display = 'flex';
        }
    }, 400);
}
socket.on('connection-established', (rn, rc) => {
    let roomname;
    let m = box.length;
    let n = rn.length;
    for (let i = 0; i < m; i++) {
        activecount[i].innerHTML = 0;
        end[i].style.display = 'none';
    }
    for (let i = 0; i < n; i++) {
        roomname = rn[i];
        let s = '';
        let m = roomname.length;
        for (let j = 4; j < m; j++) {
            s += roomname[j];
        }
        let ri = parseInt(s);
        activecount[ri - 1].innerHTML = rc[i];
        end[ri - 1].style.display = 'block';
    }
});
socket.on('updaterooms', (room, plus) => {
    let s = '';
    let m = room.length;
    for (let j = 4; j < m; j++) {
        s += room[j];
    }
    let ri = parseInt(s);
    let x = activecount[ri - 1].innerHTML;
    x = parseInt(x);
    if (x == 0) {
        end[ri - 1].style.display = 'block';
    }
    x += plus;
    if (x == 0) {
        end[ri - 1].style.display = 'none';
    }
    activecount[ri - 1].innerHTML = x;
});
socket.on('user-login', (newuser, room) => {
    append(`${newuser.username} joined the room.`, 'center', newuser.username, room);
});
socket.on('recieve', (detail, room) => {
    append(`${detail.message}`, 'left', detail.user.username, room);
});
socket.on('disconnected', (name, room) => {
    append(`${name.username} left the server.`, 'center', name.username, room);
});
socket.on('user-left', (room) => {
    let s = '';
    let m = room.length;
    for (let j = 4; j < m; j++) {
        s += room[j];
    }
    let ri = parseInt(s);
    let x = activecount[ri - 1].innerHTML;
    x = parseInt(x);
    if (x > 0)
        x--;
    if (x == 0) {
        end[ri - 1].style.display = 'none';
    }
    activecount[ri - 1].innerHTML = x;
    append('You left the room', 'center', 'You', room);
})
socket.on('left', (name, room) => {
    append(`${name.username} left the room.`, 'center', name.username, room);
});
socket.on('newjoin', (room) => {

    let s = '';
    let m = room.length;
    for (let j = 4; j < m; j++) {
        s += room[j];
    }
    let ri = parseInt(s);
    let x = activecount[ri - 1].innerHTML;
    if (x == 0) {
        end[ri - 1].style.display = 'block';
    }
    x++;
    activecount[ri - 1].innerHTML = x;
    append('You joined the room', 'center', 'You', room);
});
socket.on('successful-connection', (prevmessages) => {
    loginbox.style.height = '0';
    innermain.style.height = '95.8vh';
    loginform.style.display = 'none';
    chatcontainer.style.height = '79.3vh';
    searchgroups.focus();
    let m = box.length;
    newcount = new Array(m).fill(0);
    prevpos = new Array(m).fill(-1);
    firstjoin = new Array(m).fill(0);
    prevtyped = new Array(m).fill('');
    usern.innerHTML = user.username;
    userimg.style.display = 'block';
    top1.style.display = 'flex';
    beforechat.style.height = '80vh';
    loginsignup.style.display = 'none';
    loginsignup.style.animationIterationCount = 0;
    check1 = 1;
    let n = prevmessage.length;
    for (let i = 0; i < n; i++) {
        append(prevmessages[i].message, prevmessages[i].position, prevmessages[i].username, prevmessages[i].room);
    }
});
socket.on('unsuccessful-connection', (type) => {
    if (type == 'Sign in') {
        invalidbox.innerHTML = 'Invalid Username/Password';
        invalidbox.style.width = '12rem';
        invalidbox.style.height = '2rem';
        invalidbox.style.left = '47.5%';
    }
    else if (type == 'Sign up') {
        invalidbox.innerHTML = 'Username already exists';
        invalidbox.style.height = '2rem';
        invalidbox.style.width = '12rem';
        invalidbox.style.left = '47.5%';
    }
    else if (type == 'multiplesignin') {
        invalidbox.innerHTML = 'Multiple login with same username is not allowed.';
        invalidbox.style.height = '2rem';
        invalidbox.style.width = '12rem';
        invalidbox.style.left = '47.5%';
    }
    invalidbox.style.opacity = 0.75;
    setTimeout(() => {
        invalidbox.style.opacity = 0;
    }, 4000);
});

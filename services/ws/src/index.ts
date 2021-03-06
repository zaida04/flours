import express from 'express';
import * as socketio from 'socket.io';
import {Server} from 'http';
import {Room} from '@flours/common';
import {connect} from 'mongoose';

connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();
const server = new Server(app);
const io = new socketio.Server(server, {
    allowUpgrades: false,
    pingTimeout: 21474836,
    transports: ['websocket'],
});

app.get('/', (req, res) => {
    res.send('Yes!');
});

io.on('connection', socket => {
    socket.on('user-joined', async (roomID: string, userID: string) => {
        if (!roomID || !userID) return;
        const room = await Room.findOne({id: roomID});
        if (!room) return socket.disconnect(true);

        socket.join(roomID);
        socket.to(roomID).emit('user-joined', {userID});

        room.users.push(userID);
        await room.save();
        return undefined;
    });
    socket.on('user-left', async (roomID: string, userID: string) => {
        if (!roomID || !userID) return;
        const room = await Room.findOne({id: roomID});
        if (!room) return socket.disconnect(true);

        socket.join(roomID);
        socket.to(roomID).emit('user-left', {userID});

        room.users = room.users.filter(x => x !== userID);
        await room.save();
        return undefined;
    });
});

server.listen(process.env.PORT, () => {
    console.log('WS server up!');
});

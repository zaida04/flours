import express from 'express';
import expressSession from 'express-session';
import {v4} from 'uuid';
import * as bcrypt from 'bcrypt';
import {sign} from 'jsonwebtoken';
import {body} from 'express-validator';
import routeValidator from './util';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

['PORT', 'JWT_KEY', 'MONGO_URI'].forEach(x => {
    if (!process.env[x]) throw new Error(`Missing ENV var ${x}!`);
});

mongoose
    .connect(process.env.MONGO_URI!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

import {Room, IRoom} from '@flours/common';
declare module 'express-session' {
    interface SessionData {
        user: {
            id: string;
        };
        room: IRoom;
    }
}

const app = express();
app.use(express.urlencoded()); // HTML FORMS
app.use(express.json());
app.use(
    expressSession({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: true},
    })
);
app.use(bodyParser());
app.use(cookieParser());
app.use(compression());
const api = express.Router();
const rooms = express.Router();

api.get('/', (req, res) => res.json({response: 'test!'}));
rooms
    .route('/')
    .get(async (_, res) => {
        const rooms = await Room.find({closed: false});
        return res.status(200).json(rooms);
    })
    .post(
        routeValidator(
            body('name', 'Must supply a room name.')
                .notEmpty()
                .isString()
                .isLength({max: 30})
                .trim()
        ),
        async (req, res) => {
            const {name} = req.body;

            const existingRoom = await Room.findOne({
                closed: false,
                creator: req.session.user!.id,
            });

            if (existingRoom) {
                return res.status(400).json({
                    code: 'ALREADY_HAS_ROOM',
                    message:
                        'You already have a room created under this account. Please close this existing room first before creating a new one.',
                    status: 400,
                });
            }

            const newRoom = new Room({
                closed: false,
                creator: req.session.user!.id,
                id: v4(),
                name,
                users: [],
            });

            await newRoom.save();
            return res.json(newRoom);
        }
    );

rooms.use('/:roomID', async (req, res, next) => {
    const {roomID} = req.params;

    const room = await Room.findOne({id: roomID});
    if (!room) {
        return res.status(404).json({
            code: 'ROOM_NOT_FOUND',
            message: 'A room with that ID is not found.',
            status: 404,
        });
    }

    req.session.room = room;
    return next();
});

rooms
    .route('/:roomID')
    .get(async (req, res) => res.status(200).json(req.session.room))
    .put(async (req, res) => {});

api.use('/rooms', rooms);
app.use('/api', api);
app.use((_, res, __) =>
    res.status(404).json({
        code: 'ERR_NOT_FOUND',
        message: 'No page found with that route!',
        status: 404,
    })
);

app.listen(process.env.PORT, async () => {
    console.log(`DB status: ${mongoose.connection.readyState}`);
    console.log(`Server listening on port ${process.env.PORT}`);
});

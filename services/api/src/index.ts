import express from "express";
import expressSession from "express-session";
import { v4 } from "uuid";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { connectToDB, Account, Room, IRoom } from "@flours/common";

declare module "express-session" {
    interface SessionData {
        user: {
            id: string;
        };
        room: IRoom;
    }
}

["MONGO_USERNAME", "MONGO_PASS", "MONGO_HOST", "MONGO_DB", "PORT", "JWT_KEY"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing ENV var ${x}!`);
});

const app = express();
const api = express.Router();
const accounts = express.Router();
const rooms = express.Router();

api.get("/", (req, res) => res.json({ response: "test!" }));

accounts.post("/signup", async (req, res) => {
    const { email, username, password } = req.body;

    // get existing account record
    const existingAccount = await Account.findOne({ email });

    // if account exist, reject
    if (existingAccount) {
        return res.status(409).send({
            error: "USER_ALREADY_EXISTS",
            message: "User with that email or username already exists!",
            status: 409,
        });
    }

    // user ID
    const id = v4();

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    // create the user JWT
    const token = sign({ id }, process.env.JWT_KEY);

    // insert user into database
    const newUser = new Account({
        email,
        id,
        password: hashedPassword,
        token,
        username,
    });

    await newUser.save();
    return res.status(200).send({ token });
});

accounts.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const checkIfUserExists = await Account.findOne({ username });

    if (!checkIfUserExists) {
        return res.status(404).send({
            error: "USER_NOT_FOUND",
            message: "User with that username does not exist!",
            statusCode: 404,
        });
    }

    // compare hashed password to supplied password
    if (!(await bcrypt.compare(password, checkIfUserExists.password))) {
        return res.status(401).send({
            error: "INCORRECT_PASSWORD",
            message: "Invalid username/password!",
            statusCode: 401,
        });
    }

    // create the user JWT
    const token = sign({ id: checkIfUserExists.id }, process.env.JWT_KEY);
    return res.status(200).send({ token });
});

accounts.get("/:userID", async (req, res) => {
    const { userID } = req.params;

    const user = await Account.findOne({ id: userID });
    if (!user) {
        return res.status(404).json({
            code: "USER_NOT_FOUND",
            message: "A user with that ID is not found.",
            status: 404,
        });
    }

    user.password = "nope";
    return res.status(200).json(user);
});

rooms
    .route("/")
    .get(async (_, res) => {
        const rooms = await Room.find({ closed: false });
        return res.status(200).json(rooms);
    })
    .post(async (req, res) => {
        const { name } = req.body;

        const existingRoom = await Room.findOne({
            closed: false,
            creator: req.session.user!.id,
        });

        if (existingRoom) {
            return res.status(400).json({
                code: "ALREADY_HAS_ROOM",
                message: "You already have a room created under this account. Please close this existing room first before creating a new one.",
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
    });

rooms.use("/:roomID", async (req, res, next) => {
    const { roomID } = req.params;

    const room = await Room.findOne({ id: roomID });
    if (!room) {
        return res.status(404).json({
            code: "ROOM_NOT_FOUND",
            message: "A room with that ID is not found.",
            status: 404,
        });
    }

    req.session.room = room;
    return next();
});

rooms
    .route("/:roomID")
    .get(async (req, res) => res.status(200).json(req.session.room))
    .put(async (req, res) => {});

api.use("/rooms", rooms);
api.use("/accounts", accounts);
app.use("/api", api);
app.use((_, res, __) =>
    res.status(404).json({
        code: "ERR_NOT_FOUND",
        message: "No page found with that route!",
        status: 404,
    }),
);

(async () => {
    await connectToDB({
        db: process.env.MONGO_DB,
        host: process.env.MONGO_HOST,
        password: process.env.MONGO_PASS,
        username: process.env.MONGO_USERNAME,
    });

    app.listen(process.env.PORT, () => {
        console.log(`Server listening on port ${process.env.PORT}`);
    });
})();

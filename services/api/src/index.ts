import express from "express";
import expressSession from "express-session";

declare module "express-session" {
    interface SessionData {
        user: {
            id: string
        }
    }
}

const app = express();
const api = express.Router();

api.get("/", (req, res) => {
    return res.json({ response: "test!" })
})

app.use("/api", api);
app.use((_, res, __) => {
    return res.status(404).json({
        "message": "No page found with that route!",
        "code": "ERR_NOT_FOUND",
        "status": 404
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})
import express from "express";
import homeController from "../controller/homeController";
let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage)
    router.get("/ahihi", (req, res) => {
        return res.send("Ahihi bro");
    })
    return app.use("/", router);
}

module.exports = initWebRoutes;
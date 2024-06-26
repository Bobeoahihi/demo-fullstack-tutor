import db from '../models/index';
import CRUDService from '../service/CRUDService';
import userService from "../service/userService"
let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter'
        })
    }

    let userData = await userService.handleUserLogin(email, password);
    //check email exist
    //Check password
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : { 'a': "Not have info" }
    })
}
let handleGetAllUsers = async (req, res) => {
    let id = req.query.id; //ALL or ID
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing parameters',
            users: []
        })
    }
    let users = await userService.getAllUsers(id)
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users
    })
}

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message);
}

let handleDeleteNewUser = async (req, res) => {
    if (!req.body.id) {
        return removeEventListener.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter'
        })

    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}
let handleEditNewUser = async (req, res) => {
    let data = req.body;
    let message = await userService.updateUserData(data)
    return res.status(200).json(message)
}

let getAllcode = async (req, res) => {
    try {

        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch (e) {
        console.log("Get all code error: ", e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }

}

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleDeleteNewUser: handleDeleteNewUser,
    handleEditNewUser: handleEditNewUser,
    getAllcode: getAllcode,
}
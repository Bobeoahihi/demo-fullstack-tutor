import patientService from '../service/patientService'
let postBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.getProfileDoctorById(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let postVerifyBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postVerifyBookAppointment(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let createNewPatient = async (req, res) => {
    try {
        let infor = await patientService.createNewPatient(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let handlePatientLogin = async (req, res) => {
    try {
        let infor = await patientService.handlePatientLogin(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getPatientById = async (req, res) => {
    try {
        let infor = await patientService.getPatientById(req.query.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let handleEditPatient = async (req, res) => {
    try {
        let infor = await patientService.handleEditPatient(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getAllBookingHistory = async (req, res) => {
    try {
        let infor = await patientService.getAllBookingHistory(req.query.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}


module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    createNewPatient: createNewPatient,
    handlePatientLogin: handlePatientLogin,
    getPatientById: getPatientById,
    handleEditPatient: handleEditPatient,
    getAllBookingHistory: getAllBookingHistory,
}
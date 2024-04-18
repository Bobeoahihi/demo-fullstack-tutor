import db from '../models/index'
import emailService from './emailService'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}
let getProfileDoctorById = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date
                || !data.fullName || !data.timeString || !data.selectedGender
                || !data.address
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let token = uuidv4()
                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                })
                //upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        address: data.address,
                        gender: data.selectedGender,
                        firstName: data.fullName,
                        phonenumber: data.phoneNumber
                    },
                })
                // create a booking record
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: user[0].id },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token
                        }
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save patient success'
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}
let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointmnet = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointmnet) {
                    await appointmnet.update({
                        statusId: 'S2'
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'Update appointment succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment has been activated or does not exist'
                    })
                }
            }
        } catch (e) {
            reject(e)
        }
    })
}
let handlePatientLogin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.password) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let userData = {};
                let isExit = await checkUserEmail(data.email);
                if (isExit) {
                    //user already exits
                    let user = await db.User.findOne({
                        where: { email: data.email },
                        attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName', 'phonenumber', 'gender', 'image', 'address'],
                        raw: true,

                    })
                    if (user.image) {
                        let image = new Buffer(user.image, 'base64').toString('binary')
                        user.image = image
                    }
                    if (user) {
                        if (user.roleId !== 'R3') {
                            userData.errCode = 2;
                            userData.errMessage = "User's not found"
                            resolve(userData)

                        }
                        let check = await bcrypt.compareSync(data.password, user.password);
                        if (check) {
                            userData.errCode = 0;
                            userData.errMessage = 'Ok';
                            delete user.password;
                            userData.user = user;

                        } else {
                            userData.errCode = 3;
                            userData.errMessage = 'Wrong password';
                        }
                    } else {
                        userData.errCode = 2;
                        userData.errMessage = "User's not found"

                    }


                } else {
                    userData.errCode = 1;
                    userData.errMessage = "Your's email isn't exist in your system. Pls try other email!"

                }
                resolve(userData)
            }
        } catch (e) {
            reject(e)
        }
    })
}
let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e)
        }
    })
}
let createNewPatient = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.password || !data.firstName
                || !data.lastName || !data.phonenumber || !data.gender
                || !data.address) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                //check email is exist?
                let check = await checkUserEmail(data.email);
                if (check === true) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Your email is already in used, pls try another email!'
                    })
                } else {
                    let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                    await db.User.create({
                        email: data.email,
                        password: hashPasswordFromBcrypt,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        address: data.address,
                        phonenumber: data.phonenumber,
                        gender: data.gender,
                        roleId: 'R3',
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'OK'
                    });
                }
            }

        } catch (e) {
            reject(e)
        }
    })

}
let getPatientById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let patient = await db.User.findOne({
                    where: { id: inputId },
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName', 'phonenumber', 'gender', 'image', 'address'],
                    raw: true,
                })
                if (!patient) {
                    patient = {}
                } else {
                    if (patient.image) {
                        let image = new Buffer(patient.image, 'base64').toString('binary')
                        patient.image = image
                    }
                }
                resolve({
                    errCode: 0,
                    patient,
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}
let handleEditPatient = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing required parameter"
                })
            }
            let user = await db.User.findOne({
                where: {
                    id: data.id,
                },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if (data.avatar) {
                    user.image = data.avatar;
                }
                await user.save()
                // await db.User.save({
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address
                // })
                resolve({
                    errCode: 0,
                    message: 'Update patient succeeds!',
                    user,
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: `Patient's not found!`
                });
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getAllBookingHistory = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let dataHistory = {}
            if (!inputId) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        patientId: inputId,
                    },
                    attributes: ['statusId', 'doctorId', 'date', 'timeType'],
                    include: [
                        {
                            model: db.User, as: 'doctorDataBooking',
                            attributes: ['email', 'firstName', 'address', 'gender', 'lastName'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Doctor_infor, attributes: ['addressClinic', 'nameClinic'] },
                            ],
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'],

                        },
                        {
                            model: db.Allcode, as: 'statusAppointment', attributes: ['valueEn', 'valueVi'],

                        },

                    ],
                    raw: false,
                    nest: true,

                })
                if (!data) data = {}
                resolve({
                    errCode: 0,
                    data,
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    getProfileDoctorById: getProfileDoctorById,
    postVerifyBookAppointment: postVerifyBookAppointment,
    createNewPatient: createNewPatient,
    handlePatientLogin: handlePatientLogin,
    getPatientById: getPatientById,
    handleEditPatient: handleEditPatient,
    getAllBookingHistory: getAllBookingHistory,
}
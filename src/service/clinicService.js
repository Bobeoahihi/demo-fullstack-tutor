const db = require("../models")
const { getDetailSpecialtyById } = require("./specialtyService")
let createClinic = (data) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!data.descriptionHTML || !data.descriptionMarkdown
                || !data.name || !data.address) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({
                // attributes: {
                //     exclude: ['image']
                // }
            });
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary')
                    return item
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'OK',
                data: data
            })
        } catch (e) {
            reject(e)
        }
    })
}

let getDetailClinicById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown']
                })
                if (data) {
                    let doctorClinic = await db.Doctor_infor.findAll({
                        where: {
                            clinicId: inputId,
                        },
                        attributes: ['doctorId', 'provinceId']
                    })
                    data.doctorClinic = doctorClinic ? doctorClinic : []
                } else {
                    data = {}
                }
                resolve({
                    errMessage: 'Ok',
                    errCode: 0,
                    data
                })

            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
}
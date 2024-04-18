const { truncate } = require("lodash")
const db = require("../models")

let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown || !data.name) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
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
let getAllSpecialty = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({
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
let getDetailSpecialtyById = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown']
                })
                if (data) {
                    let doctorSpecialty = []
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctor_infor.findAll({
                            where: {
                                specialtyId: inputId,
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        //find by location
                        doctorSpecialty = await db.Doctor_infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }
                    data.doctorSpecialty = doctorSpecialty
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
let handleEditSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!data.id || !data.descriptionHTML || !data.descriptionMarkdown || !data.name) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter haah'
                })
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: data.id },
                    raw: false,
                })
                if (specialty) {
                    specialty.name = data.name;
                    specialty.descriptionHTML = data.descriptionHTML;
                    specialty.descriptionMarkdown = data.descriptionMarkdown;
                    if (data.imageBase64) {
                        specialty.imageBase64 = data.imageBase64;
                    }
                    specialty.save()
                    resolve({
                        errCode: 0,
                        errMessage: 'OK'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Specialty is not found!'
                    })
                }

            }
        } catch (e) {
            reject(e)
        }
    })
}
let handleDeleteSpecialty = (inputId) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: inputId },
                })
                if (specialty) {
                    await db.Specialty.destroy({
                        where: { id: inputId }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'OK'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Specialty is not found!'
                    })
                }

            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById, getDetailSpecialtyById,
    handleEditSpecialty: handleEditSpecialty,
    handleDeleteSpecialty: handleDeleteSpecialty,
}
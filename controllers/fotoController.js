// import model
Foto = require('../models/foto')

// Handle index actions
exports.index = async function (req, res) {
    await Foto.get(async function (err, fotos) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            })
        }
        res.json({
            status: "success",
            message: "Fotos retrieved successfully",
            data: fotos
        })
    })
}
// Handle create Foto actions
exports.new = async function (req, res) { 
    let foto = new Foto()
    foto.name = req.body.name
// save the Foto and check for errors
    try{    
        let newFoto = await foto.save()
        res.json({
            message: 'New Foto created!' + err,
            data: newFoto})
    } catch (err) {
        res.json(err)
    }
}
// Handle view foto info
exports.view = async function (req, res) {
    await Foto.findById(req.params.id, async function (err, foto) {
        if (err) {
            res.send(err)
        }
        res.json({
            message: 'Foto details loading..',
            data: foto
        })
    })
}
// Handle update Foto info
exports.update = async function (req, res) {
    await Foto.findById(req.params.id, async function (err, foto) {
        if (err){
            res.send(err)
        }
        foto.name = req.body.name ? req.body.name : foto.name
        foto.likes = req.body.likes ? req.body.likes : foto.likes
        foto.readyThumb = req.body.readyThumb ? req.body.readyThumb : foto.readyThumb
        foto.readyPrint = req.body.readyPrint ? req.body.readyPrint : foto.readyPrint
        foto.requestedPrint = req.body.requestedPrint ? req.body.requestedPrint : foto.requestedPrint
        foto.available = req.body.available ? req.body.available : foto.available
// save the Foto and check for errors
        foto.save(async function (err) {
            if (err) {
                res.json(err)
            }
            res.json({
                message: 'Foto Info updated',
                data: foto
            })
        })
    })
}
// Handle delete Foto
exports.delete = async function (req, res) {
    await Foto.remove({
        name: req.params.name
    }, async function (err, foto) {
        if (err) {
            res.send(err)
        }
        res.json({
            status: "success",
            message: 'Foto deleted'
        })
    })
}
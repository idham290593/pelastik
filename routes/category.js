
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const q = require("q");



router.post("/addcategory", (req, res) => {
    //ambil header

    var main = req.body.main ? req.body.main : [];
    var sub = req.body.sub ? req.body.sub : [];

    Category.findOne({ main: main })
        .then(data => {
            if (data == null) {

                const newItem = new Category({
                    main: main,
                });
                newItem
                    .save()
                    .then(item => {
                        item.updateOne({ $push: { sub: { name: sub } } })
                            .then(item => {
                                res.json({ message: "berhasil" })

                            })
                            .catch(err => {
                                console.log(err)
                                res.json({ message: "failed" })
                            });


                    })
                    .catch(err => {
                        console.log(err)
                        res.json({ message: "failed" })
                    });
            } else {
                if (data.sub.some(o => o.name === sub)) {
                    res.json({ message: "value found" })
                } else {
                    data.updateOne({ $push: { sub: { name: sub } } })
                        .then(item => {
                            res.json({ message: "berhasil" })

                        })
                        .catch(err => {
                            console.log(err)
                            res.json({ message: "failed" })
                        });
                }


            }

        })
        .catch(err => {
            res.json({ message: "error" })
        })
});



router.post("/editsubcategory", (req, res) => {
    const axios = require('axios')

    var id = req.body.id;
    var name = req.body.name


    Category.findOneAndUpdate({ 'sub._id': id }, {
        '$set': {
            'sub.$.name': name
        }
    })
        .then(then => res.json({ message: "succeed" }))
        .catch(err => {
            console.log(err)
            res.json(err)
        })

});

router.post("/editcategory", (req, res) => {
    const axios = require('axios')

    var id = req.body.id;
    var name = req.body.name


    Category.findOne({ _id: id })
        .then(then => {
            then.updateOne({ $set: { main: name } })
                .then(item => {
                    res.json({ message: "berhasil" })

                })
                .catch(err => {
                    console.log(err)
                    res.json({ message: "failed" })
                });
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })

});



router.post("/removesubcategory", (req, res) => {
    //ambil header
    const id1 = req.body.idcategory ? req.body.idcategory : "";
    const id2 = req.body.idsub ? req.body.idsub : "";

    Category.findOneAndUpdate({ _id: id1 }, { $pull: { sub: { _id: id2 } } })
        .then(hasil => {
            res.json({ message: "berhasil" })
        })
        .catch(err => res.json({ message: "berhasil" }))
});


router.delete("/delete", (req, res) => {
    var id = req.query.id ? req.query.id : "";
    if (id == "") {
        return res.json({ id: "not found" })
    }
    Category.findOne({
        _id: req.query.id
    })
        .then(item => item.remove().then(() => res.json({ message: "succeed" })))
        .catch(err => res.status(404).json({ err }));
});




router.get("/find", (req, res) => {
    //ambil header

    Category.find({})

        .then(item => {
            res.json(item);
            // console.log(item);
        })
        .catch(err => {
            console.log(err)
            // res.json({ message: "failed" })
            res.json(err)

        });


});



router.post("/findcek", (req, res) => {
    //ambil header
    var desc = req.body.desc ? req.body.desc : "";
    var arraydesc = desc.trim().split(" ");

    Category.find({ sub: { $in: arraydesc } })

        .then(item => {
            res.json(item);
            // console.log(item);
        })
        .catch(err => {
            console.log(err)
            // res.json({ message: "failed" })
            res.json(err)

        });


});




module.exports = router;
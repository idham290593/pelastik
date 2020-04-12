const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Load Item and User Model
const Item = require("../models/Item");
const User = require("../models/User");

var email = require("../node_modules/emailjs/email");

var server = email.server.connect({
  user: "iot@mapid.co.id",
  password: "ILoveIotMapid2019",
  host: "smtp.migadu.com",
  port: 587,
  authentication: ["PLAIN", "LOGIN", "CRAM-MD5", "XOAUTH2"],
  domain: "mapid.co.id",
  timeout: 30000,
  tls: { tls: "starttls" }
});

// @route   GET /api/test
// @desc    Tests api route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "API Works" }));

// @route   GET /api/update
// @desc    Device update to server
// @access  Public
router.get("/update", (req, res, next) => {
  console.log("Receive update request");
  // Get values from request arguments
  var apiKey = req.query.key;
  delete req.query.key;
  // flush api key value so we only keep values concerning variables
  var updateQuery = {};
  var last_query = {};
  var buffer_query = {};
  var buffer = {};
  // Find dataset by write API key
  Item.findOne({ write_key: apiKey })
    .select({ log_data: 0 })
    .populate("user")
    .exec(function(err, item) {
      if (err) {
        console.log("Database error");
        res.sendStatus(404);
      } else {
        var quota = item.user.quota ? item.user.quota : 10000;
        if (quota - item.user.total_calls <= 0) {
          console.log("habis");
          res.status(400).json({ msg: "Maaf, kuota API anda telah habis" });
        } else {
          //Item not null
          if (item != null) {
            User.findOne({ name: item.user.name }, function(err, user) {
              if (err) {
                console.log("user problem");
                res.sendStatus(404);
              } else {
                user.updateOne(
                  {
                    $inc: { total_calls: 1 }
                  },
                  err => {
                    if (err) {
                      console.log("user total calls error");
                      res.sendStatus(404);
                    } else {
                      if (item != null) {
                        //Notification
                        if (!item.isNotif) {
                          console.log("tanpa message");
                          // res.sendStatus(200);
                        } else {
                          for (var property in req.query) {
                            if (
                              req.query.hasOwnProperty(property) &
                              item.last_data.hasOwnProperty(property)
                            ) {
                              var last_data = item.last_data;
                              var varData = last_data[property];
                              var notif = varData.notif;
                              var min = varData.nMin;
                              var max = varData.nMax;
                              var name = varData.name;
                              var unit = varData.unit;
                              if (notif) {
                                if (parseFloat(req.query[property]) < min) {
                                  //Kurang dari
                                  server.send(
                                    {
                                      text: `Your device exceeds the minimum limit: ${name} : ${
                                        req.query[property]
                                      } ${unit} `,
                                      from: "iotMapid <iot@mapid.co.id>",
                                      to: item.user.email,
                                      subject: "Mapid Notification"
                                    },
                                    function(err, message) {
                                      if (err) {
                                        console.log(err);
                                        // return res.sendStatus(404);
                                      }
                                      console.log("min email");
                                      // return res.sendStatus(200);
                                    }
                                  );
                                } else if (
                                  parseFloat(req.query[property]) > max
                                ) {
                                  //Lebih dari
                                  server.send(
                                    {
                                      text: `Your device exceeds the maximum limit: ${name} : ${
                                        req.query[property]
                                      } ${unit} `,
                                      from: "iotMapid iot@mapid.co.id",
                                      to: item.user.email,
                                      subject: "Mapid Notification"
                                    },
                                    function(err, message) {
                                      if (err) {
                                        console.log(err);
                                        // return res.sendStatus(404);
                                      }
                                      console.log("ada yang max email");
                                      // return res.sendStatus(200);
                                    }
                                  );
                                } else {
                                  console.log("ada yang tanpa message");
                                  // res.sendStatus(200);
                                }
                              }
                            }
                          }
                        }
                        //Data log
                        for (var property in req.query) {
                          if (
                            req.query.hasOwnProperty(property) &
                            item.last_data.hasOwnProperty(property)
                          ) {
                            updateQuery["log_data." + property + ".values"] = [
                              parseFloat(req.query[property]),
                              Date.now()
                            ];
                          }
                        }
                        //Data realtime ke geo
                        for (var property in req.query) {
                          if (
                            req.query.hasOwnProperty(property) &
                            item.last_data.hasOwnProperty(property)
                          ) {
                            last_query["last_data." + property + ".values"] = [
                              parseFloat(req.query[property])
                            ];
                          }
                        }
                        //Buffer, ambil 100 data terakhir
                        if (item.buffer_data.var1.values.length < 500) {
                          for (var property in req.query) {
                            if (
                              req.query.hasOwnProperty(property) &
                              item.last_data.hasOwnProperty(property)
                            ) {
                              buffer_query[
                                "buffer_data." + property + ".values"
                              ] = [parseFloat(req.query[property]), Date.now()];
                              //merge
                              var buffer_data = item.buffer_data;
                              var varData = buffer_data[property];
                              var values = varData.values;
                              buffer[
                                "buffer_data." + property + ".values"
                              ] = values;
                              buffer[
                                "buffer_data." + property + ".values"
                              ].push(
                                buffer_query[
                                  "buffer_data." + property + ".values"
                                ]
                              );
                            }
                          }
                        } else {
                          for (var property in req.query) {
                            if (
                              req.query.hasOwnProperty(property) &
                              item.last_data.hasOwnProperty(property)
                            ) {
                              buffer_query[
                                "buffer_data." + property + ".values"
                              ] = [parseFloat(req.query[property]), Date.now()];
                              var buffer_data = item.buffer_data;
                              var varData = buffer_data[property];
                              var values = varData.values;
                              //slice potong elemen paling awal
                              buffer[
                                "buffer_data." + property + ".values"
                              ] = values.slice(1, 100);
                              //merge tambah nilai query ke elemen terakhir
                              buffer[
                                "buffer_data." + property + ".values"
                              ].push(
                                buffer_query[
                                  "buffer_data." + property + ".values"
                                ]
                              );
                            }
                          }
                        }
                        item.updateOne(
                          {
                            $push: updateQuery,
                            $set: { ...buffer, ...last_query },
                            $inc: { entries_number: 1 },
                            last_entry_at: Date.now()
                          },
                          err => {
                            if (err) {
                              console.log("item error");
                              res.sendStatus(404);
                            } else {
                              res.sendStatus(200);
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            });
          }
          //Item null
          else {
            console.log("item not found");
            res.sendStatus(404);
          }
        }
      }
    });
});

// @route   GET /api/request
// @desc    Sending json data to FLOW or GEO
// @access  Public
router.get("/request", function(req, res) {
  // Get values from request arguments
  var apiKey = req.query.key;
  Item.findOne({ read_key: apiKey })
    .select({ name: 1, last_data: 1, username: 1 })
    .then(items => res.json(items));
});

// Copy dari name, unit, values log_data ke buffer_data

// router.get("/buffer/:id", function(req, res) {
//   // Get values from request arguments
//   Item.findOne({ _id: req.params.id }).exec(function(err, item) {
//     if (err) {
//       console.log("user problem");
//       res.sendStatus(404);
//     } else {
//       var buffer = {};
//       for (var property in item.log_data) {
//         if (item.log_data.hasOwnProperty(property)) {
//           //merge
//           var buffer_data = item.log_data;
//           var varData = buffer_data[property];
//           var name = varData.name;
//           var unit = varData.unit;
//           buffer["buffer_data." + property + ".values"] = [];
//           buffer["buffer_data." + property + ".name"] = name;
//           buffer["buffer_data." + property + ".unit"] = unit;
//         }
//       }

//       item.updateOne(
//         {
//           $set: buffer
//         },
//         err => {
//           if (err) {
//             console.log("item error");
//             res.sendStatus(404);
//           } else {
//             console.log("sukses");
//             res.sendStatus(200);
//           }
//         }
//       );
//     }
//   });
// });

// Copy dari name, unit, values log_data ke last_data

// router.get("/last/:id", function(req, res) {
//   // Get values from request arguments
//   Item.findOne({ _id: req.params.id }).exec(function(err, item) {
//     if (err) {
//       console.log("user problem");
//       res.sendStatus(404);
//     } else {
//       var last = {};
//       for (var property in item.log_data) {
//         if (item.log_data.hasOwnProperty(property)) {
//           //merge
//           var last_data = item.log_data;
//           var varData = last_data[property];
//           var name = varData.name;
//           var unit = varData.unit;
//           last["last_data." + property + ".values"] = [];
//           last["last_data." + property + ".name"] = name;
//           last["last_data." + property + ".unit"] = unit;
//         }
//       }

//       item.updateOne(
//         {
//           $set: last
//         },
//         err => {
//           if (err) {
//             console.log("item error");
//             res.sendStatus(404);
//           } else {
//             console.log("sukses");
//             res.sendStatus(200);
//           }
//         }
//       );
//     }
//   });
// });

// //Coba tambah user id ke item

// router.get("/user/:id", function(req, res) {
//   // Get values from request arguments
//   Item.findOne({ _id: req.params.id }).exec(function(err, item) {
//     if (err) {
//       console.log("user problem");
//       res.sendStatus(404);
//     } else {
//       User.findOne({ name: item.username }, function(err, user) {
//         if (err) {
//           console.log("user problem");
//           res.sendStatus(404);
//         } else {
//           item.updateOne(
//             {
//               user: user._id
//             },
//             err => {
//               if (err) {
//                 console.log("item error");
//                 res.sendStatus(404);
//               } else {
//                 console.log("sukses");
//                 res.sendStatus(200);
//               }
//             }
//           );
//         }
//       });
//     }
//   });
// });

module.exports = router;

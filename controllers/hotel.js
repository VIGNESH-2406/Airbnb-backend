import Hotel from "../models/hotel";
import Order from "../models/order";
import fs from "fs";

export const create = async (req, res) => {
  //   console.log("req.fields", req.fields);
  // console.log("req.files", req.files);
  try {
    let fields = req.fields;
    let files = req.files;
    console.log(typeof files);
    let hotel = new Hotel(fields);
    hotel.postedBy = req.user._id;
    // handle image
    if (files.image) {
      hotel.image = files.image.map((img) => ({
        name: img.name,
        data: fs.readFileSync(img.path),
        contentType: img.type,
      }));
    }

    hotel.save((err, result) => {
      if (err) {
        console.log("saving hotel err => ", err);
        res.status(400).send("Error saving");
      }
      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
};

export const hotels = async (req, res) => {
  // let all = await Hotel.find({ from: { $gte: new Date() } })
  let all = await Hotel.find({})
    .limit(24)
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  const userOrders = await Order.find({}).select("hotel").exec();
  // console.log(userOrders);
  // console.log(all);
  const booked = userOrders.map((h) => h.hotel.toString());
  console.log(booked[0]);
  console.log(booked.includes(all[0]._id));
  const nonBooked = all.filter(
    (hotel) => !booked.includes(hotel._id.toString())
  );
  console.log(nonBooked[0]._id);
  res.json(nonBooked);
};

export const image = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  if (hotel && hotel.image && hotel.image.length !== 0) {
    const thumbnail = hotel.image.find(
      (img) => img.name.includes("thumbnail") || img.name.includes("THUMBNAIL")
    );
    // console.log(thumbnail, "ujjj");
    res.set("Content-Type", thumbnail.contentType);
    return res.send(thumbnail.data);
  }
};

export const images = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  console.log(hotel.image[0].id);
  if (hotel && hotel.image && hotel.image.length !== 0) {
    const image = hotel.image.find((img) => img.id === req.params.imageId);
    res.set("Content-Type", image.contentType);
    return res.send(image.data);
  }
};

export const allImages = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  // .select("-image.data")

  res.send(hotel.image);
};

export const sellerHotels = async (req, res) => {
  let all = await Hotel.find({ postedBy: req.user._id })
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  // console.log(all);
  res.send(all);
};

export const remove = async (req, res) => {
  let removed = await Hotel.findByIdAndDelete(req.params.hotelId)
    .select("-image.data")
    .exec();
  res.json(removed);
};

export const read = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId)
    .populate("postedBy", "_id name")
    .select("-image.data")
    .exec();
  // console.log("SINGLE HOTEL", hotel);
  res.json(hotel);
};

export const update = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let data = { ...fields };

    if (files.image) {
      let image = {};
      image.data = fs.readFileSync(files.image.path);
      image.contentType = files.image.type;

      data.image = image;
    }

    let updated = await Hotel.findByIdAndUpdate(req.params.hotelId, data, {
      new: true,
    }).select("-image.data");

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("Hotel update failed. Try again.");
  }
};

export const userHotelBookings = async (req, res) => {
  const all = await Order.find({ orderedBy: req.user._id })
    .select("session")
    .populate("hotel", "-image.data")
    .populate("orderedBy", "_id name")
    .exec();
  res.json(all);
};

export const isAlreadyBooked = async (req, res) => {
  const { hotelId } = req.params;
  // find orders of the currently logged in user
  const userOrders = await Order.find({ orderedBy: req.user._id })
    .select("hotel")
    .exec();
  // check if hotel id is found in userOrders array
  let ids = [];
  for (let i = 0; i < userOrders.length; i++) {
    ids.push(userOrders[i].hotel.toString());
  }
  res.json({
    ok: ids.includes(hotelId),
  });
};

export const searchListings = async (req, res) => {
  const { location, date, bed } = req.body;
  // console.log(location, date, bed);
  // console.log(date);
  const fromDate = date.split(",");
  // console.log(fromDate[0]);
  let result = await Hotel.find({
    from: { $gte: new Date(fromDate[0]) },
    location,
  })
    .select("-image.data")
    .exec();
  // console.log("SEARCH LISTINGS", result);
  res.json(result);
};

export const bookHotel = async (req, res) => {
  const order = new Order({
    orderedBy: req.user._id,
    hotel: req.body.hotel,
  }).save();
  res.status(200).send();
};

/**
 * if you want to be more specific
 let result = await Listing.find({
  from: { $gte: new Date() },
  to: { $lte: to },
  location,
  bed,
})
 */

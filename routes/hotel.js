import express from "express";
import formidable from "express-formidable";

const router = express.Router();

// middleware
import { requireSignin, hotelOwner } from "../middlewares";
// controllers
import {
  create,
  hotels,
  image,
  sellerHotels,
  remove,
  read,
  update,
  userHotelBookings,
  isAlreadyBooked,
  searchListings,
  images,
  allImages,
  bookHotel,
} from "../controllers/hotel";

router.post(
  "/create-hotel",
  requireSignin,
  formidable({ multiples: true }),
  create
);
router.get("/images/:hotelId", allImages);
router.get("/hotel/images/:hotelId/:imageId", images);
router.get("/hotels", hotels);
router.get("/hotel/image/:hotelId", image);
router.get("/seller-hotels", requireSignin, sellerHotels);
router.delete("/delete-hotel/:hotelId", requireSignin, hotelOwner, remove);
router.get("/hotel/:hotelId", read);
router.put(
  "/update-hotel/:hotelId",
  requireSignin,
  hotelOwner,
  formidable(),
  update
);
// orders
router.get("/user-hotel-bookings", requireSignin, userHotelBookings);
router.get("/is-already-booked/:hotelId", requireSignin, isAlreadyBooked);
router.post("/search-listings", searchListings);
router.post("/book", requireSignin, bookHotel);
module.exports = router;

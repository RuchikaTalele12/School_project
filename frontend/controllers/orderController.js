import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

// ✅ Step 1: Check if Razorpay credentials exist
const hasRazorpayKeys =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET;

// ✅ Step 2: Create Razorpay instance or Mock version
let razorpayInstance;

if (hasRazorpayKeys) {
  console.log("✅ Using REAL Razorpay instance");
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
} else {
  console.warn(
    "⚠️ Razorpay keys not found. Using MOCK Razorpay for development."
  );

  // 🧩 Mock Razorpay behavior
  razorpayInstance = {
    orders: {
      create: async (options) => ({
        id: "order_mock_" + Math.floor(Math.random() * 100000),
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
      }),
      fetch: async (orderId) => ({
        id: orderId,
        status: "paid", // simulate successful payment
      }),
    },
  };
}

// ✅ Step 3: Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const options = {
      amount: course.price * 100, // Convert to paisa
      currency: "INR",
      receipt: courseId.toString(),
    };

    const order = await razorpayInstance.orders.create(options);
    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: `Order creation failed: ${err.message}` });
  }
};

// ✅ Step 4: Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, courseId, userId } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      // Update user enrollment
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        await user.save();
      }

      // Update course enrollment
      const course = await Course.findById(courseId).populate("lectures");
      if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      return res
        .status(200)
        .json({ message: "Payment verified and enrollment successful" });
    } else {
      return res
        .status(400)
        .json({ message: "Payment verification failed (invalid status)" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error during payment verification" });
  }
};

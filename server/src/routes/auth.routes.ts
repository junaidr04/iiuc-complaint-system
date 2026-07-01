import { Router } from "express";

const router = Router();

// FIX: Register Route Handling 400 Bad Request
router.post("/register", (req, res) => {
  const { name, email, password, role, department } = req.body;

  // ফ্রন্টএন্ড থেকে আসা ডেটা কনসোলে চেক করার জন্য
  console.log("Registration Request Received:", req.body);

  // একটি ডামি টোকেন এবং ইউজার অবজেক্ট রিটার্ন করা হচ্ছে যা ফ্রন্টএন্ড এক্সেপ্ট করবে
  return res.status(201).json({
    status: "success",
    token: "mock-jwt-token-for-iiuc-complaint-system",
    user: {
      id: "mock-user-id-123",
      name: name || "Test User",
      email: email || "user@test.com",
      role: role || "Student",
      department: department || "cse"
    }
  });
});

// Login Route (যদি ফিউচারে লাগে)
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  return res.status(200).json({
    status: "success",
    token: "mock-jwt-token-for-iiuc-complaint-system",
    user: {
      id: "mock-user-id-123",
      name: "Sparrow",
      email: email,
      role: "Student",
      department: "cse"
    }
  });
});

export default router;
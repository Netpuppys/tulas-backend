// Importing Required Modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initializing Express App
const app = express();
const PORT = 5000;

// Middleware Setup
app.use(cors());
app.use(bodyParser.json());

// Routes

// Route: Send OTP
app.post("/send-otp", async (req, res) => {
  const { mobileNumber, message } =
    req.body;

  // Validate Input
  if (
    !mobileNumber ||
    !message
  ) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  // Prepare Request Payload
  const urlencoded = new URLSearchParams();
  urlencoded.append("authkey", "412590AKveCHLSBnd4658bcea0P1");
  urlencoded.append("mobile", mobileNumber);
  urlencoded.append("message", message);
  urlencoded.append("sender", "TULASD");
  urlencoded.append("otp_expiry", 3);
  urlencoded.append("DLT_TE_ID", "1007161822185716704");

  try {
    // Make API Request to MSG91
    const response = await fetch("http://api.msg91.com/api/sendotp.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlencoded,
    });

    // Parse and Return Response
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    // Handle Errors
    res
      .status(500)
      .json({ error: "Failed to send OTP", details: error.message });
  }
});

// Route: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { mobileNumber, otp } = req.body;

  // Validate Input
  if (!mobileNumber || !otp) {
    return res
      .status(400)
      .json({ error: "Mobile number and OTP are required!" });
  }

  try {
    // Construct URL for Verification
    const url = `https://control.msg91.com/api/v5/otp/verify?mobile=${mobileNumber}&otp=${otp}`;

    // Make API Request to MSG91
    const requestOptions = {
      method: "GET",
      headers: {
        authkey: "412590AKveCHLSBnd4658bcea0P1",
      },
      redirect: "follow",
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    // Parse the response
    const result = await response.json();

    // Check if the response message is "success"
    if (result.type === "success") {
      return res.status(200).json(result); // Success response
    } else {
      return res.status(400).json({ error: "OTP verification failed" }); // Error response if OTP verification fails
    }
  } catch (error) {
    // Handle Errors
    res
      .status(500)
      .json({ error: "Failed to verify OTP", details: error.message });
  }
});


// Route: Retry OTP
app.post("/retry-otp", async (req, res) => {
  const { mobileNumber } = req.body;

  // Validate Input
  if (!mobileNumber) {
    return res.status(400).json({ error: "Mobile number is required!" });
  }

  try {
    // Construct URL for Retrying OTP
    const url = `https://control.msg91.com/api/v5/otp/retry?retrytype=text&mobile=${mobileNumber}&authkey=412590AKveCHLSBnd4658bcea0P1`; // Replace with your actual authkey

    // Make API Request to MSG91
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    // Parse and Return Response
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    // Handle Errors
    res.status(500).json({ error: "Failed to retry OTP", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

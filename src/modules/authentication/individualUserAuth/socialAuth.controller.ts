import jwt from "jsonwebtoken";
import axios from "axios";
import IndividualUser from "./individualUserAuth.model";
import { sendWelcomeEmail } from "../../../utilities/email.utils";
import { ErrorResponse } from "../../../utilities/errorHandler.util";

// === GOOGLE LOGIN ===
export const handleGoogleLogin = async (req: any, res: any) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }

  try {
    const decoded: any = jwt.decode(credential);
    if (!decoded || !decoded.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    let user = await IndividualUser.findOne({ email: decoded.email });

    // Block admin login via Google
    if (user && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot login through Google. Use standard login.",
      });
    }

    const isNewUser = !user;

    if (!user) {
      user = new IndividualUser({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
        role: "g-ind",
        email_verified: decoded.email_verified || true,
      });
      await user.save();
    }

    // Send welcome email for new users
    if (isNewUser) {
      try {
        await sendWelcomeEmail(
          user.email,
          user.name || user.email.split("@")[0]
        );
      } catch (emailError) {
        console.error("Failed to send Google welcome email:", emailError);
      }
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing Google login",
    });
  }
};

// === FACEBOOK LOGIN ===
export const handleFacebookLogin = async (req: any, res: any) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({
      success: false,
      message: "Facebook access token is required",
    });
  }

  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v20.0/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!data.email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided by Facebook",
      });
    }

    let user = await IndividualUser.findOne({ email: data.email });

    // Block admin login via Facebook
    if (user && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot login through Facebook. Use standard login.",
      });
    }

    const isNewUser = !user;

    if (!user) {
      user = new IndividualUser({
        email: data.email,
        name: data.name,
        picture: data.picture?.data?.url,
        facebookId: data.id,
        role: "fb-ind",
        email_verified: true,
      });
      await user.save();
    }

    // Send welcome email for new users
    if (isNewUser) {
      try {
        await sendWelcomeEmail(
          user.email,
          user.name || user.email.split("@")[0]
        );
      } catch (emailError) {
        console.error("Failed to send Facebook welcome email:", emailError);
      }
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error: any) {
    console.error(
      "Facebook login error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Error processing Facebook login",
    });
  }
};

// === X (TWITTER) LOGIN ===
export const handleXLogin = async (req: any, res: any) => {
  const { oauth_token, oauth_verifier } = req.body;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({
      success: false,
      message: "OAuth token and verifier are required",
    });
  }

  try {
    // Get access token
    const tokenResponse = await axios.post(
      "https://api.twitter.com/oauth/access_token",
      null,
      {
        params: {
          oauth_token,
          oauth_verifier,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const params = new URLSearchParams(tokenResponse.data);
    const accessToken = params.get("oauth_token");
    const accessTokenSecret = params.get("oauth_token_secret");
    const userId = params.get("user_id");
    const screenName = params.get("screen_name");

    if (!accessToken || !userId) {
      return res.status(400).json({
        success: false,
        message: "Failed to authenticate with X",
      });
    }

    // Get user profile
    const userResponse = await axios.get(
      "https://api.twitter.com/1.1/account/verify_credentials.json",
      {
        params: { include_email: "true" },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const xData = userResponse.data;
    const email = xData.email || `${screenName}@x-generated.com`;

    let user = await IndividualUser.findOne({ email });

    // Block admin login via X
    if (user && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot login through X. Use standard login.",
      });
    }

    const isNewUser = !user;

    if (!user) {
      user = new IndividualUser({
        email,
        name: xData.name,
        picture: xData.profile_image_url_https?.replace("_normal", ""),
        xId: userId,
        role: "x-ind",
        email_verified: !!xData.email,
      });
      await user.save();
    }

    // Send welcome email for new users
    if (isNewUser && xData.email) {
      try {
        await sendWelcomeEmail(user.email, user.name || screenName);
      } catch (emailError) {
        console.error("Failed to send X welcome email:", emailError);
      }
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name || screenName,
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error: any) {
    console.error("X login error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Error processing X login",
    });
  }
};

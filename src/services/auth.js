import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const githubAuth = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect("/pages/userLogin/login.html?error=github_auth_failed");
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.AUTH_GITHUB_ID,
          client_secret: process.env.AUTH_GITHUB_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.redirect(
        "/pages/userLogin/login.html?error=github_token_failed"
      );
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const githubUser = await userResponse.json();

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const emails = await emailResponse.json();
    const primaryEmail =
      emails.find((email) => email.primary)?.email || githubUser.email;

    let user = await prisma.user.findUnique({
      where: { email: primaryEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: githubUser.login,
          email: primaryEmail,
          password: await bcrypt.hash(Math.random().toString(36), 10),
        },
      });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`/index.html?token=${token}`);
  } catch (error) {
    console.error("❌ Erro no GitHub OAuth:", error);
    res.redirect("/pages/userLogin/login.html?error=server_error");
  }
};

export const googleAuth = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect("/pages/userLogin/login.html?error=google_auth_failed");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID,
        client_secret: process.env.AUTH_GOOGLE_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.AUTH_GOOGLE_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.redirect(
        "/pages/userLogin/login.html?error=google_token_failed"
      );
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const googleUser = await userResponse.json();

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: googleUser.email.split("@")[0],
          email: googleUser.email,
          password: await bcrypt.hash(Math.random().toString(36), 10),
        },
      });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`/index.html?token=${token}`);
  } catch (error) {
    console.error("❌ Erro no Google OAuth:", error);
    res.redirect("/pages/userLogin/login.html?error=server_error");
  }
};

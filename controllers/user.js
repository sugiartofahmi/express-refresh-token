import Users from "../models/user.js";

export const getDataUser = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.user.email })
      .select("email name -_id")
      .exec();
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "user not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.info(error.message);
    res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};

import services from "../services/index.js";

const registerController = async (req, res) => {
  const { username, interests } = req.body;
  if (!username || !interests) {
    return res.status(400).send({ message: `Please provide required details` });
  }

  return services.userServices.registerService(req.body, res);
};

export default { registerController };

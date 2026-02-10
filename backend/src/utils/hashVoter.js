import crypto from "crypto";

const generateVoterHash = (userId, pollId) => {
  return crypto
    .createHash("sha256")
    .update(userId.toString() + pollId.toString() + process.env.JWT_SECRET)
    .digest("hex");
};

export default generateVoterHash;

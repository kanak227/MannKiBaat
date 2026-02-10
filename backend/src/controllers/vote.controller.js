import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import generateVoterHash from "../utils/hashVoter.js";

export const castVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;

    if (optionIndex === undefined) {
      return res.status(400).json({
        message: "optionIndex is required"
      });
    }

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        message: "Poll not found"
      });
    }

    if (!poll.isActive) {
      return res.status(400).json({
        message: "Poll is closed"
      });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        message: "Invalid option index"
      });
    }

    const voterHash = generateVoterHash(req.user._id, pollId);

    const vote = new Vote({
      pollId,
      voterHash,
      optionIndex
    });

    await vote.save();

    return res.status(201).json({
      message: "Vote cast successfully"
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already voted on this poll"
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Failed to cast vote"
    });
  }
};



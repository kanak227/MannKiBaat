import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import generateVoterHash from "../utils/hashVoter.js";

export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "Question and at least two options are required"
      });
    }

    const formattedOptions = options.map((opt) => ({
      text: opt
    }));

    const poll = new Poll({
      question,
      options: formattedOptions,
      createdBy: req.user._id
    });

    await poll.save();

    return res.status(201).json({
      message: "Poll created successfully",
      poll
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getAllPoll = async (req, res) => {
  try {
    // Sort by newest first
    const polls = await Poll.find().sort({ createdAt: -1 });

    if (req.user.role === "coordinator") {
      return res.status(200).json({ polls });
    }

    // For students, check if they voted
    const pollsWithStatus = await Promise.all(polls.map(async (poll) => {
      const voterHash = generateVoterHash(req.user._id, poll._id);
      const hasVoted = await Vote.exists({ voterHash });

      let results = [];
      if (poll.showResults) {
        // Aggregate votes for this poll
        const voteCounts = await Vote.aggregate([
          { $match: { pollId: poll._id } },
          { $group: { _id: "$optionIndex", count: { $sum: 1 } } }
        ]);

        results = poll.options.map((option, index) => {
          const found = voteCounts.find((r) => r._id === index);
          return {
            option: option.text,
            votes: found ? found.count : 0
          };
        });
      }

      return {
        _id: poll._id,
        question: poll.question,
        options: poll.options,
        isActive: poll.isActive,
        hasVoted: !!hasVoted,
        showResults: poll.showResults,
        results
      };
    }));

    return res.status(200).json({ polls: pollsWithStatus });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch polls" });
  }
};



export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Student cannot see results unless valid
    if (
      req.user.role === "student" &&
      !poll.showResults
    ) {
      return res.status(403).json({
        message: "Results are not available"
      });
    }

    // Aggregate votes
    const results = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      {
        $group: {
          _id: "$optionIndex",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert aggregation to readable format
    const finalResults = poll.options.map((option, index) => {
      const found = results.find((r) => r._id === index);
      return {
        option: option.text,
        votes: found ? found.count : 0
      };
    });

    return res.status(200).json({
      pollId: poll._id,
      question: poll.question,
      results: finalResults
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch results"
    });
  }
};

export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    poll.isActive = false;
    await poll.save();

    return res.status(200).json({
      message: "Poll closed successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to close poll"
    });
  }
};

export const toggleResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    poll.showResults = !poll.showResults;
    await poll.save();

    return res.status(200).json({
      message: `Results are now ${poll.showResults ? "VISIBLE" : "HIDDEN"} for students`,
      showResults: poll.showResults
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to toggle results" });
  }
};

export const getSinglePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Coordinator sees everything
    if (req.user.role === "coordinator") {
      return res.status(200).json({ poll });
    }

    // Student sees limited data
    return res.status(200).json({
      poll: {
        _id: poll._id,
        question: poll.question,
        options: poll.options,
        isActive: poll.isActive,
        showResults: poll.showResults
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch poll"
    });
  }
};


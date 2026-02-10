import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true
    },

    voterHash: {
      type: String,
      required: true
    },

    optionIndex: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent double voting on same poll
voteSchema.index({ pollId: 1, voterHash: 1 }, { unique: true });

const Vote = mongoose.model("Vote", voteSchema);
export default Vote;

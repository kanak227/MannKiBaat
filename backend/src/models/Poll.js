import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },

    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    },

    showResults: {
      type: Boolean,
      default: false
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;

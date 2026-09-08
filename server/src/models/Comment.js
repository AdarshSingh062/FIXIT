const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint ID is required'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user is required']
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    attachments: [
      {
        type: String
      }
    ],
    isInternal: {
      type: Boolean,
      default: false // internal admin/worker note vs visible to citizen
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ complaintId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

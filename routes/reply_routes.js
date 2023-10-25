import express from 'express'
import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js'
import { postModel } from '../models/postModel.js'
import { commentModel } from '../models/commentModel.js'
import { replyModel } from '../models/replyModel.js'

export const reply_routes = express()

const authenticate = (req, res, next) => {
  const token = req.headers.authorization.substring(7)
  jwt.verify(token, process.env.JWT_KEY, (err, resp) => {
    if (resp) {
      req.user = resp
      next()
    } else {
      res.json({ message: err })
    }
  })
}
// get all the replies
reply_routes.get('/:commentId', async (req, res) => {
  const {commentId} = req.params
  const comments = await replyModel
    .find({ comment: commentId })
    .populate({
      path: 'user',
      select: '-password',
    })
    .exec()
  res.json(comments)
})

// add a reply
reply_routes.put('/:commentId', authenticate, async (req, res) => {
  const { replyValue } = req.body
  const {commentId} = req.params
  const { _id } = req.user
  try {
    let newReply = await new replyModel({
      user: _id,
      comment: commentId,
      replyValue,
    }).save()
    newReply = await newReply.populate({ path: 'user', select: '-password' })
    res.json({ message: 'reply created', reply: newReply })
  } catch (err) {
    res.json({ message: err })
  }
})
// // delete a comment
// comment_routes.delete('/delete/:id', authenticate, async (req, res) => {
//   const commentId = req.params.id
//   const { _id } = req.user
//   try {
//     const resp = await commentModel.deleteOne({ _id: commentId, user: _id })
//     res.json({ message: 'comment deleted', comment: resp })
//   } catch (err) {
//     res.json({ message: err })
//   }
// })
// // add a comment
// comment_routes.post('/addcomment', authenticate, async (req, res) => {
//   const { commentValue, post } = req.body
//   const { _id } = req.user
//   try {
//     const newComment = await new commentModel({
//       commentValue,
//       post,
//       user: _id,
//     }).save()
//     res.json({ message: 'comment created', comment: newComment })
//   } catch (err) {
//     res.json({ message: err })
//   }
// })

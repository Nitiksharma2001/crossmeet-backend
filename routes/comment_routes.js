import express from 'express'
import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js'
import { postModel } from '../models/postModel.js'
import { commentModel } from '../models/commentModel.js'
import {replyModel} from '../models/replyModel.js'

export const comment_routes = express()

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
// get all the comments
comment_routes.get('/allcomments/:id', async (req, res) => {
  const post = req.params.id
  const comments = await commentModel
    .find({ post })
    .populate({
      path: 'user',
      select: '-password',
    })
    .exec()
  res.json(comments)
})

// add a comment
comment_routes.post('/addcomment', authenticate, async (req, res) => {
  const { commentValue, post } = req.body
  const { _id } = req.user
  try {
    const newComment = await new commentModel({
      commentValue,
      post,
      user: _id,
    }).save()
    res.json({ message: 'comment created', comment: newComment })
  } catch (err) {
    res.json({ message: err })
  }
})

// delete a comment
comment_routes.delete('/:id', authenticate, async (req, res) => {
  const commentId = req.params.id
  const { _id } = req.user
  
  try {
    await commentModel.deleteOne({ _id: commentId, user: _id })
    await replyModel.deleteMany({comment: commentId})
    res.json({ message: 'comment deleted'})
  } catch (err) {
    res.json({ message: err })
  }
})
// add a comment
comment_routes.post('/addcomment', authenticate, async (req, res) => {
  const { commentValue, post } = req.body
  const { _id } = req.user
  try {
    const newComment = await new commentModel({
      commentValue,
      post,
      user: _id,
    }).save()
    res.json({ message: 'comment created', comment: newComment })
  } catch (err) {
    res.json({ message: err })
  }
})

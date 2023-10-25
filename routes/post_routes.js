import express from 'express'
import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js'
import { postModel } from '../models/postModel.js'

export const post_routes = express()

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

// get all posts
post_routes.get('/allposts', async (req, res) => {
  const posts = await postModel
    .find()
    .populate({
      path: 'user',
      select: '-password',
    })
    .exec()
  res.json(posts)
})

// add a post
post_routes.post('/addpost', authenticate, async (req, res) => {
  const { title, description, imageUrl } = req.body
  const { _id } = req.user
  try {
    const newPost = await new postModel({
      title,
      description,
      imageUrl,
      user: _id,
    }).save()
    res.json({ message: 'post created', post: newPost })
  } catch (err) {
    res.json({ message: err })
  }
})

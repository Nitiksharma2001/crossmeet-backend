import express from 'express'
import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js'
import { postModel } from '../models/postModel.js'
import { likeModel } from '../models/likeModel.js'

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
post_routes.get('/', async (req, res) => {
  const posts = await postModel
    .find()
    .populate({
      path: 'user',
      select: '-password',
    })
    .exec()
  res.json(posts)
})
// get all posts of a user
post_routes.get('/:id', async (req, res) => {
  const userId = req.params.id
  const posts = await postModel
    .find({user: userId})
    .populate({
      path: 'user',
      select: '-password',
    })
    .exec()
  res.json(posts)
})

// add a post
post_routes.post('/', w, async (req, res) => {
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

post_routes.delete('/', authenticate, async (req, res) => {
  const postId = req.params.id
  const { _id } = req.user
  try {
    await postModel.deleteMany().exec()
    res.json({ message: 'post deleted'})
  } catch (err) {
    res.json({ message: err })
  }
})

// get all likes of a post
post_routes.get('/like/:id', async(req, res) => {
  const postId = req.params.id
  try{
    const likePost = await likeModel.find({postId}).exec()
    res.json({post: likePost})
  }
  catch(err){
    res.json({message: err})
  }
})

// validate whether a user has liked a post or not
post_routes.get('/liked/:id', authenticate, async(req, res) => {
  const postId = req.params.id
  const userId = req.user._id
  try{
    const like = await likeModel.findOne({postId, userId})
    if(like == null){
      return res.json({message: 'notliked'})
    }
    else{
      return res.json({message: 'liked'})
    }
  }
  catch(err){
    res.json({message: err})
  }
})

// like a post
post_routes.put('/like/:id', authenticate, async(req, res) => {
  const postId = req.params.id
  const {_id} = req.user
  try{
    const likePost = await postModel.findOne({_id: postId}).exec()
    await likeModel.create({userId: _id, postId})
    likePost.noOfLikes++
    await likePost.save()
    res.json({message: 'liked the post', post: likePost})
  }
  catch(err){
    res.json({message: err})
  }
})

// dislike a post
post_routes.put('/dislike/:id', authenticate, async(req, res) => {
  const postId = req.params.id
  const {_id} = req.user
  try{
    const likePost = await postModel.findOne({_id: postId}).exec()
    await likeModel.deleteMany({userId: _id, postId})
    likePost.noOfLikes--
    await likePost.save()
    res.json({message: 'disliked the post', post: likePost})
  }
  catch(err){
    res.json({message: err})
  }
})

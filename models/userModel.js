import mongoose, { mongo } from 'mongoose'
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})
export const userModel = mongoose.model('User', userSchema)

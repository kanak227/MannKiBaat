import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../src/models/User.js'

dotenv.config()

const run = async () => {
  try{
    if(!process.env.MONGO_URI){
      console.error('MONGO_URI not set')
      process.exit(1)
    }
    await mongoose.connect(process.env.MONGO_URI)

    const identifier = process.env.SEED_IDENTIFIER || 'admin'
    const password = process.env.SEED_PASSWORD || 'admin123'

    let user = await User.findOne({ identifier })
    if(!user){
      user = new User({ identifier, role: 'coordinator' })
      await user.setPassword(password)
      user.mustChangePassword = true
      await user.save()
      console.log('Seeded user:', identifier)
    }else{
      console.log('User already exists:', identifier)
    }

    await mongoose.disconnect()
    process.exit(0)
  }catch(err){
    console.error(err)
    process.exit(1)
  }
}

run()

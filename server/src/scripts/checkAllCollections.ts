import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const checkAllCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✅ MongoDB ulandi')

    const collections = await mongoose.connection.db.listCollections().toArray()
    
    for (const col of collections) {
      console.log(`\n📁 Collection: ${col.name}`)
      const collection = mongoose.connection.db.collection(col.name)
      const count = await collection.countDocuments()
      console.log(`   Jami ma'lumotlar: ${count}`)
      
      if (count > 0 && count < 20) {
        const sample = await collection.findOne({})
        if (sample) {
          // Check if it looks like student data
          if (sample.fullName || sample.name || sample.firstName || sample.student) {
            console.log(`   🎓 Bu o'quvchi ma'lumotlari bo'lishi mumkin:`)
            console.log(`   Namuna:`, JSON.stringify(sample, null, 4))
          }
        }
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Xatolik:', error)
    process.exit(1)
  }
}

checkAllCollections()
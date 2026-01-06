import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { AuthRequest } from '../middleware/auth.js'

// JWT token yaratish
const generateToken = (id: string, role: string = 'student') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// @desc    Login foydalanuvchi (User yoki Student)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // Validatsiya
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username va parol kiritilishi shart',
      })
    }

    const lowercaseUsername = username.toLowerCase().trim()

    // 1. Avval Users collection'dan qidirish (admin, teacher)
    const user = await User.findOne({ username: lowercaseUsername })

    if (user) {
      // Parolni tekshirish (hashed)
      const isPasswordMatch = await user.comparePassword(password)

      if (isPasswordMatch) {
        const token = generateToken(user._id.toString(), user.role)

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            role: user.role,
          },
        })
      }
    }

    // 2. Students collection'dan qidirish (prox.uz_crm dan kelgan o'quvchilar)
    const studentsCollection = mongoose.connection.db.collection('students')
    const student = await studentsCollection.findOne({ 
      username: lowercaseUsername 
    })

    if (student) {
      // O'quvchi paroli plain text (prox.uz_crm shunday saqlaydi)
      if (student.password === password) {
        const token = generateToken(student._id.toString(), 'student')

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: student._id,
            fullName: student.name, // prox.uz_crm'da "name" field
            username: student.username,
            role: 'student',
            phone: student.phone,
            totalBall: student.totalBall,
            step: student.step,
          },
        })
      }
    }

    // Hech qayerda topilmadi yoki parol noto'g'ri
    return res.status(401).json({
      success: false,
      message: 'Username yoki parol noto\'g\'ri',
    })

  } catch (error: any) {
    console.error('Login xatolik:', error)
    res.status(500).json({
      success: false,
      message: 'Server xatolik',
    })
  }
}

// @desc    Joriy foydalanuvchi ma'lumotlarini olish
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const { id, role } = req.user

    // Admin/Teacher uchun
    if (role === 'admin' || role === 'teacher') {
      const user = await User.findById(id).select('-password')
      if (user) {
        return res.status(200).json({
          success: true,
          user,
        })
      }
    }

    // Student uchun
    const studentsCollection = mongoose.connection.db.collection('students')
    const student = await studentsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    })

    if (student) {
      return res.status(200).json({
        success: true,
        user: {
          id: student._id,
          fullName: student.name,
          username: student.username,
          role: 'student',
          phone: student.phone,
          totalBall: student.totalBall,
          step: student.step,
          balance: student.balance,
          joinDate: student.joinDate,
        },
      })
    }

    return res.status(404).json({
      success: false,
      message: 'Foydalanuvchi topilmadi',
    })

  } catch (error: any) {
    console.error('GetMe xatolik:', error)
    res.status(500).json({
      success: false,
      message: 'Server xatolik',
    })
  }
}

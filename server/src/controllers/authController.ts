import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { AuthRequest } from '../middleware/auth.js'

// JWT token yaratish
const generateToken = (id: string, role: string = 'student') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '30d',
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

    // 2. Students collection'dan qidirish (prox_crm dan kelgan o'quvchilar)
    const db = mongoose.connection.db
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection error',
      })
    }
    
    const studentsCollection = db.collection('students')
    const student = await studentsCollection.findOne({ 
      username: lowercaseUsername 
    })

    if (student) {
      // O'quvchi paroli plain text yoki plainPassword fieldida (prox_crm shunday saqlaydi)
      const studentPassword = student.plainPassword || student.password
      
      if (studentPassword === password) {
        const token = generateToken(student._id.toString(), 'student')

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: student._id,
            fullName: student.name, // prox_crm'da "name" field
            username: student.username,
            role: 'student',
            phone: student.phone,
            totalBall: student.totalBall,
            step: student.step,
          },
        })
      }
    }

    // 3. Branches collection'dan mentor qidirish
    const branchesCollection = db.collection('branches')
    const mentorBranch = await branchesCollection.findOne({ 
      mentor_username: lowercaseUsername 
    })

    if (mentorBranch && mentorBranch.mentor_password === password) {
      const token = generateToken(mentorBranch._id.toString(), 'mentor')

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: mentorBranch._id,
          fullName: mentorBranch.mentor_name || 'Mentor',
          username: mentorBranch.mentor_username,
          role: 'mentor',
          branch_id: mentorBranch._id,
          branch_name: mentorBranch.name,
        },
      })
    }

    // 4. Branches collection'dan manager qidirish
    const managerBranch = await branchesCollection.findOne({ 
      manager_username: lowercaseUsername 
    })

    if (managerBranch && managerBranch.manager_user_password === password) {
      const token = generateToken(managerBranch._id.toString(), 'manager')

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: managerBranch._id,
          fullName: managerBranch.manager_user_name || 'Manager',
          username: managerBranch.manager_username,
          role: 'manager',
          branch_id: managerBranch._id,
          branch_name: managerBranch.name,
        },
      })
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

    // Mentor uchun
    if (role === 'mentor') {
      const db = mongoose.connection.db
      if (!db) {
        return res.status(404).json({
          success: false,
          message: 'Database connection error',
        })
      }
      
      const branchesCollection = db.collection('branches')
      const branch = await branchesCollection.findOne({ 
        _id: new mongoose.Types.ObjectId(id) 
      })

      if (branch) {
        return res.status(200).json({
          success: true,
          user: {
            id: branch._id,
            fullName: branch.mentor_name || 'Mentor',
            username: branch.mentor_username,
            role: 'mentor',
            branch_id: branch._id,
            branch_name: branch.name,
          },
        })
      }
    }

    // Manager uchun
    if (role === 'manager') {
      const db = mongoose.connection.db
      if (!db) {
        return res.status(404).json({
          success: false,
          message: 'Database connection error',
        })
      }
      
      const branchesCollection = db.collection('branches')
      const branch = await branchesCollection.findOne({ 
        _id: new mongoose.Types.ObjectId(id) 
      })

      if (branch) {
        return res.status(200).json({
          success: true,
          user: {
            id: branch._id,
            fullName: branch.manager_user_name || 'Manager',
            username: branch.manager_username,
            role: 'manager',
            branch_id: branch._id,
            branch_name: branch.name,
          },
        })
      }
    }

    // Student uchun
    const db = mongoose.connection.db
    if (!db) {
      return res.status(404).json({
        success: false,
        message: 'Database connection error',
      })
    }
    
    const studentsCollection = db.collection('students')
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

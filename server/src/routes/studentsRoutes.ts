import express from 'express'
import { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentsStats,
  getStudentDailyBalls,
  getStudentsWithSteps
} from '../controllers/studentsController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Public routes (login bo'lmagan holat uchun ham ko'rish mumkin)
router.get('/', getAllStudents)
router.get('/stats', getStudentsStats)
router.get('/with-steps', getStudentsWithSteps)
router.get('/:id/daily-balls', getStudentDailyBalls)
router.get('/:id', getStudentById)

// Protected routes (faqat login bo'lgan holat uchun)
router.post('/', authenticateToken, createStudent)
router.put('/:id', authenticateToken, updateStudent)
router.delete('/:id', authenticateToken, deleteStudent)

export default router
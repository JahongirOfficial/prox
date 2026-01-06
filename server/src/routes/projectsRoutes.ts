import express from 'express'
import { 
  getAllProjects, 
  getProjectById,
  getProjectsStats,
  createProject,
  updateProject
} from '../controllers/projectsController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', getAllProjects)
router.get('/stats', getProjectsStats)
router.get('/:id', getProjectById)

// Protected routes
router.post('/', authenticateToken, createProject)
router.put('/:id', authenticateToken, updateProject)

export default router
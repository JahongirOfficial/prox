import api from './api'

export interface Student {
  _id: string
  name: string
  phone: string
  role: string
  subscriptionPlan: string
  monthly_fee: number
  balance: number
  totalBall: number
  step: number
  joinDate: string
  days: string[]
  todayBall: string
  workType: string
  branch_id: string
  study_days: string[]
  payment_date: string
  username: string
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export const studentsService = {
  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get('/students')
    return response.data
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`)
    return response.data
  },

  createStudent: async (studentData: Partial<Student>): Promise<Student> => {
    const response = await api.post('/students', studentData)
    return response.data
  },

  updateStudent: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, studentData)
    return response.data
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`)
  },

  getStudentsStats: async () => {
    const response = await api.get('/students/stats')
    return response.data
  },

  getDailyBalls: async (id: string): Promise<{
    dailyBalls: Array<{ date: string; ball: number }>
    totalBall: number
    todayBall: number
  }> => {
    const response = await api.get(`/students/${id}/daily-balls`)
    return response.data
  }
}

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Project from '../models/Project'

dotenv.config()

const realProjects = [
  {
    title: 'MentalJon',
    description: 'Ruhiy salomatlik va psixologik yordam platformasi. Onlayn konsultatsiya va ruhiy salomatlik xizmatlari.',
    technology: 'React, Node.js, MongoDB, Express',
    students: 8,
    status: 'completed',
    progress: 100,
    deadline: new Date('2024-01-15'),
    url: 'https://mentaljon.uz/en/'
  },
  {
    title: 'ProX Academy',
    description: 'Zamonaviy o\'quv platformasi va dasturlash kurslari. O\'quvchilar uchun interaktiv ta\'lim tizimi.',
    technology: 'React, TypeScript, MongoDB, Express',
    students: 12,
    status: 'active',
    progress: 85,
    deadline: new Date('2024-03-01'),
    url: 'https://prox.uz/'
  },
  {
    title: 'Alibobo Qurilish',
    description: 'Qurilish kompaniyasi uchun korporativ veb-sayt. Loyihalar portfoliosi va xizmatlar taqdimoti.',
    technology: 'Vue.js, Laravel, MySQL, Bootstrap',
    students: 6,
    status: 'completed',
    progress: 100,
    deadline: new Date('2023-12-20'),
    url: 'https://aliboboqurilish.uz/'
  },
  {
    title: 'Alochi Bolajon',
    description: 'Bolalar uchun o\'yinchoqlar va rivojlantiruvchi mahsulotlar onlayn do\'koni.',
    technology: 'Next.js, Strapi, PostgreSQL, Tailwind CSS',
    students: 7,
    status: 'completed',
    progress: 100,
    deadline: new Date('2024-02-10'),
    url: 'https://alochibolajon.uz/'
  },
  {
    title: 'BiznesJon',
    description: 'Biznes konsalting va moliyaviy maslahat xizmatlari platformasi. Tadbirkorlar uchun yordam markazi.',
    technology: 'Angular, .NET Core, SQL Server, Material UI',
    students: 9,
    status: 'active',
    progress: 75,
    deadline: new Date('2024-04-15'),
    url: 'https://biznesjon.uz/'
  },
  {
    title: 'UstaJon',
    description: 'Hunarmandlar va xizmat ko\'rsatuvchilar uchun platforma. Mijozlar bilan bog\'lanish tizimi.',
    technology: 'React Native, Firebase, Redux, Expo',
    students: 10,
    status: 'active',
    progress: 60,
    deadline: new Date('2024-05-01'),
    url: 'https://ustajon.uz/'
  }
]

const seedRealProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('✅ MongoDB ulandi')

    // Clear existing projects
    await Project.deleteMany({})
    console.log('🗑️ Mavjud loyihalar o\'chirildi')

    // Insert real projects
    await Project.insertMany(realProjects)
    console.log(`✅ ${realProjects.length} ta real loyiha qo'shildi`)

    // Show added projects
    console.log('\n🌐 QO\'SHILGAN REAL LOYIHALAR:')
    realProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}`)
      console.log(`   🔗 ${project.url}`)
      console.log(`   📊 ${project.status} (${project.progress}%)`)
      console.log(`   👥 ${project.students} ta o'quvchi`)
      console.log(`   💻 ${project.technology}`)
      console.log('   ' + '-'.repeat(50))
    })

    // Show statistics
    const stats = {
      total: realProjects.length,
      completed: realProjects.filter(p => p.status === 'completed').length,
      active: realProjects.filter(p => p.status === 'active').length,
      planning: realProjects.filter(p => p.status === 'planning').length,
      totalStudents: realProjects.reduce((sum, p) => sum + p.students, 0)
    }

    console.log('\n📊 LOYIHALAR STATISTIKASI:')
    console.log(`   Jami: ${stats.total}`)
    console.log(`   Tugallangan: ${stats.completed}`)
    console.log(`   Faol: ${stats.active}`)
    console.log(`   Rejalashtirilgan: ${stats.planning}`)
    console.log(`   Jami ishtirokchilar: ${stats.totalStudents}`)

    console.log('\n🎉 Real loyihalar muvaffaqiyatli qo\'shildi!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Xatolik:', error)
    process.exit(1)
  }
}

seedRealProjects()
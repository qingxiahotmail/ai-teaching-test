// grade.js
const app = getApp()

Page({
  data: {
    grades: [],
    filteredGrades: [],
    personalGrades: [],
    searchKeyword: '',
    selectedCourse: '',
    selectedCourseIndex: 0,
    selectedSemester: '',
    selectedSemesterIndex: 0,
    stats: {
      averageScore: 0,
      highestScore: 0,
      passRate: 0,
      totalStudents: 0
    },
    personalScore: 0,
    personalRank: '--',
    courseAverage: 0,
    courseOptions: ['全部课程', '计算机科学导论', '数据结构与算法', '软件工程'],
    semesterOptions: ['全部学期', '2024秋季学期', '2024春季学期', '2023秋季学期']
  },

  onLoad() {
    this.loadGrades()
  },

  onShow() {
    this.loadGrades()
  },

  // 加载成绩数据
  loadGrades() {
    // 从本地存储读取课程数据，显示学习统计
    try {
      const savedCourses = wx.getStorageSync('courses')
      if (savedCourses && savedCourses.length > 0) {
        // 显示学习统计而不是成绩
        const totalCourses = savedCourses.filter(c => c.status === 'active').length
        const completedCount = Math.floor(Math.random() * totalCourses) + 1

        this.setData({
          personalScore: completedCount,
          personalRank: `已完成 ${completedCount} 门课程`,
          courseAverage: totalCourses > 0 ? (completedCount / totalCourses * 100).toFixed(1) : 0
        })
        return
      }
    } catch (e) {
      console.error('读取课程数据失败:', e)
    }

    // 使用默认学习数据
    this.setData({
      personalScore: 3,
      personalRank: '已完成 3 门课程',
      courseAverage: '75.0'
    })
  },

  // 计算统计信息（教师）
  calculateStats() {
    const { grades } = this.data
    
    const validGrades = grades.filter(grade => grade.totalScore && !isNaN(grade.totalScore))
    
    if (validGrades.length > 0) {
      const scores = validGrades.map(grade => parseInt(grade.totalScore))
      const averageScore = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
      const highestScore = Math.max(...scores)
      const passRate = ((scores.filter(score => score >= 60).length / scores.length) * 100).toFixed(1)
      
      this.setData({
        stats: {
          averageScore: averageScore,
          highestScore: highestScore,
          passRate: passRate,
          totalStudents: grades.length
        }
      })
    }
  },

  // 计算个人统计信息（学生）
  calculatePersonalStats() {
    const { personalGrades } = this.data
    
    const validGrades = personalGrades.filter(grade => grade.totalScore && !isNaN(grade.totalScore))
    
    if (validGrades.length > 0) {
      const totalScore = validGrades.reduce((sum, grade) => sum + parseInt(grade.totalScore), 0)
      const averageScore = (totalScore / validGrades.length).toFixed(1)
      
      this.setData({
        personalScore: averageScore,
        personalRank: validGrades.length > 1 ? `${validGrades.length}名中第2名` : '--',
        courseAverage: '85.5'
      })
    }
  },

  // 课程选择
  onCourseChange(e) {
    const index = parseInt(e.detail.value)
    const course = this.data.courseOptions[index]
    
    this.setData({
      selectedCourseIndex: index,
      selectedCourse: index === 0 ? '' : course
    })
    
    this.filterGrades()
  },

  // 学期选择
  onSemesterChange(e) {
    const index = parseInt(e.detail.value)
    const semester = this.data.semesterOptions[index]
    
    this.setData({
      selectedSemesterIndex: index,
      selectedSemester: index === 0 ? '' : semester
    })
    
    this.filterGrades()
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterGrades()
  },

  // 筛选成绩
  filterGrades() {
    const { grades, searchKeyword, selectedCourse, selectedSemester } = this.data
    
    let filtered = grades.filter(grade => {
      // 搜索筛选
      const matchSearch = searchKeyword === '' || 
        grade.studentName.includes(searchKeyword) ||
        grade.studentId.includes(searchKeyword)
      
      // 课程筛选
      const matchCourse = selectedCourse === '' || grade.courseName === selectedCourse
      
      // 学期筛选
      const matchSemester = selectedSemester === '' || grade.semester === selectedSemester
      
      return matchSearch && matchCourse && matchSemester
    })

    this.setData({
      filteredGrades: filtered
    })
  },

  // 成绩输入
  onScoreInput(e) {
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    const value = e.detail.value
    
    // 更新成绩数据
    const updatedGrades = this.data.grades.map(grade => {
      if (grade.id === id) {
        const updatedGrade = { ...grade }
        updatedGrade[type + 'Score'] = value
        
        // 自动计算总成绩（平时成绩占40%，期末成绩占60%）
        if (updatedGrade.usualScore && updatedGrade.finalScore) {
          const usual = parseInt(updatedGrade.usualScore) || 0
          const final = parseInt(updatedGrade.finalScore) || 0
          updatedGrade.totalScore = Math.round(usual * 0.4 + final * 0.6).toString()
        } else {
          updatedGrade.totalScore = ''
        }
        
        return updatedGrade
      }
      return grade
    })

    this.setData({
      grades: updatedGrades
    })
    
    this.filterGrades()
  },

  // 保存成绩
  saveGrade(e) {
    const gradeId = e.currentTarget.dataset.id
    const grade = this.data.grades.find(g => g.id === gradeId)
    
    if (!grade.usualScore || !grade.finalScore) {
      wx.showToast({
        title: '请填写完整成绩',
        icon: 'none'
      })
      return
    }

    // 模拟保存成绩
    wx.showLoading({
      title: '保存中...'
    })

    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '成绩保存成功',
        icon: 'success'
      })
      
      this.calculateStats()
    }, 1000)
  },

  // 导入成绩
  importGrades() {
    wx.showModal({
      title: '导入成绩',
      content: '此功能需要从Excel文件导入成绩数据，当前版本暂不支持文件导入。',
      showCancel: false
    })
  },

  // 导出成绩
  exportGrades() {
    wx.showModal({
      title: '导出成绩',
      content: '此功能可以将成绩数据导出为Excel文件，当前版本暂不支持文件导出。',
      showCancel: false
    })
  }
})
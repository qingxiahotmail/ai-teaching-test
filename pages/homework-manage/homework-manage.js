// homework-manage.js
const app = getApp()

Page({
  data: {
    isTeacher: false,
    homeworks: [],
    showAddModal: false,
    editingHomework: null,
    formData: {
      title: '',
      courseName: '',
      description: '',
      deadline: ''
    },
    courses: ['计算机科学导论', '数据结构与算法', '软件工程', '高等数学']
  },

  onLoad() {
    this.setData({ isTeacher: app.checkTeacherMode() })
    this.loadHomeworks()
  },

  onShow() {
    this.setData({ isTeacher: app.checkTeacherMode() })
    if (this.data.isTeacher) {
      this.loadHomeworks()
    }
    // 每次显示页面都重新加载课程列表（确保同步最新课程）
    this.loadCoursesForHomework()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHomeworks()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 加载作业列表
  loadHomeworks() {
    // 从本地存储读取作业数据
    try {
      const savedHomeworks = wx.getStorageSync('homeworks')
      if (savedHomeworks && savedHomeworks.length > 0) {
        this.setData({ homeworks: savedHomeworks })
      }
    } catch (e) {
      console.error('读取作业数据失败:', e)
    }

    // 同步课程列表（用于作业添加时的课程选择）
    this.loadCoursesForHomework()
  },

  // 加载课程列表（用于作业选择）
  loadCoursesForHomework() {
    try {
      const savedCourses = wx.getStorageSync('courses')
      if (savedCourses && savedCourses.length > 0) {
        // 提取课程名称列表
        const courseNames = savedCourses.map(course => course.name)
        this.setData({ courses: courseNames })
        return
      }
    } catch (e) {
      console.error('读取课程数据失败:', e)
    }

    // 使用默认课程列表
    this.setData({
      courses: ['计算机科学导论', '数据结构与算法', '软件工程', '高等数学']
    })
  },

  // 保存作业到本地存储
  saveHomeworksToStorage(homeworks) {
    try {
      wx.setStorageSync('homeworks', homeworks)
    } catch (e) {
      console.error('保存作业数据失败:', e)
    }
  },

  // 搜索作业
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    if (!keyword) {
      this.loadHomeworks()
      return
    }
    
    const filtered = this.data.homeworks.filter(hw => 
      hw.title.toLowerCase().includes(keyword) ||
      hw.description.toLowerCase().includes(keyword) ||
      hw.courseName.toLowerCase().includes(keyword)
    )
    this.setData({ homeworks: filtered })
  },

  // 显示添加作业模态框
  showAddHomeworkModal() {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    this.setData({
      showAddModal: true,
      editingHomework: null,
      formData: {
        title: '',
        courseName: '',
        description: '',
        deadline: ''
      }
    })
  },

  // 隐藏模态框
  hideModal() {
    this.setData({ showAddModal: false })
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  // 课程选择
  onCourseChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.courseName': this.data.courses[index]
    })
  },

  // 编辑作业
  editHomework(e) {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    const homework = e.currentTarget.dataset.homework
    this.setData({
      showAddModal: true,
      editingHomework: homework,
      formData: {
        title: homework.title,
        courseName: homework.courseName,
        description: homework.description,
        deadline: homework.deadline
      }
    })
  },

  // 保存作业
  saveHomework() {
    const { formData, editingHomework, homeworks } = this.data
    
    if (!formData.title || !formData.courseName || !formData.deadline) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      })
      return
    }

    if (editingHomework) {
      // 编辑现有作业
      const updated = homeworks.map(hw => {
        if (hw.id === editingHomework.id) {
          return {
            ...hw,
            title: formData.title,
            courseName: formData.courseName,
            description: formData.description,
            deadline: formData.deadline
          }
        }
        return hw
      })
      this.setData({ homeworks: updated })
      this.saveHomeworksToStorage(updated)
      wx.showToast({ title: '更新成功', icon: 'success' })
    } else {
      // 添加新作业
      const newHomework = {
        id: Date.now(),
        title: formData.title,
        courseName: formData.courseName,
        description: formData.description,
        deadline: formData.deadline,
        createTime: new Date().toISOString().split('T')[0],
        status: 'active'
      }
      const updated = [newHomework, ...homeworks]
      this.setData({ homeworks: updated })
      this.saveHomeworksToStorage(updated)
      wx.showToast({ title: '添加成功', icon: 'success' })
    }

    this.hideModal()
  },

  // 删除作业
  deleteHomework(e) {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    
    const homeworkId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个作业吗？',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.homeworks.filter(hw => hw.id !== homeworkId)
          this.setData({ homeworks: updated })
          this.saveHomeworksToStorage(updated)
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  // 切换作业状态
  toggleStatus(e) {
    if (!this.data.isTeacher) return

    const homeworkId = e.currentTarget.dataset.id
    const updated = this.data.homeworks.map(hw => {
      if (hw.id === homeworkId) {
        return {
          ...hw,
          status: hw.status === 'active' ? 'archived' : 'active'
        }
      }
      return hw
    })
    this.setData({ homeworks: updated })
    this.saveHomeworksToStorage(updated)
  },

  // 获取状态文本
  getStatusText(hw) {
    if (hw.status === 'active') return '进行中'
    if (hw.status === 'expired') return '已截止'
    return '已归档'
  },

  // 获取状态类名
  getStatusClass(hw) {
    return hw.status
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'formData.deadline': e.detail.value
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})

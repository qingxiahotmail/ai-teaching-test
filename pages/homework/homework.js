// homework.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    homeworks: [],
    filteredHomeworks: [],
    searchKeyword: '',
    selectedCourse: '',
    selectedCourseIndex: 0,
    selectedStatus: '',
    selectedStatusIndex: 0,
    showHomeworkModal: false,
    editingHomework: null,
    homeworkForm: {
      title: '',
      courseName: '',
      courseIndex: 0,
      deadlineDate: '',
      submitFormat: '',
      description: ''
    },
    courseOptions: ['全部课程', '计算机科学导论', '数据结构与算法', '软件工程'],
    statusOptions: ['全部状态', '未提交', '已提交', '已截止']
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.loadHomeworks()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 加载作业数据
  loadHomeworks() {
    // 模拟作业数据
    const mockHomeworks = [
      {
        id: '1',
        title: '实验一：程序设计基础',
        courseName: '计算机科学导论',
        courseId: '1',
        publishTime: '2024-09-01',
        deadline: '2024-09-15',
        submitFormat: 'PDF文档',
        description: '完成基础的程序设计练习，包括变量、条件语句和循环结构的使用。',
        submittedCount: 45,
        totalStudents: 60,
        isSubmitted: false,
        status: 'pending'
      },
      {
        id: '2',
        title: '实验二：数据结构实现',
        courseName: '数据结构与算法',
        courseId: '2',
        publishTime: '2024-09-10',
        deadline: '2024-09-25',
        submitFormat: '源代码压缩包',
        description: '实现链表、栈和队列等基本数据结构，并编写测试用例。',
        submittedCount: 30,
        totalStudents: 45,
        isSubmitted: true,
        status: 'submitted'
      },
      {
        id: '3',
        title: '项目需求分析报告',
        courseName: '软件工程',
        courseId: '3',
        publishTime: '2024-08-15',
        deadline: '2024-08-30',
        submitFormat: 'Word文档',
        description: '选择一个软件项目，完成需求分析报告的编写。',
        submittedCount: 48,
        totalStudents: 50,
        isSubmitted: false,
        status: 'overdue'
      }
    ]

    this.setData({
      homeworks: mockHomeworks,
      filteredHomeworks: mockHomeworks
    })
  },

  // 课程选择
  onCourseChange(e) {
    const index = parseInt(e.detail.value)
    const course = this.data.courseOptions[index]
    
    this.setData({
      selectedCourseIndex: index,
      selectedCourse: index === 0 ? '' : course
    })
    
    this.filterHomeworks()
  },

  // 状态选择
  onStatusChange(e) {
    const index = parseInt(e.detail.value)
    const status = this.data.statusOptions[index]
    
    this.setData({
      selectedStatusIndex: index,
      selectedStatus: index === 0 ? '' : status
    })
    
    this.filterHomeworks()
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterHomeworks()
  },

  // 筛选作业
  filterHomeworks() {
    const { homeworks, searchKeyword, selectedCourse, selectedStatus } = this.data
    
    let filtered = homeworks.filter(homework => {
      // 搜索筛选
      const matchSearch = searchKeyword === '' || 
        homework.title.toLowerCase().includes(searchKeyword.toLowerCase())
      
      // 课程筛选
      const matchCourse = selectedCourse === '' || homework.courseName === selectedCourse
      
      // 状态筛选
      let matchStatus = selectedStatus === ''
      if (selectedStatus === '未提交') {
        matchStatus = homework.status === 'pending'
      } else if (selectedStatus === '已提交') {
        matchStatus = homework.status === 'submitted'
      } else if (selectedStatus === '已截止') {
        matchStatus = homework.status === 'overdue'
      }
      
      return matchSearch && matchCourse && matchStatus
    })

    this.setData({
      filteredHomeworks: filtered
    })
  },

  // 获取状态文本
  getStatusText(homework) {
    if (this.data.userInfo.role === 'teacher') {
      return homework.status === 'pending' ? '进行中' : 
             homework.status === 'submitted' ? '已截止' : '已结束'
    } else {
      return homework.isSubmitted ? '已提交' : '未提交'
    }
  },

  // 获取状态类名
  getStatusClass(homework) {
    if (this.data.userInfo.role === 'teacher') {
      return homework.status
    } else {
      return homework.isSubmitted ? 'submitted' : 'pending'
    }
  },

  // 显示添加作业模态框
  showAddHomeworkModal() {
    this.setData({
      showHomeworkModal: true,
      editingHomework: null,
      homeworkForm: {
        title: '',
        courseName: '',
        courseIndex: 0,
        deadlineDate: '',
        submitFormat: '',
        description: ''
      }
    })
  },

  // 隐藏模态框
  hideHomeworkModal() {
    this.setData({
      showHomeworkModal: false
    })
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`homeworkForm.${field}`]: value
    })
  },

  // 课程选择（表单）
  onFormCourseChange(e) {
    const index = parseInt(e.detail.value)
    const courseName = this.data.courseOptions[index]
    
    this.setData({
      'homeworkForm.courseIndex': index,
      'homeworkForm.courseName': courseName
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'homeworkForm.deadlineDate': e.detail.value
    })
  },

  // 编辑作业
  editHomework(e) {
    const homework = e.currentTarget.dataset.homework
    
    this.setData({
      showHomeworkModal: true,
      editingHomework: homework,
      homeworkForm: {
        title: homework.title,
        courseName: homework.courseName,
        courseIndex: this.data.courseOptions.indexOf(homework.courseName),
        deadlineDate: homework.deadline,
        submitFormat: homework.submitFormat,
        description: homework.description
      }
    })
  },

  // 保存作业
  saveHomework() {
    const { homeworkForm, editingHomework, homeworks } = this.data
    
    // 表单验证
    if (!homeworkForm.title || !homeworkForm.courseName || !homeworkForm.deadlineDate || !homeworkForm.submitFormat) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (editingHomework) {
      // 编辑现有作业
      const updatedHomeworks = homeworks.map(homework => {
        if (homework.id === editingHomework.id) {
          return {
            ...homework,
            title: homeworkForm.title,
            courseName: homeworkForm.courseName,
            deadline: homeworkForm.deadlineDate,
            submitFormat: homeworkForm.submitFormat,
            description: homeworkForm.description
          }
        }
        return homework
      })

      this.setData({
        homeworks: updatedHomeworks
      })

      wx.showToast({
        title: '作业更新成功',
        icon: 'success'
      })
    } else {
      // 添加新作业
      const newHomework = {
        id: Date.now().toString(),
        title: homeworkForm.title,
        courseName: homeworkForm.courseName,
        courseId: '1', // 模拟课程ID
        publishTime: new Date().toISOString().split('T')[0],
        deadline: homeworkForm.deadlineDate,
        submitFormat: homeworkForm.submitFormat,
        description: homeworkForm.description,
        submittedCount: 0,
        totalStudents: 60,
        isSubmitted: false,
        status: 'pending'
      }

      this.setData({
        homeworks: [...homeworks, newHomework]
      })

      wx.showToast({
        title: '作业发布成功',
        icon: 'success'
      })
    }

    this.hideHomeworkModal()
    this.filterHomeworks()
  },

  // 删除作业
  deleteHomework(e) {
    const homeworkId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个作业吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          const updatedHomeworks = this.data.homeworks.filter(homework => homework.id !== homeworkId)
          
          this.setData({
            homeworks: updatedHomeworks
          })
          
          this.filterHomeworks()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 查看作业详情
  viewHomeworkDetail(e) {
    const homeworkId = e.currentTarget.dataset.id
    
    // 跳转到作业详情页面
    wx.navigateTo({
      url: `/pages/homework-detail/homework-detail?id=${homeworkId}`
    })
  },

  // 提交作业（学生）
  submitHomework(e) {
    const homeworkId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '提交作业',
      content: '确定要提交这份作业吗？提交后不可修改。',
      success: (res) => {
        if (res.confirm) {
          // 模拟提交作业
          const updatedHomeworks = this.data.homeworks.map(homework => {
            if (homework.id === homeworkId) {
              return {
                ...homework,
                isSubmitted: true,
                status: 'submitted'
              }
            }
            return homework
          })
          
          this.setData({
            homeworks: updatedHomeworks
          })
          
          this.filterHomeworks()
          
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
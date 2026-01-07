// homework.js
Page({
  data: {
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
    statusOptions: ['全部状态', '未完成', '已完成', '已截止']
  },

  onLoad() {
    this.loadHomeworks()
  },

  onShow() {
    this.loadHomeworks()
  },

  // 加载作业数据
  loadHomeworks() {
    // 从本地存储读取作业数据
    try {
      const savedHomeworks = wx.getStorageSync('homeworks')
      if (savedHomeworks && savedHomeworks.length > 0) {
        // 转换数据格式以适配作业页面
        const convertedHomeworks = savedHomeworks.map(hw => ({
          id: hw.id.toString(),
          title: hw.title,
          courseName: hw.courseName,
          courseId: '1',
          publishTime: hw.createTime,
          deadline: hw.deadline,
          submitFormat: '文档',
          description: hw.description,
          isCompleted: false,
          isOverdue: hw.status === 'expired'
        }))

        this.setData({
          homeworks: convertedHomeworks,
          filteredHomeworks: convertedHomeworks
        })
        return
      }
    } catch (e) {
      console.error('读取作业数据失败:', e)
    }

    // 使用默认数据
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
        isCompleted: false,
        isOverdue: false
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
        isCompleted: true,
        isOverdue: false
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
        isCompleted: false,
        isOverdue: true
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
      if (selectedStatus === '未完成') {
        matchStatus = !homework.isCompleted && !homework.isOverdue
      } else if (selectedStatus === '已完成') {
        matchStatus = homework.isCompleted
      } else if (selectedStatus === '已截止') {
        matchStatus = homework.isOverdue
      }
      
      return matchSearch && matchCourse && matchStatus
    })

    this.setData({
      filteredHomeworks: filtered
    })
  },

  // 获取状态文本
  getStatusText(homework) {
    if (homework.isCompleted) {
      return '已完成'
    } else if (homework.isOverdue) {
      return '已截止'
    } else {
      return '未完成'
    }
  },

  // 获取状态类名
  getStatusClass(homework) {
    if (homework.isCompleted) {
      return 'completed'
    } else if (homework.isOverdue) {
      return 'overdue'
    } else {
      return 'pending'
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
        isCompleted: false,
        isOverdue: false
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
  completeHomework(e) {
    const homeworkId = e.currentTarget.dataset.id

    wx.showModal({
      title: '完成作业',
      content: '确定要完成这份作业吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedHomeworks = this.data.homeworks.map(homework => {
            if (homework.id === homeworkId) {
              return {
                ...homework,
                isCompleted: true
              }
            }
            return homework
          })

          this.setData({
            homeworks: updatedHomeworks
          })

          this.filterHomeworks()

          wx.showToast({
            title: '完成成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
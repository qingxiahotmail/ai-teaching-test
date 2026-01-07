// notice.js
const app = getApp()

Page({
  data: {
    notices: [],
    filteredNotices: [],
    searchKeyword: '',
    currentFilter: 'all',
    showNoticeModal: false,
    showAIModal: false,
    editingNotice: null,
    isTeacher: false,
    noticeForm: {
      title: '',
      type: '',
      typeIndex: 0,
      courseName: '',
      courseIndex: 0,
      isQuestion: false,
      content: ''
    },
    typeOptions: ['课程资源', '学习问答', '作业辅导', '知识点讲解'],
    courseOptions: ['不关联课程', '计算机科学导论', '数据结构与算法', '软件工程'],
    aiChatHistory: [],
    aiInput: '',
    aiLoading: false
  },

  onLoad() {
    this.loadNotices()
    this.updateTeacherStatus()
  },

  onShow() {
    this.loadNotices()
    this.updateTeacherStatus()
  },

  // 更新教师状态
  updateTeacherStatus() {
    try {
      const isTeacher = app.checkTeacherMode ? app.checkTeacherMode() : false
      console.log('问答页面教师状态:', isTeacher)
      this.setData({ isTeacher })
    } catch (e) {
      console.error('更新教师状态失败:', e)
      this.setData({ isTeacher: false })
    }
  },

  // 加载通知数据（从本地存储）
  loadNotices() {
    // 从本地存储获取通知数据
    const savedNotices = wx.getStorageSync('notices')

    // 如果本地没有数据，使用初始示例数据
    const initialNotices = [
      {
        id: '1',
        title: '如何理解算法的时间复杂度？',
        type: 'course',
        courseName: '数据结构与算法',
        content: '时间复杂度是衡量算法效率的重要指标。常见的时间复杂度有O(1)、O(log n)、O(n)、O(n log n)、O(n²)等。可以通过分析代码的循环次数来计算时间复杂度。',
        publishTime: '2024-11-15 10:30',
        isQuestion: true,
        isRead: false
      },
      {
        id: '2',
        title: '课程资源：数据结构学习资料',
        type: 'system',
        courseName: '',
        content: '为大家整理了数据结构与算法的学习资料，包括经典教材PDF、在线课程链接、练习题库等，欢迎下载学习。',
        publishTime: '2024-11-14 15:20',
        isQuestion: false,
        isRead: true
      },
      {
        id: '3',
        title: '递归算法的实现要点',
        type: 'course',
        courseName: '数据结构与算法',
        content: '递归算法需要明确两个要素：1）终止条件；2）递归过程。常见应用场景包括：树的遍历、快速排序、归并排序等。',
        publishTime: '2024-11-14 09:15',
        isQuestion: false,
        isRead: false
      },
      {
        id: '4',
        title: '软件需求分析的关键步骤',
        type: 'course',
        courseName: '软件工程',
        content: '需求分析包括需求获取、需求分析、需求规格说明、需求验证四个阶段。常用的需求获取方法有访谈、问卷调查、观察、原型法等。',
        publishTime: '2024-11-13 16:45',
        isQuestion: true,
        isRead: true
      }
    ]

    const notices = savedNotices || initialNotices

    // 如果是首次使用，保存初始数据到本地
    if (!savedNotices) {
      wx.setStorageSync('notices', initialNotices)
    }

    this.setData({
      notices: notices,
      filteredNotices: notices
    })
  },

  // 保存通知数据到本地存储
  saveNoticesToStorage() {
    wx.setStorageSync('notices', this.data.notices)
  },

  // 获取类型文本
  getTypeText(type) {
    const typeMap = {
      'system': '课程资源',
      'course': '学习问答',
      'homework': '作业辅导',
      'grade': '知识点讲解'
    }
    return typeMap[type] || '学习资料'
  },

  // 筛选切换
  changeFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter
    })
    this.filterNotices()
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterNotices()
  },

  // 筛选通知
  filterNotices() {
    const { notices, searchKeyword, currentFilter } = this.data
    
    let filtered = notices.filter(notice => {
      // 搜索筛选
      const matchSearch = searchKeyword === '' || 
        notice.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchKeyword.toLowerCase())
      
      // 状态筛选
      let matchFilter = true
      if (currentFilter === 'unread') {
        matchFilter = !notice.isRead
      } else if (currentFilter === 'question') {
        matchFilter = notice.isQuestion
      } else if (currentFilter === 'course') {
        matchFilter = notice.type === 'course'
      }
      
      return matchSearch && matchFilter
    })

    this.setData({
      filteredNotices: filtered
    })
  },

  // 查看通知详情
  viewNoticeDetail(e) {
    const noticeId = e.currentTarget.dataset.id
    const notice = this.data.notices.find(n => n.id === noticeId)

    if (notice && !notice.isRead) {
      // 标记为已读
      const updatedNotices = this.data.notices.map(n => {
        if (n.id === noticeId) {
          return { ...n, isRead: true }
        }
        return n
      })

      this.setData({
        notices: updatedNotices
      })

      // 保存到本地存储
      this.saveNoticesToStorage()

      this.filterNotices()
    }

    // 显示通知详情
    wx.showModal({
      title: notice.title,
      content: notice.content,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 显示添加通知模态框
  showAddNoticeModal() {
    this.setData({
      showNoticeModal: true,
      editingNotice: null,
  noticeForm: {
      title: '',
      type: '',
      typeIndex: 0,
      courseName: '',
      courseIndex: 0,
      isQuestion: false,
      content: ''
    }
    })
  },

  // 隐藏模态框
  hideNoticeModal() {
    this.setData({
      showNoticeModal: false
    })
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`noticeForm.${field}`]: value
    })
  },

  // 类型选择
  onTypeChange(e) {
    const index = parseInt(e.detail.value)
    const type = this.data.typeOptions[index]
    
    this.setData({
      'noticeForm.typeIndex': index,
      'noticeForm.type': type
    })
  },

  // 课程选择
  onCourseChange(e) {
    const index = parseInt(e.detail.value)
    const courseName = this.data.courseOptions[index]
    
    this.setData({
      'noticeForm.courseIndex': index,
      'noticeForm.courseName': index === 0 ? '' : courseName
    })
  },

  // 问题标记切换
  onQuestionChange(e) {
    this.setData({
      'noticeForm.isQuestion': e.detail.value.length > 0
    })
  },

  // 编辑通知
  editNotice(e) {
    const notice = e.currentTarget.dataset.notice
    
    this.setData({
      showNoticeModal: true,
      editingNotice: notice,
      noticeForm: {
        title: notice.title,
        type: notice.type,
        typeIndex: this.data.typeOptions.indexOf(this.getTypeText(notice.type)),
        courseName: notice.courseName,
        courseIndex: notice.courseName ? this.data.courseOptions.indexOf(notice.courseName) : 0,
        isQuestion: notice.isQuestion,
        content: notice.content
      }
    })
  },

  // 保存通知
  saveNotice() {
    const { noticeForm, editingNotice, notices } = this.data
    
    // 表单验证
    if (!noticeForm.title || !noticeForm.type || !noticeForm.content) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (editingNotice) {
      // 编辑现有通知
      const updatedNotices = notices.map(notice => {
        if (notice.id === editingNotice.id) {
          return {
            ...notice,
            title: noticeForm.title,
        type: noticeForm.type.toLowerCase(),
        courseName: noticeForm.courseName,
        isQuestion: noticeForm.isQuestion,
        content: noticeForm.content,
        publishTime: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        }
        return notice
      })

      this.setData({
        notices: updatedNotices
      })

      wx.showToast({
        title: '通知更新成功',
        icon: 'success'
      })
    } else {
      // 添加新通知
      const newNotice = {
        id: Date.now().toString(),
        title: noticeForm.title,
        type: noticeForm.type.toLowerCase(),
        courseName: noticeForm.courseName,
        content: noticeForm.content,
        publishTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isQuestion: noticeForm.isQuestion,
        isRead: false
      }

      this.setData({
        notices: [newNotice, ...notices]
      })

      wx.showToast({
        title: '通知发布成功',
        icon: 'success'
      })
    }

    // 保存到本地存储
    this.saveNoticesToStorage()

    this.hideNoticeModal()
    this.filterNotices()
  },

  // 删除通知
  deleteNotice(e) {
    const noticeId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个通知吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          const updatedNotices = this.data.notices.filter(notice => notice.id !== noticeId)

          this.setData({
            notices: updatedNotices
          })

          // 保存到本地存储
          this.saveNoticesToStorage()

          this.filterNotices()

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 显示AI助手
  showAIAssistant() {
    this.setData({ showAIModal: true })
  },

  // 隐藏AI助手
  hideAIAssistant() {
    this.setData({ showAIModal: false })
  },

  // AI输入
  onAIInput(e) {
    this.setData({
      aiInput: e.detail.value
    })
  },

  // 发送AI消息
  sendAIMessage() {
    const { aiInput, aiChatHistory } = this.data
    
    if (!aiInput.trim()) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      })
      return
    }

    // 添加用户消息
    const newHistory = [...aiChatHistory, {
      type: 'user',
      content: aiInput,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }]

    this.setData({
      aiChatHistory: newHistory,
      aiInput: '',
      aiLoading: true
    })

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(aiInput)
      const updatedHistory = [...newHistory, {
        type: 'ai',
        content: aiResponse,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }]

      this.setData({
        aiChatHistory: updatedHistory,
        aiLoading: false
      })
    }, 1500)
  },

  // 生成AI响应（模拟）
  generateAIResponse(question) {
    const responses = [
      '这是一个很好的问题！根据我的知识库，关于这个话题，我可以为您提供以下建议：首先，建议您从基础概念开始理解，然后通过实践来巩固知识。',
      '您的问题涉及到计算机科学的核心概念。我建议您可以先阅读相关教材的第一章，再做一些练习题来加深理解。',
      '这是一个常见的学习问题。我建议您可以从以下方面入手：1）理解基本原理；2）多做实践练习；3）与同学讨论交流。',
      '关于这个问题，我建议您可以从多个角度来思考。首先理解问题的本质，然后尝试不同的解决方案，最后总结经验教训。',
      '非常好的提问！在学习过程中，遇到困惑是正常的。建议您：1）查阅相关资料；2）向老师请教；3）和同学讨论。坚持就是胜利！',
      '这个问题确实有挑战性。根据我的理解，您可以从以下几个步骤来解决：分析问题、设计方案、实施验证、总结经验。'
    ]

    const keywords = [
      { key: '算法', response: '算法是解决问题的方法和步骤。常见的时间复杂度有O(1)、O(log n)、O(n)、O(n log n)、O(n²)等。建议您从基础算法开始学习，如排序、搜索等。' },
      { key: '数据结构', response: '数据结构是计算机存储、组织数据的方式。常见的数据结构包括：数组、链表、栈、队列、树、图等。选择合适的数据结构对程序性能至关重要。' },
      { key: '递归', response: '递归是一种函数调用自身的编程技巧。使用递归需要明确两个要素：1）终止条件；2）递归过程。常见应用包括树的遍历、快速排序等。' },
      { key: '时间复杂度', response: '时间复杂度是衡量算法执行时间随输入规模增长的度量。常用大O表示法表示，如O(n)表示线性时间复杂度。' },
      { key: '排序', response: '排序是计算机科学中的基本问题。常见的排序算法包括：冒泡排序、选择排序、插入排序、快速排序、归并排序等。其中快速排序和归并排序是高效的排序算法。' }
    ]

    // 检查关键词匹配
    for (const item of keywords) {
      if (question.includes(item.key)) {
        return item.response
      }
    }

    // 随机返回通用响应
    const randomIndex = Math.floor(Math.random() * responses.length)
    return responses[randomIndex]
  },

  // 清空AI聊天记录
  clearAIChat() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            aiChatHistory: []
          })
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 清空所有通知（管理员功能）
  clearAllNotices() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有通知吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            notices: [],
            filteredNotices: []
          })

          wx.removeStorageSync('notices')

          wx.showToast({
            title: '已清空所有通知',
            icon: 'success'
          })
        }
      }
    })
  }
})
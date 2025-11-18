// notice.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    notices: [],
    filteredNotices: [],
    searchKeyword: '',
    currentFilter: 'all',
    showNoticeModal: false,
    editingNotice: null,
    noticeForm: {
      title: '',
      type: '',
      typeIndex: 0,
      courseName: '',
      courseIndex: 0,
      isImportant: false,
      content: ''
    },
    typeOptions: ['系统通知', '课程通知', '作业提醒', '成绩发布'],
    courseOptions: ['不关联课程', '计算机科学导论', '数据结构与算法', '软件工程']
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.loadNotices()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 加载通知数据
  loadNotices() {
    // 模拟通知数据
    const mockNotices = [
      {
        id: '1',
        title: '关于期末考试的安排通知',
        type: 'course',
        courseName: '计算机科学导论',
        content: '本学期期末考试将于2024年12月20日举行，请同学们提前做好准备。考试地点为教学楼A301。',
        sender: '张老师',
        publishTime: '2024-11-15 10:30',
        isImportant: true,
        isRead: false
      },
      {
        id: '2',
        title: '系统维护通知',
        type: 'system',
        courseName: '',
        content: '为了提供更好的服务，本系统将于2024年11月20日 02:00-04:00进行维护，期间可能无法正常使用。',
        sender: '系统管理员',
        publishTime: '2024-11-14 15:20',
        isImportant: false,
        isRead: true
      },
      {
        id: '3',
        title: '作业提交截止提醒',
        type: 'course',
        courseName: '数据结构与算法',
        content: '实验二：数据结构实现的提交截止时间为2024年11月25日 23:59，请尚未提交的同学抓紧时间。',
        sender: '李老师',
        publishTime: '2024-11-14 09:15',
        isImportant: false,
        isRead: false
      },
      {
        id: '4',
        title: '期中成绩已发布',
        type: 'course',
        courseName: '软件工程',
        content: '期中考试成绩已发布，请同学们登录系统查看。如有疑问请及时联系任课教师。',
        sender: '王老师',
        publishTime: '2024-11-13 16:45',
        isImportant: true,
        isRead: true
      }
    ]

    this.setData({
      notices: mockNotices,
      filteredNotices: mockNotices
    })
  },

  // 获取类型文本
  getTypeText(type) {
    const typeMap = {
      'system': '系统通知',
      'course': '课程通知',
      'homework': '作业提醒',
      'grade': '成绩发布'
    }
    return typeMap[type] || '通知'
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
      } else if (currentFilter === 'important') {
        matchFilter = notice.isImportant
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
        isImportant: false,
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

  // 重要通知切换
  onImportantChange(e) {
    this.setData({
      'noticeForm.isImportant': e.detail.value.length > 0
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
        isImportant: notice.isImportant,
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
            isImportant: noticeForm.isImportant,
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
        sender: this.data.userInfo.name,
        publishTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isImportant: noticeForm.isImportant,
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
          
          this.filterNotices()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})
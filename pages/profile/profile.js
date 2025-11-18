Page({
  data: {
    userInfo: {
      name: '',
      title: '',
      teacherId: '',
      avatar: ''
    },
    stats: {
      courseCount: 0,
      studentCount: 0,
      homeworkCount: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  loadUserInfo() {
    // 从本地存储或服务器获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {
      name: '教师用户',
      title: '讲师',
      teacherId: 'T001',
      avatar: '/images/avatar-default.png'
    }
    this.setData({ userInfo })
  },

  loadStats() {
    // 模拟加载统计数据
    const stats = {
      courseCount: 5,
      studentCount: 120,
      homeworkCount: 25
    }
    this.setData({ stats })
  },

  onMenuTap(e) {
    const page = e.currentTarget.dataset.page
    const pageMap = {
      course: '/pages/course/course',
      student: '/pages/student/student',
      homework: '/pages/homework/homework',
      grade: '/pages/grade/grade'
    }

    if (pageMap[page]) {
      wx.switchTab({
        url: pageMap[page]
      })
    }
  },

  onEditProfile() {
    wx.showModal({
      title: '编辑资料',
      content: '功能开发中...',
      showCancel: false
    })
  },

  onSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  onHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    })
  },

  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: '课程助教小程序 v1.0\n\n一个专为教师设计的课程管理工具，帮助教师更好地管理课程、学生和作业。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          // 跳转到登录页面
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})
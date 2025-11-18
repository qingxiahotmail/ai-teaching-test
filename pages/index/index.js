// index.js
const app = getApp()

Page({
  data: {
    isLogin: false,
    userInfo: null,
    stats: {
      courseCount: 0,
      studentCount: 0,
      homeworkCount: 0
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLogin) {
      this.loadStats()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = app.globalData.userInfo
    this.setData({
      isLogin: !!userInfo,
      userInfo: userInfo
    })
  },

  // 加载统计数据
  loadStats() {
    if (this.data.userInfo?.role === 'teacher') {
      // 模拟加载统计数据
      setTimeout(() => {
        this.setData({
          stats: {
            courseCount: 5,
            studentCount: 120,
            homeworkCount: 8
          }
        })
      }, 500)
    }
  },

  // 以教师身份登录
  loginAsTeacher() {
    wx.showLoading({
      title: '登录中...'
    })

    const userInfo = {
      name: '张老师',
      role: 'teacher',
      avatar: '/images/teacher_avatar.png',
      id: 'T001'
    }

    app.login(userInfo).then(() => {
      wx.hideLoading()
      this.setData({
        isLogin: true,
        userInfo: userInfo
      })
      this.loadStats()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
      console.error('登录失败:', err)
    })
  },

  // 以学生身份登录
  loginAsStudent() {
    wx.showLoading({
      title: '登录中...'
    })

    const userInfo = {
      name: '李同学',
      role: 'student',
      avatar: '/images/student_avatar.png',
      id: 'S001',
      class: '计算机科学与技术1班'
    }

    app.login(userInfo).then(() => {
      wx.hideLoading()
      this.setData({
        isLogin: true,
        userInfo: userInfo
      })
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
      console.error('登录失败:', err)
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
        }
      }
    })
  },

  // 跳转到设置页面
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.isLogin) {
      this.loadStats()
    }
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
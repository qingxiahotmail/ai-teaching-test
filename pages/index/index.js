// index.js
const app = getApp()

Page({
  data: {
    isTeacher: false,
    stats: {
      courseCount: 12,
      homeworkCount: 45,
      completedCount: 38
    },
    recentCourses: []
  },

  onLoad(options) {
    console.log('首页 onLoad', options)
    this.initPage()
  },

  onShow() {
    console.log('首页 onShow')
    this.updateTeacherStatus()
  },

  // 初始化页面
  initPage() {
    this.updateTeacherStatus()
    this.loadStats()
    this.loadRecentCourses()
  },

  // 更新教师状态
  updateTeacherStatus() {
    try {
      const isTeacher = app.checkTeacherMode ? app.checkTeacherMode() : false
      console.log('当前教师状态:', isTeacher)
      this.setData({ isTeacher })
    } catch (e) {
      console.error('更新教师状态失败:', e)
      this.setData({ isTeacher: false })
    }
  },

  // 加载统计数据
  loadStats() {
    // 模拟异步加载
    setTimeout(() => {
      this.setData({
        stats: {
          courseCount: 12,
          homeworkCount: 45,
          completedCount: 38
        }
      })
      console.log('统计数据加载完成')
    }, 100)
  },

  // 加载最近课程
  loadRecentCourses() {
    const courses = [
      {
        id: 1,
        name: '计算机科学导论',
        cover: '/images/tab_course.png',
        progress: 85
      },
      {
        id: 2,
        name: '数据结构与算法',
        cover: '/images/tab_course.png',
        progress: 60
      },
      {
        id: 3,
        name: '软件工程',
        cover: '/images/tab_course.png',
        progress: 45
      }
    ]
    this.setData({ recentCourses: courses })
    console.log('最近课程加载完成', courses)
  },

  // 导航到课程
  navigateToCourse(e) {
    wx.switchTab({
      url: '/pages/course/course',
      fail: (err) => {
        console.error('跳转课程页面失败:', err)
      }
    })
  },

  // 导航到作业
  navigateToHomework() {
    wx.switchTab({
      url: '/pages/homework/homework',
      fail: (err) => {
        console.error('跳转作业页面失败:', err)
      }
    })
  },

  // 导航到问答
  navigateToNotice() {
    wx.switchTab({
      url: '/pages/notice/notice',
      fail: (err) => {
        console.error('跳转问答页面失败:', err)
      }
    })
  },

  // 导航到成绩
  navigateToGrade() {
    wx.switchTab({
      url: '/pages/grade/grade',
      fail: (err) => {
        console.error('跳转成绩页面失败:', err)
      }
    })
  },

  // 切换教师模式
  toggleTeacherMode() {
    const { isTeacher } = this.data

    if (isTeacher) {
      // 退出教师模式
      try {
        if (app.exitTeacherMode) {
          app.exitTeacherMode()
        }
        this.setData({ isTeacher: false })
      } catch (e) {
        console.error('退出教师模式失败:', e)
      }
    } else {
      // 进入教师模式
      wx.showModal({
        title: '教师验证',
        content: '请输入教师验证码',
        editable: true,
        placeholderText: '请输入验证码',
        success: (res) => {
          if (res.confirm && res.content) {
            try {
              if (app.setTeacherMode && app.setTeacherMode(res.content)) {
                this.setData({ isTeacher: true })
              }
            } catch (e) {
              console.error('设置教师模式失败:', e)
            }
          }
        }
      })
    }
  },

  // 导航到课程管理
  navigateToCourseManage() {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/course-manage/course-manage',
      fail: (err) => {
        console.error('跳转课程管理失败:', err)
      }
    })
  },

  // 导航到作业管理
  navigateToHomeworkManage() {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/homework-manage/homework-manage',
      fail: (err) => {
        console.error('跳转作业管理失败:', err)
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新')
    this.initPage()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '课程助教 - 开放式学习平台',
      path: '/pages/index/index'
    }
  }
})

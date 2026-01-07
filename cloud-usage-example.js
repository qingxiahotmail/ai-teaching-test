/**
 * 云开发使用示例代码
 * 展示如何在小程序页面中调用云函数和操作数据库
 */

// ==================== 1. 调用云函数示例 ====================

/**
 * 示例1：用户登录
 */
function userLogin(userInfo) {
  wx.cloud.callFunction({
    name: 'login',
    data: {
      userInfo: userInfo
    }
  }).then(res => {
    if (res.result.success) {
      console.log('登录成功:', res.result.data)
      wx.setStorageSync('userInfo', res.result.data)
    }
  }).catch(err => {
    console.error('登录失败:', err)
    wx.showToast({
      title: '登录失败',
      icon: 'none'
    })
  })
}

/**
 * 示例2：获取课程列表
 */
function getCourses(keyword, status) {
  const userInfo = wx.getStorageSync('userInfo')

  wx.cloud.callFunction({
    name: 'getCourses',
    data: {
      userId: userInfo._id,
      role: userInfo.role,
      keyword: keyword || '',
      status: status || 'all'
    }
  }).then(res => {
    if (res.result.success) {
      console.log('课程列表:', res.result.data)
      this.setData({
        courses: res.result.data
      })
    }
  }).catch(err => {
    console.error('获取课程失败:', err)
  })
}

/**
 * 示例3：保存课程
 */
function saveCourse(courseData, courseId = null) {
  const userInfo = wx.getStorageSync('userInfo')

  wx.cloud.callFunction({
    name: 'saveCourse',
    data: {
      courseId: courseId,
      courseData: courseData,
      userId: userInfo._id
    }
  }).then(res => {
    if (res.result.success) {
      console.log('保存成功:', res.result.data)
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  }).catch(err => {
    console.error('保存失败:', err)
    wx.showToast({
      title: '保存失败',
      icon: 'none'
    })
  })
}

// ==================== 2. 直接操作数据库示例 ====================

/**
 * 示例4：添加文档（直接操作数据库）
 */
function addDocument() {
  const db = wx.cloud.database()

  db.collection('courses').add({
    data: {
      name: '新课程',
      code: 'CS001',
      createTime: new Date()
    }
  }).then(res => {
    console.log('添加成功，ID:', res._id)
  }).catch(err => {
    console.error('添加失败:', err)
  })
}

/**
 * 示例5：查询文档
 */
function queryDocuments() {
  const db = wx.cloud.database()

  db.collection('courses')
    .where({
      status: 'active'
    })
    .orderBy('createTime', 'desc')
    .limit(10)
    .get()
    .then(res => {
      console.log('查询结果:', res.data)
    })
    .catch(err => {
      console.error('查询失败:', err)
    })
}

/**
 * 示例6：更新文档
 */
function updateDocument(courseId) {
  const db = wx.cloud.database()

  db.collection('courses').doc(courseId).update({
    data: {
      name: '更新后的课程名称',
      updateTime: new Date()
    }
  }).then(res => {
    console.log('更新成功')
  }).catch(err => {
    console.error('更新失败:', err)
  })
}

/**
 * 示例7：删除文档
 */
function deleteDocument(courseId) {
  const db = wx.cloud.database()

  db.collection('courses').doc(courseId).remove()
    .then(res => {
      console.log('删除成功')
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    })
    .catch(err => {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    })
}

// ==================== 3. 文件上传示例 ====================

/**
 * 示例8：上传图片
 */
function uploadImage(filePath) {
  const cloudPath = `avatars/${Date.now()}.jpg`

  wx.cloud.uploadFile({
    cloudPath: cloudPath,
    filePath: filePath
  }).then(res => {
    console.log('上传成功，文件ID:', res.fileID)

    // 获取文件下载链接
    wx.cloud.getTempFileURL({
      fileList: [res.fileID]
    }).then(urlRes => {
      console.log('下载链接:', urlRes.fileList[0].tempFileURL)
    })
  }).catch(err => {
    console.error('上传失败:', err)
  })
}

/**
 * 示例9：选择并上传图片
 */
function chooseAndUploadImage() {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const filePath = res.tempFilePaths[0]
      uploadImage(filePath)
    }
  })
}

// ==================== 4. 在页面中使用 ====================

/**
 * 在小程序页面中使用云开发的完整示例
 */
Page({
  data: {
    courses: [],
    loading: false
  },

  onLoad() {
    this.loadCourses()
  },

  /**
   * 加载课程列表
   */
  loadCourses() {
    this.setData({ loading: true })

    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    // 方法1：使用云函数（推荐）
    wx.cloud.callFunction({
      name: 'getCourses',
      data: {
        userId: userInfo._id,
        role: userInfo.role
      }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          courses: res.result.data,
          loading: false
        })
      }
    }).catch(err => {
      console.error('加载失败:', err)
      this.setData({ loading: false })
    })

    // 方法2：直接操作数据库
    /*
    const db = wx.cloud.database()
    db.collection('courses')
      .where({ teacherId: userInfo._id })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        this.setData({
          courses: res.data,
          loading: false
        })
      })
    */
  },

  /**
   * 添加课程
   */
  addCourse() {
    const courseData = {
      name: '新课程',
      code: 'CS' + Date.now(),
      credits: 3,
      semester: '秋季学期',
      year: '2024-2025',
      schedule: '周一 1-2节'
    }

    wx.showLoading({ title: '保存中...' })

    wx.cloud.callFunction({
      name: 'saveCourse',
      data: {
        courseData: courseData,
        userId: wx.getStorageSync('userInfo')._id
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showToast({ title: '添加成功', icon: 'success' })
        this.loadCourses() // 重新加载列表
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '添加失败', icon: 'none' })
    })
  },

  /**
   * 删除课程
   */
  deleteCourse(e) {
    const courseId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个课程吗？',
      success: (res) => {
        if (res.confirm) {
          const db = wx.cloud.database()

          db.collection('courses').doc(courseId).remove()
            .then(() => {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadCourses()
            })
            .catch(err => {
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
        }
      }
    })
  }
})

// ==================== 5. 最佳实践 ====================

/**
 * 最佳实践1：统一封装云函数调用
 */
const cloudAPI = {
  // 用户相关
  login: (userInfo) => wx.cloud.callFunction({ name: 'login', data: { userInfo } }),

  // 课程相关
  getCourses: (params) => wx.cloud.callFunction({ name: 'getCourses', data: params }),
  saveCourse: (params) => wx.cloud.callFunction({ name: 'saveCourse', data: params }),

  // 学生相关
  getStudents: (params) => wx.cloud.callFunction({ name: 'getStudents', data: params }),
  saveStudent: (params) => wx.cloud.callFunction({ name: 'saveStudent', data: params }),

  // 作业相关
  getHomeworks: (params) => wx.cloud.callFunction({ name: 'getHomeworks', data: params }),
  saveHomework: (params) => wx.cloud.callFunction({ name: 'saveHomework', data: params })
}

/**
 * 最佳实践2：统一错误处理
 */
function handleCloudRequest(promise, successMsg = '操作成功') {
  return promise
    .then(res => {
      if (res.result && res.result.success) {
        wx.showToast({
          title: successMsg,
          icon: 'success'
        })
        return res.result.data
      } else {
        throw new Error(res.result?.error || '操作失败')
      }
    })
    .catch(err => {
      console.error('请求失败:', err)
      wx.showToast({
        title: err.message || '请求失败',
        icon: 'none'
      })
      throw err
    })
}

/**
 * 最佳实践3：使用示例
 */
async function loadData() {
  try {
    wx.showLoading({ title: '加载中...' })

    const courses = await handleCloudRequest(
      cloudAPI.getCourses({ role: 'teacher' }),
      '加载成功'
    )

    this.setData({ courses })
  } catch (err) {
    // 错误已在 handleCloudRequest 中处理
  } finally {
    wx.hideLoading()
  }
}

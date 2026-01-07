// 云函数：获取课程列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 云函数：获取课程列表
 */
exports.main = async (event, context) => {
  const { userId, role, keyword, status } = event

  try {
    let query = db.collection('courses')

    // 根据角色筛选
    if (role === 'teacher') {
      query = query.where({ teacherId: userId })
    } else {
      // 学生获取已加入的课程
      query = query.where({
        students: userId
      })
    }

    // 关键词搜索
    if (keyword) {
      query = query.where({
        name: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.where({ status })
    }

    const res = await query
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data: res.data
    }
  } catch (err) {
    console.error('获取课程列表失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

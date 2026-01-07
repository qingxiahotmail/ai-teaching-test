// 云函数：添加/编辑课程
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 云函数：添加/编辑课程
 */
exports.main = async (event, context) => {
  const { courseId, courseData, userId } = event

  try {
    if (courseId) {
      // 编辑课程
      const res = await db.collection('courses').doc(courseId).update({
        data: {
          ...courseData,
          updateTime: new Date()
        }
      })

      return {
        success: true,
        data: { _id: courseId, ...courseData }
      }
    } else {
      // 添加新课程
      const res = await db.collection('courses').add({
        data: {
          ...courseData,
          teacherId: userId,
          students: [],
          createTime: new Date(),
          updateTime: new Date()
        }
      })

      return {
        success: true,
        data: { _id: res._id, ...courseData }
      }
    }
  } catch (err) {
    console.error('保存课程失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

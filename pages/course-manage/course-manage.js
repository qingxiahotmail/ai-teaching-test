// course-manage.js
const app = getApp()

Page({
  data: {
    isTeacher: false,
    courses: [],
    showAddModal: false,
    editingCourse: null,
    showMaterialsModal: false,
    currentCourse: null,
    formData: {
      name: '',
      description: '',
      category: '',
      tags: '',
      materials: ''
    },
    materialsList: [],
    categories: ['计算机', '数学', '物理', '化学', '生物', '其他']
  },

  onLoad() {
    this.setData({ isTeacher: app.checkTeacherMode() })
    this.loadCourses()
  },

  onShow() {
    this.setData({ isTeacher: app.checkTeacherMode() })
    if (this.data.isTeacher) {
      this.loadCourses()
    }
  },

  // 加载课程列表
  loadCourses() {
    // 从本地存储读取课程数据
    try {
      const savedCourses = wx.getStorageSync('courses')
      if (savedCourses && savedCourses.length > 0) {
        this.setData({ courses: savedCourses })
        return
      }
    } catch (e) {
      console.error('读取课程数据失败:', e)
    }

    // 使用默认数据
    const mockCourses = [
      {
        id: 1,
        name: '计算机科学导论',
        description: '介绍计算机科学的基本概念和原理',
        category: '计算机',
        tags: ['入门', '基础'],
        createTime: '2024-01-15',
        status: 'active'
      },
      {
        id: 2,
        name: '数据结构与算法',
        description: '深入学习常见数据结构和算法设计',
        category: '计算机',
        tags: ['进阶', '算法'],
        createTime: '2024-01-10',
        status: 'active'
      },
      {
        id: 3,
        name: '高等数学',
        description: '微积分和线性代数基础',
        category: '数学',
        tags: ['基础', '计算'],
        createTime: '2024-01-05',
        status: 'active'
      }
    ]
    this.setData({ courses: mockCourses })
    this.saveCoursesToStorage(mockCourses)
  },

  // 保存课程到本地存储
  saveCoursesToStorage(courses) {
    try {
      wx.setStorageSync('courses', courses)
    } catch (e) {
      console.error('保存课程数据失败:', e)
    }
  },

  // 保存课程资料到本地存储
  saveCourseMaterialsToStorage(courseId, materials) {
    try {
      const key = `course_materials_${courseId}`
      wx.setStorageSync(key, materials)
    } catch (e) {
      console.error('保存课程资料失败:', e)
    }
  },

  // 加载课程资料
  loadCourseMaterials(courseId) {
    try {
      const key = `course_materials_${courseId}`
      const materials = wx.getStorageSync(key)
      return materials || []
    } catch (e) {
      console.error('读取课程资料失败:', e)
      return []
    }
  },

  // 搜索课程
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    if (!keyword) {
      this.loadCourses()
      return
    }
    
    const filtered = this.data.courses.filter(course => 
      course.name.toLowerCase().includes(keyword) ||
      course.description.toLowerCase().includes(keyword) ||
      course.category.toLowerCase().includes(keyword)
    )
    this.setData({ courses: filtered })
  },

  // 显示添加课程模态框
  showAddCourseModal() {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    this.setData({
      showAddModal: true,
      editingCourse: null,
      formData: {
        name: '',
        description: '',
        category: '',
        tags: '',
        materials: ''
      }
    })
  },

  // 隐藏模态框
  hideModal() {
    this.setData({ showAddModal: false })
  },

  // 显示课程资料管理
  showMaterialsModal(e) {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    const course = e.currentTarget.dataset.course
    const materials = this.loadCourseMaterials(course.id)
    this.setData({
      showMaterialsModal: true,
      currentCourse: course,
      materialsList: materials
    })
  },

  // 隐藏资料管理模态框
  hideMaterialsModal() {
    this.setData({ showMaterialsModal: false })
  },

  // 添加课程资料
  addMaterial() {
    wx.showModal({
      title: '添加资料',
      editable: true,
      placeholderText: '请输入资料名称',
      success: (res) => {
        if (res.confirm && res.content) {
          const materialName = res.content

          // 第二步：输入资料链接
          wx.showModal({
            title: '添加资料链接',
            editable: true,
            placeholderText: '请输入云盘链接或网址（如：百度网盘、阿里云盘等）',
            success: (urlRes) => {
              if (urlRes.confirm) {
                const newMaterial = {
                  id: Date.now(),
                  name: materialName,
                  url: urlRes.content || '',
                  createTime: new Date().toISOString().split('T')[0],
                  type: urlRes.content ? 'link' : 'file'
                }
                const updated = [...this.data.materialsList, newMaterial]
                this.setData({ materialsList: updated })
                this.saveCourseMaterialsToStorage(this.data.currentCourse.id, updated)
                wx.showToast({
                  title: '添加成功',
                  icon: 'success'
                })
              }
            }
          })
        }
      }
    })
  },

  // 删除课程资料
  deleteMaterial(e) {
    const materialId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个资料吗？',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.materialsList.filter(m => m.id !== materialId)
          this.setData({ materialsList: updated })
          this.saveCourseMaterialsToStorage(this.data.currentCourse.id, updated)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 编辑课程资料
  editMaterial(e) {
    const materialId = e.currentTarget.dataset.id
    const material = this.data.materialsList.find(m => m.id === materialId)
    if (!material) return

    wx.showModal({
      title: '编辑资料',
      editable: true,
      placeholderText: '请输入资料名称',
      content: material.name,
      success: (res) => {
        if (res.confirm && res.content) {
          // 第二步：编辑资料链接
          wx.showModal({
            title: '编辑资料链接',
            editable: true,
            placeholderText: '请输入云盘链接或网址',
            content: material.url,
            success: (urlRes) => {
              if (urlRes.confirm) {
                // 无论是确认（有内容）还是确认（内容为空）都保存
                const newUrl = urlRes.content !== undefined ? urlRes.content : material.url
                const newName = res.content

                const updated = this.data.materialsList.map(m => {
                  if (m.id === materialId) {
                    return {
                      ...m,
                      name: newName,
                      url: newUrl,
                      type: newUrl ? 'link' : 'file'
                    }
                  }
                  return m
                })

                this.setData({ materialsList: updated })
                this.saveCourseMaterialsToStorage(this.data.currentCourse.id, updated)

                wx.showToast({
                  title: '编辑成功',
                  icon: 'success'
                })
              }
            }
          })
        }
      }
    })
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.category': this.data.categories[index]
    })
  },

  // 编辑课程
  editCourse(e) {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    const course = e.currentTarget.dataset.course
    this.setData({
      showAddModal: true,
      editingCourse: course,
      formData: {
        name: course.name,
        description: course.description,
        category: course.category,
        tags: course.tags.join(',')
      }
    })
  },

  // 点击打开资料链接
  openMaterialLink(e) {
    const material = e.currentTarget.dataset.material
    if (!material || !material.url) {
      wx.showToast({
        title: '暂无链接',
        icon: 'none'
      })
      return
    }

    // 检查是否为完整URL
    let url = material.url.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      wx.showToast({
        title: '无效的链接地址',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '打开链接',
      content: `确定要打开以下链接吗？\n\n${url}`,
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showModal({
                title: '提示',
                content: '链接已复制到剪贴板\n请在浏览器中打开',
                showCancel: false
              })
            }
          })
        }
      }
    })
  },

  // 保存课程
  saveCourse() {
    const { formData, editingCourse, courses } = this.data
    
    if (!formData.name || !formData.description || !formData.category) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      })
      return
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)

    if (editingCourse) {
      // 编辑现有课程
      const updated = courses.map(course => {
        if (course.id === editingCourse.id) {
          return {
            ...course,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            tags: tagsArray
          }
        }
        return course
      })
      this.setData({ courses: updated })
      this.saveCoursesToStorage(updated)
      wx.showToast({ title: '更新成功', icon: 'success' })
    } else {
      // 添加新课程
      const newCourse = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: tagsArray,
        createTime: new Date().toISOString().split('T')[0],
        status: 'active'
      }
      const updated = [newCourse, ...courses]
      this.setData({ courses: updated })
      this.saveCoursesToStorage(updated)
      wx.showToast({ title: '添加成功', icon: 'success' })
    }

    this.hideModal()
  },

  // 删除课程
  deleteCourse(e) {
    if (!this.data.isTeacher) {
      wx.showToast({
        title: '请先进入教师模式',
        icon: 'none'
      })
      return
    }
    
    const courseId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个课程吗？',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.courses.filter(c => c.id !== courseId)
          this.setData({ courses: updated })
          this.saveCoursesToStorage(updated)
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  // 切换课程状态
  toggleStatus(e) {
    if (!this.data.isTeacher) return

    const courseId = e.currentTarget.dataset.id
    const updated = this.data.courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          status: course.status === 'active' ? 'archived' : 'active'
        }
      }
      return course
    })
    this.setData({ courses: updated })
    this.saveCoursesToStorage(updated)
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})

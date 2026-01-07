// course.js
const app = getApp()

Page({
  data: {
    courses: [],
    filteredCourses: [],
    searchKeyword: '',
    currentFilter: 'all',
    showCourseModal: false,
    editingCourse: null,
    courseForm: {
      name: '',
      code: '',
      credits: '',
      semester: '',
      semesterIndex: 0,
      year: '',
      schedule: ''
    },
    semesterOptions: ['春季学期', '夏季学期', '秋季学期', '冬季学期']
  },

  onLoad() {
    this.loadCourses()
  },

  onShow() {
    this.loadCourses()
  },

  // 加载课程数据
  loadCourses() {
    // 从本地存储读取课程数据
    try {
      const savedCourses = wx.getStorageSync('courses')
      if (savedCourses && savedCourses.length > 0) {
        // 转换数据格式以适配课程资源页面
        const convertedCourses = savedCourses.map(course => {
          // 读取该课程资料
          let materials = []
          try {
            const key = `course_materials_${course.id}`
            materials = wx.getStorageSync(key) || []
          } catch (e) {
            console.error('读取课程资料失败:', e)
          }

          return {
            id: course.id.toString(),
            name: course.name,
            code: course.category || 'COURSE',
            credits: 3,
            semester: '秋季学期',
            year: '2024-2025',
            schedule: '',
            studentCount: 0,
            status: course.status,
            teacher: '教师',
            description: course.description,
            tags: course.tags || [],
            category: course.category,
            materials: materials, // 添加课程资料
            materialsCount: materials.length // 资料数量
          }
        })

        this.setData({
          courses: convertedCourses,
          filteredCourses: convertedCourses
        })
        return
      }
    } catch (e) {
      console.error('读取课程数据失败:', e)
    }

    // 使用默认数据
    const mockCourses = [
      {
        id: '1',
        name: '计算机科学导论',
        code: 'CS101',
        credits: 3,
        semester: '秋季学期',
        year: '2024-2025',
        schedule: '周一 1-2节',
        studentCount: 60,
        status: 'active',
        teacher: '张老师'
      },
      {
        id: '2',
        name: '数据结构与算法',
        code: 'CS201',
        credits: 4,
        semester: '秋季学期',
        year: '2024-2025',
        schedule: '周三 3-4节',
        studentCount: 45,
        status: 'active',
        teacher: '李老师'
      },
      {
        id: '3',
        name: '软件工程',
        code: 'CS301',
        credits: 3,
        semester: '春季学期',
        year: '2023-2024',
        schedule: '周五 5-6节',
        studentCount: 50,
        status: 'ended',
        teacher: '王老师'
      }
    ]

    this.setData({
      courses: mockCourses,
      filteredCourses: mockCourses
    })
  },

  // 打开课程资料链接
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

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterCourses()
  },

  // 切换筛选
  changeFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter
    })
    this.filterCourses()
  },

  // 筛选课程
  filterCourses() {
    const { courses, searchKeyword, currentFilter } = this.data
    
    let filtered = courses.filter(course => {
      // 搜索筛选
      const matchSearch = searchKeyword === '' || 
        course.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        course.code.toLowerCase().includes(searchKeyword.toLowerCase())
      
      // 状态筛选
      const matchFilter = currentFilter === 'all' || course.status === currentFilter
      
      return matchSearch && matchFilter
    })

    this.setData({
      filteredCourses: filtered
    })
  },

  // 显示添加课程模态框
  showAddCourseModal() {
    this.setData({
      showCourseModal: true,
      editingCourse: null,
      courseForm: {
        name: '',
        code: '',
        credits: '',
        semester: '',
        semesterIndex: 0,
        year: '',
        schedule: ''
      }
    })
  },

  // 隐藏模态框
  hideCourseModal() {
    this.setData({
      showCourseModal: false
    })
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`courseForm.${field}`]: value
    })
  },

  // 学期选择
  onSemesterChange(e) {
    const index = parseInt(e.detail.value)
    const semester = this.data.semesterOptions[index]
    
    this.setData({
      'courseForm.semesterIndex': index,
      'courseForm.semester': semester
    })
  },

  // 编辑课程
  editCourse(e) {
    const course = e.currentTarget.dataset.course
    
    this.setData({
      showCourseModal: true,
      editingCourse: course,
      courseForm: {
        name: course.name,
        code: course.code,
        credits: course.credits.toString(),
        semester: course.semester,
        semesterIndex: this.data.semesterOptions.indexOf(course.semester),
        year: course.year,
        schedule: course.schedule
      }
    })
  },

  // 保存课程
  saveCourse() {
    const { courseForm, editingCourse, courses } = this.data
    
    // 表单验证
    if (!courseForm.name || !courseForm.code || !courseForm.credits || 
        !courseForm.semester || !courseForm.year || !courseForm.schedule) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (editingCourse) {
      // 编辑现有课程
      const updatedCourses = courses.map(course => {
        if (course.id === editingCourse.id) {
          return {
            ...course,
            name: courseForm.name,
            code: courseForm.code,
            credits: parseInt(courseForm.credits),
            semester: courseForm.semester,
            year: courseForm.year,
            schedule: courseForm.schedule
          }
        }
        return course
      })

      this.setData({
        courses: updatedCourses
      })

      wx.showToast({
        title: '课程更新成功',
        icon: 'success'
      })
    } else {
      // 添加新课程
      const newCourse = {
        id: Date.now().toString(),
        name: courseForm.name,
        code: courseForm.code,
        credits: parseInt(courseForm.credits),
        semester: courseForm.semester,
        year: courseForm.year,
        schedule: courseForm.schedule,
        studentCount: 0,
        status: 'active',
        teacher: '教师'
      }

      this.setData({
        courses: [...courses, newCourse]
      })

      wx.showToast({
        title: '课程添加成功',
        icon: 'success'
      })
    }

    this.hideCourseModal()
    this.filterCourses()
  },

  // 删除课程
  deleteCourse(e) {
    const courseId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个课程吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          const updatedCourses = this.data.courses.filter(course => course.id !== courseId)
          
          this.setData({
            courses: updatedCourses
          })
          
          this.filterCourses()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 查看课程详情
  viewCourseDetail(e) {
    const courseId = e.currentTarget.dataset.id
    
    // 跳转到课程详情页面
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  }
})
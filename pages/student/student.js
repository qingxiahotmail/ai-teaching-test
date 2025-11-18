Page({
  data: {
    students: [],
    searchKeyword: '',
    showAddModal: false,
    editingStudent: null,
    formData: {
      name: '',
      studentId: '',
      class: '',
      phone: '',
      email: ''
    }
  },

  onLoad() {
    this.loadStudents()
  },

  onShow() {
    this.loadStudents()
  },

  loadStudents() {
    // 模拟加载学生数据
    const mockStudents = [
      {
        id: 1,
        name: '张三',
        studentId: '2021001',
        class: '计算机科学1班',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        avatar: '/images/avatar-placeholder.png',
        joinDate: '2021-09-01'
      },
      {
        id: 2,
        name: '李四',
        studentId: '2021002',
        class: '计算机科学1班',
        phone: '13800138002',
        email: 'lisi@example.com',
        avatar: '/images/avatar-placeholder.png',
        joinDate: '2021-09-01'
      }
    ]
    this.setData({ students: mockStudents })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearch() {
    // 实现搜索逻辑
    console.log('搜索学生:', this.data.searchKeyword)
  },

  onAddStudent() {
    this.setData({ 
      showAddModal: true,
      editingStudent: null,
      formData: {
        name: '',
        studentId: '',
        class: '',
        phone: '',
        email: ''
      }
    })
  },

  onEditStudent(e) {
    const student = e.currentTarget.dataset.student
    this.setData({
      showAddModal: true,
      editingStudent: student,
      formData: {
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        phone: student.phone,
        email: student.email
      }
    })
  },

  onDeleteStudent(e) {
    const studentId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个学生吗？',
      success: (res) => {
        if (res.confirm) {
          const students = this.data.students.filter(s => s.id !== studentId)
          this.setData({ students })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onFormSubmit() {
    const { formData, editingStudent } = this.data
    
    if (!formData.name || !formData.studentId || !formData.class) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      })
      return
    }

    if (editingStudent) {
      // 编辑学生
      const students = this.data.students.map(student => {
        if (student.id === editingStudent.id) {
          return { ...student, ...formData }
        }
        return student
      })
      this.setData({ students })
    } else {
      // 添加新学生
      const newStudent = {
        id: Date.now(),
        ...formData,
        avatar: '/images/avatar-placeholder.png',
        joinDate: new Date().toISOString().split('T')[0]
      }
      this.setData({
        students: [...this.data.students, newStudent]
      })
    }

    this.setData({ showAddModal: false })
    wx.showToast({
      title: editingStudent ? '编辑成功' : '添加成功',
      icon: 'success'
    })
  },

  onCancel() {
    this.setData({ showAddModal: false })
  },

  onStudentDetail(e) {
    const student = e.currentTarget.dataset.student
    wx.navigateTo({
      url: `/pages/student/detail/detail?id=${student.id}`
    })
  }
})
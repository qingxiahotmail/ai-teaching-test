// app.js
App({
  onLaunch() {
    // 小程序启动时的初始化逻辑
    console.log('课程助教小程序启动');

    // 检查隐私政策是否已同意
    const privacyAgreed = wx.getStorageSync('privacyAgreed');

    if (!privacyAgreed) {
      // 显示隐私政策弹窗
      this.showPrivacyDialog();
    } else {
      this.initApp();
    }
  },

  // 显示隐私政策弹窗
  showPrivacyDialog() {
    wx.showModal({
      title: '隐私政策',
      content: '欢迎使用课程助教！在使用前请阅读并同意我们的隐私政策和服务协议。我们将依法保护您的个人信息安全。',
      confirmText: '同意并继续',
      cancelText: '退出',
      showCancel: false, // 只显示确认按钮
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('privacyAgreed', true);
          this.initApp();
        }
      },
      fail: () => {
        // 用户点击遮罩层，仍然初始化
        this.initApp();
      }
    });
  },

  // 初始化应用
  initApp() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      try {
        wx.cloud.init({
          env: 'cloud1-0glrtu01787f0071', // 云环境ID
          traceUser: true
        });
        console.log('云开发初始化成功，环境ID:', 'cloud1-0glrtu01787f0071');
      } catch (err) {
        console.error('云开发初始化失败:', err);
      }
    }
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  // 全局数据
  globalData: {
    envId: 'cloud1-0glrtu01787f0071', // 云环境ID
    isTeacher: false, // 是否为教师（内容维护者）
    teacherCode: 'teacher123' // 教师验证码
  },

  // 检查教师模式
  checkTeacherMode() {
    try {
      const isTeacher = wx.getStorageSync('isTeacher');
      this.globalData.isTeacher = !!isTeacher;
      return this.globalData.isTeacher;
    } catch (e) {
      console.error('检查教师模式失败:', e);
      this.globalData.isTeacher = false;
      return false;
    }
  },

  // 设置为教师模式
  setTeacherMode(teacherCode) {
    try {
      if (teacherCode === this.globalData.teacherCode) {
        this.globalData.isTeacher = true;
        wx.setStorageSync('isTeacher', true);
        wx.showToast({
          title: '已切换到教师模式',
          icon: 'success'
        });
        return true;
      } else {
        wx.showToast({
          title: '验证码错误',
          icon: 'none'
        });
        return false;
      }
    } catch (e) {
      console.error('设置教师模式失败:', e);
      return false;
    }
  },

  // 退出教师模式
  exitTeacherMode() {
    try {
      this.globalData.isTeacher = false;
      wx.removeStorageSync('isTeacher');
      wx.showToast({
        title: '已退出教师模式',
        icon: 'success'
      });
    } catch (e) {
      console.error('退出教师模式失败:', e);
    }
  }
})
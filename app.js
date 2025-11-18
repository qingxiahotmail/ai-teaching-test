// app.js
App({
  onLaunch() {
    // 小程序启动时的初始化逻辑
    console.log('课程助教小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  onShow() {
    console.log('小程序显示');
  },
  
  onHide() {
    console.log('小程序隐藏');
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    isTeacher: false,
    currentCourse: null,
    apiBaseUrl: 'https://api.example.com' // 后端API地址
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isTeacher = userInfo.role === 'teacher';
    }
  },
  
  // 登录方法
  login(userInfo) {
    return new Promise((resolve, reject) => {
      // 模拟登录逻辑
      setTimeout(() => {
        const token = 'mock_token_' + Date.now();
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', userInfo);
        
        this.globalData.userInfo = userInfo;
        this.globalData.isTeacher = userInfo.role === 'teacher';
        
        resolve({ token, userInfo });
      }, 1000);
    });
  },
  
  // 登出方法
  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.userInfo = null;
    this.globalData.isTeacher = false;
    
    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
})
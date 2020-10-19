class mVue {
  constructor(options) {
    this.$options = options;
    // 获取数据信息
    this.$data = options.data;
    // 监听函数
    this.observe(this.$data);
  }

  //   监听数据的方法
  observe(value) {
    //   判断当前参数是否为对象
    if (!value || typeof value !== "object") {
      return;
    }
    // 遍历data对象
    Object.keys(value).forEach((key) => {
      // 定义响应化
      this.defineReactive(value, key, value[key]);
    });
  }
  // 数据响应化
  defineReactive(obj, key, val) {
    // 递归调用
    this.observe(val);
    Object.defineProperty(obj, key, {
      get() {
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        console.log(`${key}的值更新为${val}`);
      },
    });
  }
}

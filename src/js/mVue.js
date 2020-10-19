class mVue {
  constructor(options) {
    this.$options = options;
    // 获取数据信息
    this.$data = options.data;
    // 监听函数
    this.observe(this.$data);
  }

  //   数组更新
  defineArrayReactive() {
    //   重新定义数组原型
    const oldArray = Array.prototype;
    //   定义新对象arraytotype的原型指向oldArray，扩展新方法不影响原型
    const arraytotype = Object.create(oldArray);
    const vm = this;
    //   遍历修改arraytotype的方法
    ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
      (method) => {
        arraytotype[method] = function () {
          // 调用视图更新
          vm.updateView();
          // 执行原数组的方法
          oldArray[method].call(this, ...arguments);
        };
      }
    );
    return arraytotype;
  }

  // 调用视图更新
  updateView() {
    console.dir(this.$data.UserArray);
  }

  //   监听数据的方法
  observe(value) {
    //   判断当前参数是否存在
    if (!value) {
      return;
    }
    // 判断当前对象是否为数组
    if (Array.isArray(value)) {
      // 修改数组原型指向
      value.__proto__ = this.defineArrayReactive();
    }
    //   判断当前参数是否为对象
    if (typeof value === "object") {
      // 遍历data对象
      Object.keys(value).forEach((key) => {
        // 定义响应化
        this.defineReactive(value, key, value[key]);
      });
    }
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

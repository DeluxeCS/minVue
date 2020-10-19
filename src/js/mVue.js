class mVue {
  constructor(options) {
    this.$options = options;
    // 获取数据信息
    this.$data = options.data;
    // 监听函数
    this.observe(this.$data);

    new Watcher();
    this.$data.test;
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
    // 递归调用 深度监听
    this.observe(val);
    // 当前作用于下生成的dep是相对独立的
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        // 读取数据,触发getter函数将当前watcher对象(存放在Dep.target中)收集到Dep类中去
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        // console.log(`${key}的值更新为${val}`);
        // setter方法触发,dep通知watcher调用update方法
        dep.notify();
      },
    });
  }
}

// 负责管理watcher
class Dep {
  constructor() {
    // 声明数组用于存放若干依赖
    this.deps = [];
  }

  //   watcher订阅dep
  addDep(dep) {
    this.deps.push(dep);
  }

  //   当视图发生变化、通知订阅者
  notify() {
    //   遍历dep
    this.deps.forEach((dep) => {
      // 数组中的dep实则是watcher的实例
      dep.updateView();
    });
  }
}

// 发布订阅
class Watcher {
  constructor() {
    // 将当前watcher的实例指向静态dep的target 实现组件间的通信
    Dep.target = this;
  }
  updateView() {
    console.log("属性更新");
  }
}

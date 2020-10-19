class Compile {
  constructor(el, vm) {
    //   获取宿主节点
    this.$el = document.querySelector(el);
    this.$vm = vm;
    // 编译阶段
    if (this.$el) {
      // 将内容转换为片段存储
      this.$fragment = this.node2Fragment(this.$el);
      // 执行编译
      this.compile(this.$fragment);
      // 追加至this.$el
      this.$el.appendChild(this.$fragment);
    }
  }

  node2Fragment(el) {
    // 创建空白片段
    const frage = document.createDocumentFragment();
    // 将$el中子元素移至frage中
    let child;
    while (el.firstChild) {
      child = el.firstChild;
      frage.appendChild(child);
    }
    return frage;
  }

  //   编译过程
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      // 该节点是元素
      if (this.isElementNode(node)) {
        //  编译节点属性
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach((attr) => {
          const attrName = attr.name;
          const exp = attr.value;
          if (this.isDirective(attrName)) {
            // 获取m-后的text指令
            const dir = attrName.substring(2);
            // 执行指令
            this[dir] && this[dir](node, this.$vm, exp);
          } else if (this.isEvent(attrName)) {
            // 获取@后的event
            const dir = attrName.substring(1);
            // 执行事件
            this.eventHandler(node, this.$vm, exp, dir);
          }
        });
      } else if (this.isInterpolation(node)) {
        //   该节点是文本或插值表达式
        this.compileText(node);
      }
      //   递归编译子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }
  isInterpolation(node) {
    // 获取节点文本内容
    let text = node.textContent;
    //   文本中的插值表达式正则
    let reg = /\{\{(.*)\}\}/;
    return node.nodeType === 3 && reg.test(text);
  }
  // 执行text指令
  text(node, vm, exp) {
    this.updateView(node, vm, exp, "text");
  }

  // 双向数据绑定
  model(node, vm, exp) {
    this.updateView(node, vm, exp, "model");
    node.addEventListener("input", (event) => {
      vm[exp] = event.target.value;
    });
  }

  modeUpdate(node, value) {
    node.value = value;
  }

  html(node, vm, exp) {
    this.updateView(node, vm, exp, "html");
  }

  htmlUpdater(node, value) {
    node.innerHTML = value;
  }

  //   节点属性为指令时
  isDirective(attrName) {
    return attrName.indexOf("m-") == 0;
  }
  //   节点属性为事件时
  isEvent(attrName) {
    return attrName.indexOf("@") == 0;
  }

  // 编译插值表达式
  compileText(node) {
    this.updateView(node, this.$vm, RegExp.$1, "text");
  }

  // 更新函数 dir => v-mode/
  updateView(node, vm, exp, dir) {
    const upFunc = this[dir + "Updater"];
    // 初始化视图
    upFunc && upFunc(node, vm[exp]);
    // 依赖收集
    new Watcher(vm, exp, function (value) {
      upFunc && upFunc(node, value);
    });
  }

  // 事件执行
  eventHandler(node, vm, exp, dir) {
    let func = vm.$options.$methods && vm.$options.$methods[exp];

    if (dir && func) {
      node.addEventListener(dir, func.bind(vm));
    }
  }

  textUpdater(node, value) {
    // 更新视图
    node.textContent = value;
  }
}

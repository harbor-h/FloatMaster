/**
 * 历史记录管理对象
 * 负责管理转换历史记录的加载、保存、显示、复制、删除等操作
 */
const HistoryManager = {
  /**
   * 历史记录数组
   * @type {Array<Object>}
   */
  history: [],
  /**
   * 历史记录最大数量
   * @type {number}
   */
  maxHistoryItems: 20,
  /**
   * 历史记录列表的DOM元素
   * @type {HTMLElement}
   */
  historyListElement: document.getElementById('historyList'),

  /**
   * 从本地存储加载历史记录
   */
  load() {
    const savedHistory = localStorage.getItem('conversionHistory')
    if (savedHistory) {
      this.history = JSON.parse(savedHistory)
      this.updateDisplay()
    }
  },

  /**
   * 将历史记录保存到本地存储
   */
  save() {
    localStorage.setItem('conversionHistory', JSON.stringify(this.history))
  },

  /**
   * 更新历史记录的显示
   */
  updateDisplay() {
    this.historyListElement.innerHTML = '';
    if (this.history.length === 0) {
      const emptyMessage = document.createElement('div')
      emptyMessage.className = 'history-item'
      emptyMessage.textContent = '暂无历史记录'
      this.historyListElement.appendChild(emptyMessage)
      return
    }
    this.history.forEach((item, index) => {
      const div = document.createElement('div')
      div.className = 'history-item'
      let resultDisplay = ''
      if (item.type === 'custom') {
        const lines = item.result.split('\n')
        resultDisplay = lines[lines.length - 1]
      }
      div.innerHTML = `
              <div><strong>${item.timestamp}</strong></div>
              <div>类型: ${item.type === 'standard' ? 'IEEE 754标准转换' : '自定义转换'}</div>
              <div>输入: ${item.input}</div>
              ${resultDisplay ? `<div>结果: ${resultDisplay}</div>` : ''}
              <div class="history-actions">
                  <button class="btn btn-secondary" onclick="HistoryManager.copyItem(${index})">复制输入值</button>
                  <button class="btn btn-secondary" onclick="HistoryManager.deleteItem(${index})">删除</button>
              </div>
          `
      this.historyListElement.appendChild(div)
    })
  },

  /**
   * 添加新的历史记录项
   * @param {number} input - 输入的十进制数
   * @param {string} result - 转换结果
   * @param {string} type - 转换类型 ('standard' 或 'custom')
   */
  add(input, result, type) {
    const historyItem = {
      input,
      result,
      type,
      timestamp: new Date().toLocaleString()
    }
    this.history.unshift(historyItem)
    if (this.history.length > this.maxHistoryItems) {
      this.history.pop();
    }
    this.updateDisplay()
    this.save()
  },

  /**
   * 复制历史记录项的输入值
   * @param {number} index - 历史记录项的索引
   */
  copyItem(index) {
    const item = this.history[index]
    navigator.clipboard.writeText(item.input.toString()).then(() => {
      alert('输入值已复制到剪贴板')
    }).catch(err => {
      console.error('复制失败:', err)
    })
  },

  /**
   * 删除历史记录项
   * @param {number} index - 要删除的历史记录项的索引
   */
  deleteItem(index) {
    this.history.splice(index, 1)
    this.updateDisplay()
    this.save()
  },

  /**
   * 清空所有历史记录
   */
  clear() {
    console.log('我被调用了')
    if (confirm('确定要清空所有历史记录吗？')) {
      this.history = []
      this.updateDisplay()
      this.save()
    }
  },

  /**
   * 弹出最后一个历史记录项
   */
  pop() {
    if (this.history.length > 0) {
      this.history.pop()
      this.updateDisplay()
      this.save()
    }
  }
}
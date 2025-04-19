/**
 * 历史记录数组
 * @type {Array<Object>}
 */
let conversionHistory = [];

/**
 * 历史记录最大数量
 * @type {number}
 */
const MAX_HISTORY_ITEMS = 20;

/**
 * 更新历史记录
 * @param {number} input - 输入的十进制数
 * @param {string} result - 转换结果
 * @param {string} type - 转换类型 ('standard' 或 'custom')
 */
function updateHistory(input, result, type) {
    const historyItem = {
        input: input,
        result: result,
        type: type,
        timestamp: new Date().toLocaleString()
    };
    conversionHistory.unshift(historyItem);
    if (conversionHistory.length > MAX_HISTORY_ITEMS) {
        conversionHistory.pop();
    }
    updateHistoryDisplay();
    saveHistory();
}

/**
 * 更新历史记录显示
 */
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (conversionHistory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'history-item';
        emptyMessage.textContent = '暂无历史记录';
        historyList.appendChild(emptyMessage);
        return;
    }

    conversionHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div><strong>${item.timestamp}</strong></div>
            <div>类型: ${item.type === 'standard' ? 'IEEE 754标准转换' : '自定义转换'}</div>
            <div>输入: ${item.input}</div>
            <div>结果: ${item.result.split('\n')[0]}</div>
            <div class="history-actions">
                <button class="btn btn-secondary" onclick="copyHistoryItem(${index})">复制</button>
                <button class="btn btn-secondary" onclick="deleteHistoryItem(${index})">删除</button>
            </div>
        `;
        historyList.appendChild(div);
    });
}

/**
 * 复制历史记录项
 * @param {number} index - 历史记录项的索引
 */
function copyHistoryItem(index) {
    const item = conversionHistory[index];
    navigator.clipboard.writeText(item.result).then(() => {
        alert('结果已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

/**
 * 删除历史记录项
 * @param {number} index - 要删除的历史记录项的索引
 */
function deleteHistoryItem(index) {
    conversionHistory.splice(index, 1);
    updateHistoryDisplay();
    saveHistory();
}

/**
 * 清空历史记录
 */
function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
        conversionHistory = [];
        updateHistoryDisplay();
        saveHistory();
    }
}

/**
 * 保存历史记录到本地存储
 */
function saveHistory() {
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

/**
 * 加载历史记录
 */
function loadHistory() {
    const savedHistory = localStorage.getItem('conversionHistory');
    if (savedHistory) {
        conversionHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

/**
 * 清空输入框和结果
 */
function clearInput() {
    document.getElementById('decimal-input').value = '';
    document.getElementById('custom-decimal').value = '';
    document.getElementById('exponent-bits').value = '';
    document.getElementById('mantissa-bits').value = '';
    document.getElementById('standard-result').textContent = '';
    document.getElementById('custom-result').textContent = '';
    document.getElementById('exponent-error').style.display = 'none';
    document.getElementById('mantissa-error').style.display = 'none';
}

/**
 * 复制结果到剪贴板
 * @param {string} resultId - 结果元素的ID
 */
function copyResult(resultId) {
    const resultText = document.getElementById(resultId).textContent;
    navigator.clipboard.writeText(resultText).then(() => {
        alert('结果已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

/**
 * 将十进制数转换为IEEE 754单精度浮点数
 * @param {number} decimal - 要转换的十进制数
 * @returns {Object} 包含符号位、阶码和尾数的对象
 */
function convertToSinglePrecision(decimal) {
    const float32 = new Float32Array(1);
    float32[0] = decimal;
    const int32 = new Int32Array(float32.buffer);
    const binary32 = int32[0].toString(2).padStart(32, '0');
    return {
        sign: binary32[0],
        exponent: binary32.slice(1, 9),
        mantissa: binary32.slice(9)
    };
}

/**
 * 将十进制数转换为IEEE 754双精度浮点数
 * @param {number} decimal - 要转换的十进制数
 * @returns {Object} 包含符号位、阶码和尾数的对象
 */
function convertToDoublePrecision(decimal) {
    const float64 = new Float64Array(1);
    float64[0] = decimal;
    const uint64 = new BigUint64Array(float64.buffer);
    const binary64 = uint64[0].toString(2).padStart(64, '0');
    return {
        sign: binary64[0],
        exponent: binary64.slice(1, 12),
        mantissa: binary64.slice(12)
    };
}

/**
 * 将十进制数转换为IEEE 754格式
 * @param {number} decimal - 要转换的十进制数
 * @returns {string} 转换结果的格式化字符串
 */
function convertToIEEE754(decimal) {
    // 32位单精度处理
    const float32 = new Float32Array(1);
    float32[0] = decimal;
    const uint32 = new Uint32Array(float32.buffer);
    const binary32 = uint32[0].toString(2).padStart(32, '0');

    // 64位双精度处理
    const float64 = new Float64Array(1);
    float64[0] = decimal;
    const uint64 = new BigUint64Array(float64.buffer);
    const binary64 = uint64[0].toString(2).padStart(64, '0');

    // 科学计数法计算
    let exponent = 0;
    let mantissa = Math.abs(decimal);

    if (mantissa !== 0) {
        while (mantissa >= 2) {
            mantissa /= 2;
            exponent++;
        }
        while (mantissa < 1 && mantissa !== 0) {
            mantissa *= 2;
            exponent--;
        }
    }

    const scientific = `${decimal < 0 ? '-' : ''}${mantissa.toFixed(10)}×2^${exponent}`;

    return `输入值: ${decimal}${Object.is(decimal, -0) ? ' (负零)' : ''}\n\n` +
        `科学计数法表示: ${scientific}\n\n` +
        `32位单精度浮点数:\n` +
        `符号位(s): ${binary32[0]} (${binary32[0] === '1' ? '负数' : '正数'})\n` +
        `阶码(e): ${binary32.substring(1, 9)} (${parseInt(binary32.substring(1, 9), 2) - 127})\n` +
        `尾数(f): ${binary32.substring(9)}\n\n` +
        `64位双精度浮点数:\n` +
        `符号位(s): ${binary64[0]} (${binary64[0] === '1' ? '负数' : '正数'})\n` +
        `阶码(e): ${binary64.substring(1, 12)} (${parseInt(binary64.substring(1, 12), 2) - 1023})\n` +
        `尾数(f): ${binary64.substring(12)}`;
}

/**
 * 自定义浮点数转换
 * @param {number} decimal - 要转换的十进制数
 * @param {string} exponentType - 阶码类型 ('excess' 或 'complement')
 * @param {number} exponentBits - 阶码位数
 * @param {number} mantissaBits - 尾数位数
 * @returns {Object} 包含转换结果的对象
 */
function customConversion(decimal, exponentType = 'excess', exponentBits = 5, mantissaBits = 6) {
    // 输入验证
    if (isNaN(decimal)) {
        throw new Error('输入必须是有效的数字');
    }
    if (exponentBits < 1 || exponentBits > 10) {
        throw new Error('阶码位数必须在1-10之间');
    }
    if (mantissaBits < 1 || mantissaBits > 10) {
        throw new Error('尾数位数必须在1-10之间');
    }

    // 处理特殊情况
    if (decimal === 0) {
        const result = {
            sign: '0',
            exponent: '0'.repeat(exponentBits),
            mantissa: '0'.repeat(mantissaBits),
            binary: '0' + '0'.repeat(exponentBits) + '0'.repeat(mantissaBits),
            scientific: '0'
        };
        result.toString = function () {
            return `自定义转换结果:\n` +
                `输入值: ${decimal}${decimal === -0 ? ' (负零)' : ''}\n` +
                `科学计数法表示: ${this.scientific}\n\n` +
                `浮点数表示:\n` +
                `符号位(s): ${this.sign} (${this.sign === '1' ? '负数' : '正数'})\n` +
                `阶码(e): ${this.exponent} (${exponentType === 'excess' ? '移码' : '补码'})\n` +
                `尾数(f): ${this.mantissa}\n\n` +
                `完整二进制表示:\n` +
                `${this.binary.match(/.{1,8}/g).join(' ')}`;
        };
        return result;
    }

    const sign = decimal < 0 || 1 / decimal === -Infinity ? '1' : '0';
    const absValue = Math.abs(decimal);

    // 规格化处理
    let exponent = 0;
    let mantissa = absValue;

    // 规格化为0.1xxxxx或1.0xxxxx形式
    if (mantissa >= 1) {
        while (mantissa >= 1) {
            mantissa /= 2;
            exponent++;
        }
    } else if (mantissa > 0) {
        while (mantissa < 0.5) {
            mantissa *= 2;
            exponent--;
        }
    }

    // 计算尾数（补码表示）
    let mantissaBinary = '';
    let temp = mantissa;

    // 先计算原码
    for (let i = 0; i < mantissaBits; i++) {
        temp *= 2;
        if (temp >= 1) {
            mantissaBinary += '1';
            temp -= 1;
        } else {
            mantissaBinary += '0';
        }
    }

    // 如果是负数，将尾数转换为补码
    if (sign === '1') {
        // 1. 取反
        mantissaBinary = mantissaBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');
        // 2. 加1
        let carry = 1;
        let complement = '';
        for (let i = mantissaBinary.length - 1; i >= 0; i--) {
            const sum = parseInt(mantissaBinary[i]) + carry;
            complement = (sum % 2) + complement;
            carry = Math.floor(sum / 2);
        }
        mantissaBinary = complement;
    }

    // 计算阶码
    let exponentValue;
    if (exponentType === 'excess') {
        // 移码表示
        const bias = (1 << (exponentBits - 1)); // 2^(k-1)
        exponentValue = exponent + bias;
    } else {
        // 补码表示
        const maxExponent = (1 << (exponentBits - 1)) - 1;
        if (exponent < -maxExponent) {
            exponent = -maxExponent;
        } else if (exponent > maxExponent) {
            exponent = maxExponent;
        }
        // 转换为补码
        if (exponent < 0) {
            exponentValue = (1 << exponentBits) + exponent;
        } else {
            exponentValue = exponent;
        }
    }

    // 处理阶码溢出
    if (exponentValue >= (1 << exponentBits)) {
        // 溢出处理（返回无穷大）
        const result = {
            sign,
            exponent: '1'.repeat(exponentBits),
            mantissa: '0'.repeat(mantissaBits),
            binary: sign + '1'.repeat(exponentBits) + '0'.repeat(mantissaBits),
            scientific: `${sign === '1' ? '-' : ''}∞`
        };
        result.toString = function () {
            return `自定义转换结果:\n` +
                `输入值: ${decimal}\n` +
                `科学计数法表示: ${this.scientific}\n\n` +
                `浮点数表示:\n` +
                `符号位(s): ${this.sign} (${this.sign === '1' ? '负数' : '正数'})\n` +
                `阶码(e): ${this.exponent} (${exponentType === 'excess' ? '移码' : '补码'})\n` +
                `尾数(f): ${this.mantissa}\n\n` +
                `完整二进制表示:\n` +
                `${this.binary.match(/.{1,8}/g).join(' ')}`;
        };
        return result;
    }

    const exponentBinary = exponentValue.toString(2).padStart(exponentBits, '0');

    // 构建完整结果
    const binary = sign + exponentBinary + mantissaBinary;
    const scientific = `${sign === '1' ? '-' : ''}0.${mantissaBinary}×2^${exponent}`;

    const result = {
        sign,
        exponent: exponentBinary,
        mantissa: mantissaBinary,
        binary,
        scientific,
        toString: function () {
            return `自定义转换结果:\n` +
                `输入值: ${decimal}${decimal === -0 ? ' (负零)' : ''}\n` +
                `科学计数法表示: ${this.scientific}\n\n` +
                `浮点数表示:\n` +
                `符号位(s): ${this.sign} (${this.sign === '1' ? '负数' : '正数'})\n` +
                `阶码(e): ${this.exponent} (${exponentType === 'excess' ? '移码' : '补码'}, 实际指数: ${exponent})\n` +
                `尾数(f): ${this.mantissa}\n\n` +
                `完整二进制表示:\n` +
                `${this.binary.match(/.{1,8}/g).join(' ')}`;
        }
    };
    return result;
}

/**
 * 初始化反馈系统
 */
function initFeedbackSystem() {
    // 获取反馈标签按钮和内容
    const feedbackTabs = document.querySelectorAll('.feedback-tab-btn');
    const feedbackContents = document.querySelectorAll('.feedback-content');

    // 添加标签切换事件监听器
    feedbackTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签和内容的active类
            feedbackTabs.forEach(t => t.classList.remove('active'));
            feedbackContents.forEach(c => c.classList.remove('active'));

            // 添加active类到当前标签和对应内容
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-feedback-tab');
            document.getElementById(contentId).classList.add('active');
        });
    });

    // 添加建议提交事件监听器
    document.getElementById('submit-suggestion').addEventListener('click', () => {
        const suggestion = document.getElementById('suggestion-input').value.trim();
        if (suggestion) {
            submitFeedback('suggestion', suggestion);
            document.getElementById('suggestion-input').value = '';
            alert('感谢您的建议！');
        } else {
            alert('请输入您的建议');
        }
    });

    // 添加错误报告提交事件监听器
    document.getElementById('submit-error').addEventListener('click', () => {
        const errorDesc = document.getElementById('error-input').value.trim();
        const errorExample = document.getElementById('error-example').value.trim();

        if (errorDesc && errorExample) {
            submitFeedback('error', { description: errorDesc, example: errorExample });
            document.getElementById('error-input').value = '';
            document.getElementById('error-example').value = '';
            alert('感谢您的错误报告！');
        } else {
            alert('请完整填写错误描述和示例');
        }
    });
}

/**
 * 提交反馈
 * @param {string} type - 反馈类型 ('suggestion' 或 'error')
 * @param {string|Object} content - 反馈内容
 */
function submitFeedback(type, content) {
    const feedback = {
        type: type,
        content: content,
        timestamp: new Date().toLocaleString(),
        userAgent: navigator.userAgent
    };

    // 这里可以添加发送反馈到服务器的代码
    console.log('Feedback submitted:', feedback);

    // 保存到本地存储
    saveFeedback(feedback);
}

/**
 * 保存反馈到本地存储
 * @param {Object} feedback - 反馈对象
 */
function saveFeedback(feedback) {
    let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
}

// 页面加载时初始化
window.addEventListener('load', function () {
    loadHistory();
    // 设置默认值并显示结果
    document.getElementById('decimal-input').value = '3.14159';
    document.getElementById('convert-standard').click();
    document.getElementById('decimal-input').value = '';
    initFeedbackSystem();
});


// 标签页切换
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// 标准转换
document.getElementById('convert-standard').addEventListener('click', function () {
    const decimal = parseFloat(document.getElementById('decimal-input').value);
    if (isNaN(decimal)) {
        alert('请输入有效的十进制小数');
        return;
    }
    const result = convertToIEEE754(decimal);
    document.getElementById('standard-result').textContent = result;
    updateHistory(decimal, result, 'standard');
});

// 自定义转换
document.getElementById('convert-custom').addEventListener('click', function () {
    try {
        const decimal = parseFloat(document.getElementById('custom-decimal').value);
        const exponentType = document.getElementById('exponent-type').value;
        const exponentBits = parseInt(document.getElementById('exponent-bits').value);
        const mantissaBits = parseInt(document.getElementById('mantissa-bits').value);

        // 隐藏之前的错误信息
        document.getElementById('exponent-error').style.display = 'none';
        document.getElementById('mantissa-error').style.display = 'none';

        // 输入验证
        if (isNaN(decimal)) {
            throw new Error('请输入有效的十进制小数');
        }
        if (isNaN(exponentBits) || exponentBits < 1 || exponentBits > 10) {
            document.getElementById('exponent-error').style.display = 'block';
            document.getElementById('exponent-error').textContent = '阶码位数必须在1-10之间';
            return;
        }
        if (isNaN(mantissaBits) || mantissaBits < 1 || mantissaBits > 10) {
            document.getElementById('mantissa-error').style.display = 'block';
            document.getElementById('mantissa-error').textContent = '尾数位数必须在1-10之间';
            return;
        }

        const result = customConversion(decimal, exponentType, exponentBits, mantissaBits);
        document.getElementById('custom-result').textContent = result.toString();
        updateHistory(decimal, result.toString(), 'custom');
    } catch (error) {
        alert(error.message);
    }
});

// 添加输入验证
document.getElementById('exponent-bits').addEventListener('input', function () {
    const value = parseInt(this.value);
    const errorElement = document.getElementById('exponent-error');
    if (isNaN(value) || value < 1 || value > 10) {
        errorElement.style.display = 'block';
        errorElement.textContent = '阶码位数必须在1-10之间';
    } else {
        errorElement.style.display = 'none';
    }
});

document.getElementById('mantissa-bits').addEventListener('input', function () {
    const value = parseInt(this.value);
    const errorElement = document.getElementById('mantissa-error');
    if (isNaN(value) || value < 1 || value > 10) {
        errorElement.style.display = 'block';
        errorElement.textContent = '尾数位数必须在1-10之间';
    } else {
        errorElement.style.display = 'none';
    }
});

// 添加键盘事件支持
document.getElementById('decimal-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('convert-standard').click();
    }
});

document.getElementById('custom-decimal').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('convert-custom').click();
    }
});

// 添加清空历史记录按钮
const historySection = document.querySelector('.history-section');
const clearHistoryBtn = document.createElement('button');
clearHistoryBtn.className = 'btn btn-secondary';
clearHistoryBtn.textContent = '清空历史记录';
clearHistoryBtn.onclick = clearHistory;
// 将按钮插入到历史记录列表之前
historySection.insertBefore(clearHistoryBtn, document.getElementById('historyList'));

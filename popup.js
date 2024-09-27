document.addEventListener('DOMContentLoaded', function () {
    const calculator1 = document.getElementById('calculator1');
    const calculator2 = document.getElementById('calculator2');
    const importRightButton = document.getElementById('importRight');
    const importLeftButton = document.getElementById('importLeft');

    let currentCalculator = calculator1;
    let currentDisplay = document.getElementById('display1');
    let firstOperand = null;
    let operator = null;
    let waitingForSecondOperand = false;
    let importedValue = null;

    function setupCalculator(calculatorId) {
        const calculator = document.getElementById(calculatorId);
        const display = calculator.querySelector('.display input');
        const buttons = calculator.querySelectorAll('button');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                currentCalculator = calculator;
                currentDisplay = display;
                handleButtonClick(button);
            });
        });
    }

    setupCalculator('calculator1');
    setupCalculator('calculator2');

    function handleButtonClick(button) {
        const value = button.dataset.value;

        if (button.classList.contains('number')) {
            inputNumber(value);
        } else if (button.classList.contains('operator')) {
            handleOperator(value);
        } else if (button.classList.contains('equals')) {
            calculate();
        } else if (button.classList.contains('clear')) {
            clear();
        }
    }

    function inputNumber(number) {
        if (waitingForSecondOperand) {
            currentDisplay.value = number;
            waitingForSecondOperand = false;
        } else {
            currentDisplay.value = currentDisplay.value === '0' ? number : currentDisplay.value + number;
        }
        importedValue = null; // 清除导入的值
    }

    function handleOperator(nextOperator) {
        const inputValue = parseFloat(currentDisplay.value);

        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        if (firstOperand === null && !isNaN(inputValue)) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation(firstOperand, inputValue, operator);
            currentDisplay.value = result;
            firstOperand = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
        importedValue = null; // 清除导入的值
    }

    function calculate() {
        if (operator === null) {
            return;
        }

        let secondOperand;
        if (importedValue !== null && waitingForSecondOperand) {
            secondOperand = importedValue;
        } else {
            secondOperand = parseFloat(currentDisplay.value);
        }

        const result = performCalculation(firstOperand, secondOperand, operator);

        currentDisplay.value = result;
        firstOperand = result;
        operator = null;
        waitingForSecondOperand = true;
        importedValue = null; // 清除导入的值
    }

    function performCalculation(first, second, op) {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return second !== 0 ? first / second : 'Error';
            case '^': return Math.pow(first, second);
            case '%': return first % second;
            case 'sqrt': return Math.sqrt(first);
            default: return second;
        }
    }

    function clear() {
        currentDisplay.value = '0';
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
        importedValue = null; // 清除导入的值
    }

    importRightButton.addEventListener('click', function () {
        importValue('display1', 'display2', calculator2);
    });

    importLeftButton.addEventListener('click', function () {
        importValue('display2', 'display1', calculator1);
    });

    function importValue(fromDisplayId, toDisplayId, toCalculator) {
        const fromDisplay = document.getElementById(fromDisplayId);
        const toDisplay = document.getElementById(toDisplayId);
        const value = fromDisplay.value.trim();

        // 检查值是否为空或非数字
        if (value === '' || !/^-?\d*\.?\d+$/.test(value)) {
            console.log("Invalid or empty input, transfer aborted");
            return;
        }

        const result = parseFloat(value);

        // 切换当前计算器
        currentCalculator = toCalculator;
        currentDisplay = toDisplay;

        if (operator !== null && firstOperand !== null) {
            // 如果已经有操作符和第一个操作数，将导入的值存储起来，等待计算
            importedValue = result;
            toDisplay.value = result;
            waitingForSecondOperand = true;
        } else {
            // 否则，直接将结果导入到目标计算器的显示屏，并设置为第一个操作数
            toDisplay.value = result;
            firstOperand = result;
            operator = null;
            waitingForSecondOperand = true;
        }
    }

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyboardInput);

    function handleKeyboardInput(event) {
        const key = event.key;

        // 确保currentDisplay是当前获得焦点的输入框
        currentDisplay = document.activeElement;

        if (currentDisplay.id === 'display1') {
            currentCalculator = calculator1;
        } else if (currentDisplay.id === 'display2') {
            currentCalculator = calculator2;
        } else {
            currentDisplay = document.getElementById(currentCalculator === calculator1 ? 'display1' : 'display2');
        }

        if (/^[0-9.]$/.test(key)) {
            // 数字和小数点
            event.preventDefault(); // 防止默认行为（如滚动页面）
            if (isValidInput(currentDisplay.value + key)) {
                insertAtCursor(key);
            }
        } else if (['+', '-', '*', '/', '^', '%'].includes(key)) {
            // 运算符
            event.preventDefault();
            if (isValidInput(currentDisplay.value)) {
                handleOperator(key);
            }
        } else if (key === 'Enter' || key === '=') {
            // 等于
            event.preventDefault();
            if (isValidInput(currentDisplay.value)) {
                calculate();
            }
        } else if (key === 'Backspace') {
            // 退格
            event.preventDefault();
            backspace();
        } else if (key === 'Escape') {
            // 清除
            event.preventDefault();
            clear();
        } else if (key === 'Tab') {
            // 切换计算器
            event.preventDefault();
            toggleCalculator();
        }
    }

    // 新增insertAtCursor函数
    function insertAtCursor(value) {
        const startPos = currentDisplay.selectionStart;
        const endPos = currentDisplay.selectionEnd;
        const currentValue = currentDisplay.value;
        const newValue = currentValue.substring(0, startPos) + value + currentValue.substring(endPos);

        if (isValidInput(newValue)) {
            currentDisplay.value = newValue;
            currentDisplay.setSelectionRange(startPos + 1, startPos + 1);
        }
    }

    // 修改appendToDisplay函数
    function appendToDisplay(value) {
        if (currentDisplay.value === '0' || waitingForSecondOperand) {
            currentDisplay.value = value;
            waitingForSecondOperand = false;
        } else {
            insertAtCursor(value);
        }
    }

    function backspace() {
        currentDisplay.value = currentDisplay.value.slice(0, -1);
        if (currentDisplay.value === '') {
            currentDisplay.value = '0';
        }
    }

    function isValidInput(value) {
        // 检查值是否为空或非数字
        return value.trim() !== '' && /^-?\d*\.?\d*$/.test(value);
    }

    function toggleCalculator() {
        if (currentCalculator === calculator1) {
            currentCalculator = calculator2;
            currentDisplay = document.getElementById('display2');
            display2.focus();
        } else {
            currentCalculator = calculator1;
            currentDisplay = document.getElementById('display1');
            display1.focus();
        }
    }
});
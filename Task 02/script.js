(function() {

    const expressionField = document.getElementById('expression');
    const resultField = document.getElementById('result');
    
    let currentExpression = "0";
    let lastValidResult = 0;
    let resetOnNextInput = false;
    let lastOperatorFlag = false;
    
    function refreshDisplayAndEvaluate() {
        let expr = currentExpression.trim();
        if (expr === "") expr = "0";
        expressionField.value = expr;
        
        const evaluation = evaluateMathExpression(expr);
        if (evaluation.error) {
            resultField.value = evaluation.errorMsg;
            resultField.style.color = "#ffb7a7";
            resultField.classList.add('error-flash');
            setTimeout(() => resultField.classList.remove('error-flash'), 400);
        } else {
            resultField.value = evaluation.formattedResult;
            resultField.style.color = "#fef9e8";
            if (!isNaN(parseFloat(evaluation.raw)) && isFinite(evaluation.raw)) {
                lastValidResult = evaluation.raw;
            }
        }
    }
    
    function evaluateMathExpression(expr) {
        if (expr === "" || expr === null) {
            return { error: true, errorMsg: "0", formattedResult: "0", raw: 0 };
        }
        
        let jsExpr = expr.replace(/÷/g, '/').replace(/×/g, '*');
        
        let percentProcessed = jsExpr.replace(/(\d+(?:\.\d+)?)%/g, (match, num) => {
            let percentVal = parseFloat(num) / 100;
            return percentVal.toString();
        });
        
        percentProcessed = percentProcessed.replace(/[+\-*/]{2,}/g, (ops) => {
            return ops.slice(-1);
        });
        
        if (/[+\-*/]$/.test(percentProcessed)) {
            percentProcessed = percentProcessed.slice(0, -1);
        }
        if (percentProcessed === "") percentProcessed = "0";
        
        try {
            const compute = new Function('return (' + percentProcessed + ')');
            let rawResult = compute();
            
            if (isNaN(rawResult) || !isFinite(rawResult)) {
                return { error: true, errorMsg: "Math Error", formattedResult: "Error", raw: NaN };
            }
            
            let formatted;
            if (Number.isInteger(rawResult)) {
                formatted = rawResult.toString();
            } else {
                formatted = rawResult.toFixed(8).replace(/\.?0+$/, '');
                if (formatted === "") formatted = "0";
            }
            return { error: false, errorMsg: "", formattedResult: formatted, raw: rawResult };
        } catch (err) {
            return { error: true, errorMsg: "Syntax Error", formattedResult: "Error", raw: NaN };
        }
    }
    
    function endsWithOperator(str) {
        if (str.length === 0) return false;
        const last = str[str.length - 1];
        return ['+', '-', '*', '/', '÷', '×', '%'].includes(last);
    }
    
    function lastNumberContainsDecimal(expr) {
        const match = expr.match(/(\d+(?:\.\d+)?)(?![^+\-*/÷×%]*\d)/);
        if (match && match[1].includes('.')) return true;
        const lastSegment = expr.split(/[+\-*/÷×%]/).pop();
        return lastSegment ? lastSegment.includes('.') : false;
    }
    
    function inputNumberOrDot(value) {
        if (resetOnNextInput) {
            currentExpression = "0";
            resetOnNextInput = false;
            lastOperatorFlag = false;
        }
        
        let expr = currentExpression;
        
        if (value === '.') {
            if (expr === "0" || expr === "") {
                currentExpression = "0.";
                refreshDisplayAndEvaluate();
                return;
            }
            if (lastNumberContainsDecimal(expr)) {
                return;
            }
            if (endsWithOperator(expr)) {
                currentExpression = expr + "0.";
                refreshDisplayAndEvaluate();
                return;
            }
            currentExpression = expr + ".";
            refreshDisplayAndEvaluate();
            return;
        }
        
        if (expr === "0" && !endsWithOperator(expr)) {
            currentExpression = value;
        } else {
            currentExpression = expr + value;
        }
        refreshDisplayAndEvaluate();
        lastOperatorFlag = false;
    }
    
    function inputOperator(op) {
        if (resetOnNextInput) {
            let lastResStr = lastValidResult.toString();
            currentExpression = lastResStr + op;
            resetOnNextInput = false;
            lastOperatorFlag = true;
            refreshDisplayAndEvaluate();
            return;
        }
        
        let expr = currentExpression;
        if ((expr === "0" || expr === "") && (op === '+' || op === '-' || op === '*' || op === '/' || op === '%')) {
            currentExpression = "0" + op;
            refreshDisplayAndEvaluate();
            lastOperatorFlag = true;
            return;
        }
        
        if (endsWithOperator(expr)) {
            let newExpr = expr.slice(0, -1) + op;
            currentExpression = newExpr;
            refreshDisplayAndEvaluate();
            lastOperatorFlag = true;
            return;
        }
        
        currentExpression = expr + op;
        refreshDisplayAndEvaluate();
        lastOperatorFlag = true;
    }
    
    function handlePercentKey() {
        if (resetOnNextInput) {
            currentExpression = "0";
            resetOnNextInput = false;
        }
        let expr = currentExpression;
        if (expr === "" || expr === "0") return;
        
        const lastNumMatch = expr.match(/(\d+(?:\.\d+)?)(?!.*[+\-*/÷×%])/);
        if (lastNumMatch) {
            let lastNumber = parseFloat(lastNumMatch[1]);
            let percentValue = lastNumber / 100;
            let newExpr = expr.slice(0, -lastNumMatch[1].length) + percentValue.toString();
            if (newExpr === "") newExpr = percentValue.toString();
            currentExpression = newExpr;
        } else {
            const evalRes = evaluateMathExpression(expr);
            if (!evalRes.error) {
                let percentOfResult = evalRes.raw / 100;
                currentExpression = percentOfResult.toString();
            } else {
                return;
            }
        }
        refreshDisplayAndEvaluate();
        lastOperatorFlag = false;
    }
    
    function computeEquals() {
        let expr = currentExpression;
        if (expr === "" || expr === "0") {
            resultField.value = "0";
            return;
        }
        if (endsWithOperator(expr)) {
            expr = expr.slice(0, -1);
            currentExpression = expr;
        }
        if (expr === "") expr = "0";
        
        const evaluation = evaluateMathExpression(expr);
        if (evaluation.error) {
            resultField.value = evaluation.errorMsg;
            resultField.style.color = "#ffb7a7";
            resultField.classList.add('error-flash');
            setTimeout(() => resultField.classList.remove('error-flash'), 400);
        } else {
            currentExpression = evaluation.formattedResult;
            expressionField.value = currentExpression;
            resultField.value = evaluation.formattedResult;
            lastValidResult = evaluation.raw;
            resetOnNextInput = true;
        }
        lastOperatorFlag = false;
    }
    
    function clearEntry() {
        if (currentExpression === "0" || currentExpression.length === 1 || 
            (currentExpression.length === 2 && currentExpression.startsWith("-"))) {
            currentExpression = "0";
        } else {
            let trimmed = currentExpression.slice(0, -1);
            if (trimmed === "" || trimmed === "-") trimmed = "0";
            currentExpression = trimmed;
        }
        resetOnNextInput = false;
        lastOperatorFlag = false;
        refreshDisplayAndEvaluate();
        resultField.style.color = "#fef9e8";
    }
    
    function allClear() {
        currentExpression = "0";
        resetOnNextInput = false;
        lastOperatorFlag = false;
        lastValidResult = 0;
        refreshDisplayAndEvaluate();
        resultField.style.color = "#fef9e8";
    }
    
    function onKeyPress(event) {
        const key = event.key;
        if (/^[0-9]$/.test(key)) {
            event.preventDefault();
            inputNumberOrDot(key);
        } 
        else if (key === '.') {
            event.preventDefault();
            inputNumberOrDot('.');
        } 
        else if (key === '+' || key === '-') {
            event.preventDefault();
            inputOperator(key);
        } 
        else if (key === '*') {
            event.preventDefault();
            inputOperator('×');
        } 
        else if (key === '/') {
            event.preventDefault();
            inputOperator('÷');
        } 
        else if (key === '%') {
            event.preventDefault();
            handlePercentKey();
        } 
        else if (key === 'Enter') {
            event.preventDefault();
            computeEquals();
        } 
        else if (key === 'Backspace') {
            event.preventDefault();
            clearEntry();
        } 
        else if (key === 'Delete' || key === 'Escape') {
            event.preventDefault();
            allClear();
        }
    }
    
    function bindButtons() {
        document.querySelectorAll('[data-num]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const val = btn.getAttribute('data-num');
                inputNumberOrDot(val);
            });
        });
        
        document.querySelectorAll('[data-op]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const opType = btn.getAttribute('data-op');
                if (opType === 'percent') {
                    handlePercentKey();
                } else {
                    inputOperator(opType);
                }
            });
        });
        
        const equalsBtn = document.querySelector('[data-action="equals"]');
        if (equalsBtn) {
            equalsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                computeEquals();
            });
        }
        
        const acBtn = document.querySelector('[data-action="ac"]');
        if (acBtn) {
            acBtn.addEventListener('click', (e) => {
                e.preventDefault();
                allClear();
            });
        }
        
        const cBtn = document.querySelector('[data-action="c"]');
        if (cBtn) {
            cBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clearEntry();
            });
        }
    }
    
    function init() {
        bindButtons();
        window.addEventListener('keydown', onKeyPress);
        refreshDisplayAndEvaluate();
    }
    
    init();
    
})();
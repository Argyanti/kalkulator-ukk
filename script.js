// Elemen tampilan (display)
const currentOperation = document.getElementById('currentOperation'); // Menampilkan angka atau operasi yang sedang dimasukkan
const previousOperation = document.getElementById('previousOperation'); // Menampilkan hasil perhitungan sebelumnya

// Elemen tombol angka dan operasi
const numberButtons = document.querySelectorAll('[data-number]'); // Mengambil semua tombol angka
const operationButtons = document.querySelectorAll('[data-operation]'); // Mengambil semua tombol operasi (+, -, x, ÷, %)
const clearButton = document.querySelector('[data-clear]'); // Tombol untuk menghapus semua input
const deleteButton = document.querySelector('[data-delete]'); // Tombol untuk menghapus satu karakter terakhir
const equalsButton = document.querySelector('[data-equals]'); // Tombol untuk menghitung hasil operasi matematika

// Elemen tombol fungsi memori
const memoryRecallButton = document.querySelector('[data-mrc]'); // Tombol untuk mengingat nilai memori
const memoryAddButton = document.querySelector('[data-m-plus]'); // Tombol untuk menambah ke memori
const memorySubtractButton = document.querySelector('[data-m-minus]'); // Tombol untuk mengurangi nilai dalam memori
const grandTotalButton = document.querySelector('[data-gt]'); // Tombol untuk menampilkan total keseluruhan

// Elemen riwayat perhitungan
const clearHistoryButton = document.getElementById('clearHistoryBtn'); // Tombol untuk menghapus riwayat
const historyList = document.getElementById('history'); // Menyimpan daftar riwayat perhitungan

// Elemen kalkulator diskon
const originalPriceInput = document.getElementById('originalPrice'); // Input harga sebelum diskon
const discountPercentageInput = document.getElementById('discountPercentage'); // Input persen diskon
const finalPriceInput = document.getElementById('finalPrice'); // Menampilkan harga setelah diskon
const calculateDiscountButton = document.getElementById('calculateDiscount'); // Tombol hitung diskon
const resetDiscountButton = document.getElementById('resetDiscount'); // Tombol reset kalkulator diskon

// Variabel penyimpanan memori dan status
let memoryValue = 0; // Menyimpan nilai dalam memori
let grandTotal = 0; // Menyimpan total keseluruhan hasil perhitungan
let memoryFlag = false; // Menandai apakah memori sedang digunakan
let lastResultIsNegative = false; // Menandai apakah hasil terakhir negatif
let clearDisplayOnNextInput = true; // Menentukan apakah tampilan harus direset saat input berikutnya

// Inisialisasi tampilan dengan angka 0
currentOperation.value = '0';


// Memastikan angka dan operator dimasukkan dengan benar.
function isValidExpressionPart(expression, input) {
    // If input is a minus sign, it's valid at the start or after an operator
    if (input === '-') {
        if (expression === '0' || expression === '') return true;
        // Memungkinkan angka negatif hanya jika diawal atau setelah operator.
        const lastChar = expression.slice(-1);
        return ['+', 'x', '÷', '%'].includes(lastChar);
    }
    return true;
}

// Append numbers to display
numberButtons.forEach(numberBtn => {
    numberBtn.addEventListener('click', () => {
        if (clearDisplayOnNextInput) {
            currentOperation.value = numberBtn.value;
            clearDisplayOnNextInput = false;
        } else {
            if (numberBtn.value === '.' && currentOperation.value.includes('.')) {
                return;
            }
            currentOperation.value += numberBtn.value;
        }
    });
});

// Append operator to display
operationButtons.forEach(operationBtn => {
    operationBtn.addEventListener('click', () => {
        const lastChar = currentOperation.value.slice(-1);
        
        // Handle negative numbers
        if (operationBtn.value === '-') {
            if (currentOperation.value === '0') {
                currentOperation.value = '-';
                clearDisplayOnNextInput = false;
                return;
            }
            
            if (['+', 'x', '÷', '%'].includes(lastChar)) {
                currentOperation.value += '-';
                clearDisplayOnNextInput = false;
                return;
            }
        }
        
        if (!['+', '-', 'x', '÷', '%'].includes(lastChar)) {
            currentOperation.value += operationBtn.value;
            clearDisplayOnNextInput = false;
        } else {
            // Replace the last operator unless we're adding a negative after an operator
            currentOperation.value = currentOperation.value.slice(0, -1) + operationBtn.value;
        }
    });
});

// Clear all display values
clearButton.addEventListener('click', () => {
    currentOperation.value = '0';
    previousOperation.value = '';
    lastResultIsNegative = false;
    clearDisplayOnNextInput = true;
});

// Delete last character
deleteButton.addEventListener('click', () => {
    currentOperation.value = currentOperation.value.slice(0, -1) || '0';
    if (currentOperation.value === '0') {
        clearDisplayOnNextInput = true;
    }
});

// Safe evaluation function
function safeEval(expression) {
    return eval(expression);
}

// Memory recall (MRC)
memoryRecallButton.addEventListener('click', () => {
    if (memoryFlag) {
        memoryValue = 0;
        previousOperation.value = 'Memory cleared';
        memoryFlag = false;
    } else {
        currentOperation.value = memoryValue;
        previousOperation.value = `Recalled from Memory (M = ${memoryValue})`;
        memoryFlag = true;
        clearDisplayOnNextInput = false;
        setTimeout(() => {
            memoryFlag = false;
        }, 500);
    }
});

// Memory add (M+)
memoryAddButton.addEventListener('click', () => {
    const value = parseFloat(currentOperation.value);
    if (!isNaN(value)) {
        memoryValue += value;
        previousOperation.value = `Added ${value} to Memory (M = ${memoryValue})`;
    }
});

// Memory subtract (M-)
memorySubtractButton.addEventListener('click', () => {
    const value = parseFloat(currentOperation.value);
    if (!isNaN(value)) {
        memoryValue -= value;
        previousOperation.value = `Subtracted ${value} from Memory (M = ${memoryValue})`;
    }
});

// Grand Total (GT)
grandTotalButton.addEventListener('click', () => {
    currentOperation.value = grandTotal;
    previousOperation.value = `Grand Total (GT = ${grandTotal})`;
    clearDisplayOnNextInput = false;
});

// Calculate result
equalsButton.addEventListener('click', () => {
    try {
        if (currentOperation.value) {
            const expression = currentOperation.value.replace(/÷/g, '/').replace(/x/g, '*');
            const result = safeEval(expression);
            if (isFinite(result)) {
                const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
                grandTotal += formattedResult;
                lastResultIsNegative = formattedResult < 0;
                previousOperation.value = `${currentOperation.value} = ${formattedResult}`;
                updateHistory(currentOperation.value, formattedResult);
                currentOperation.value = formattedResult;
                clearDisplayOnNextInput = true;
            } else {
                previousOperation.value = 'Error: Invalid result';
                currentOperation.value = '0';
                clearDisplayOnNextInput = true;
            }
        }
    } catch (error) {
        previousOperation.value = 'Error: Invalid expression';
        currentOperation.value = '0';
        clearDisplayOnNextInput = true;
    }
});

// Update history function
function updateHistory(expression, result) {
    const newHistoryElement = document.createElement('li');
    newHistoryElement.innerHTML = `${expression} = ${result}`;
    historyList.appendChild(newHistoryElement);
}

// Clear history
clearHistoryButton.addEventListener('click', () => {
    historyList.innerHTML = '';
});

// Keyboard support
document.addEventListener('keydown', (event) => {
    if (/^[0-9]$/.test(event.key)) {
        document.querySelector(`[data-number="${event.key}"]`)?.click();
    } else if (event.key === '+') {
        document.querySelector('[data-operation="+"]')?.click();
    } else if (event.key === '-') {
        document.querySelector('[data-operation="-"]')?.click();
    } else if (event.key === '*') {
        document.querySelector('[data-operation="x"]')?.click();
    } else if (event.key === '/') {
        document.querySelector('[data-operation="÷"]')?.click();
    } else if (event.key === '%') {
        document.querySelector('[data-operation="%"]')?.click();
    } else if (event.key === 'Enter' || event.key === '=') {
        equalsButton.click();
    } else if (event.key === 'Backspace') {
        deleteButton.click();
    } else if (event.key === 'Escape') {
        clearButton.click();
    } else if (event.key === '.') {
        document.querySelector('[data-number="."]')?.click();
    }
});

// Disable keyboard input for final price (readonly)
finalPriceInput.addEventListener('keydown', (event) => {
    event.preventDefault();
});

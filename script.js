// Mendapatkan elemen-elemen utama dari dokumen
const currentOperation = document.getElementById('currentOperation');
const previousOperation = document.getElementById('previousOperation');
const historyList = document.getElementById('history');

// Variabel untuk menyimpan memori dan status
let memoryValue = 0;
let grandTotal = 0;
let memoryFlag = false;
let clearDisplayOnNextInput = true;

// Inisialisasi tampilan
currentOperation.value = '0';

// ----- EVENT LISTENERS -----

// Tombol angka (0-9 dan .)
document.querySelectorAll('[data-number]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (clearDisplayOnNextInput) {
      currentOperation.value = btn.value;
      clearDisplayOnNextInput = false;
    } else {
      // Mencegah multiple decimal points
      if (btn.value === '.' && currentOperation.value.includes('.')) return;
      currentOperation.value += btn.value;
    }
  });
});

// Tombol operasi (+, -, x, ÷, %)
document.querySelectorAll('[data-operation]').forEach(btn => {
  btn.addEventListener('click', () => {
    const lastChar = currentOperation.value.slice(-1);
    
    // Kasus khusus untuk tanda minus (angka negatif)
    if (btn.value === '-') {
      if (currentOperation.value === '0' || ['+', 'x', '÷', '%'].includes(lastChar)) {
        currentOperation.value = currentOperation.value === '0' ? '-' : currentOperation.value + '-';
        clearDisplayOnNextInput = false;
        return;
      }
    }
    
    // Menambah atau mengganti operator
    if (!['+', '-', 'x', '÷', '%'].includes(lastChar)) {
      currentOperation.value += btn.value;
    } else {
      currentOperation.value = currentOperation.value.slice(0, -1) + btn.value;
    }
    clearDisplayOnNextInput = false;
  });
});

// Tombol Clear (AC)
document.querySelector('[data-clear]').addEventListener('click', () => {
  currentOperation.value = '0';
  previousOperation.value = '';
  clearDisplayOnNextInput = true;
});

// Tombol Delete (DEL)
document.querySelector('[data-delete]').addEventListener('click', () => {
  currentOperation.value = currentOperation.value.slice(0, -1) || '0';
  if (currentOperation.value === '0') clearDisplayOnNextInput = true;
});

// Tombol Equals (=)
document.querySelector('[data-equals]').addEventListener('click', () => {
  try {
    const expression = currentOperation.value.replace(/÷/g, '/').replace(/x/g, '*');
    const result = eval(expression);
    
    if (isFinite(result)) {
      const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
      
      // Update total and display
      grandTotal += formattedResult;
      previousOperation.value = `${currentOperation.value} = ${formattedResult}`;
      updateHistory(currentOperation.value, formattedResult);
      currentOperation.value = formattedResult.toString();
      clearDisplayOnNextInput = true;
    } else {
      throw new Error('Hasil tidak valid');
    }
  } catch (error) {
    previousOperation.value = `Kesalahan: ${error.message || 'Ekspresi tidak valid'}`;
    currentOperation.value = '0';
    clearDisplayOnNextInput = true;
  }
});

// ----- FUNGSI MEMORI -----

// Memory Recall Clear (MRC)
document.querySelector('[data-mrc]').addEventListener('click', () => {
  if (memoryFlag) {
    memoryValue = 0;
    previousOperation.value = 'Memori dihapus';
    memoryFlag = false;
  } else {
    currentOperation.value = memoryValue.toString();
    previousOperation.value = `Dipanggil dari Memori (M = ${memoryValue})`;
    memoryFlag = true;
    clearDisplayOnNextInput = true;
    setTimeout(() => { memoryFlag = false; }, 500);
  }``
});

// Memory Add (M+)
document.querySelector('[data-m-plus]').addEventListener('click', () => {
  const value = parseFloat(currentOperation.value);
  if (!isNaN(value)) {
    memoryValue += value;
    previousOperation.value = `Menambahkan ${value} ke Memori (M = ${memoryValue})`;
  }
});

// Memory Subtract (M-)
document.querySelector('[data-m-minus]').addEventListener('click', () => {
  const value = parseFloat(currentOperation.value);
  if (!isNaN(value)) {
    memoryValue -= value;
    previousOperation.value = `Mengurangi ${value} dari Memori (M = ${memoryValue})`;
  }
});

// Grand Total (GT)
document.querySelector('[data-gt]').addEventListener('click', () => {
  if (isNaN(grandTotal)) grandTotal = 0;
  currentOperation.value = grandTotal.toString();
  previousOperation.value = `Total Keseluruhan (GT = ${grandTotal})`;
  clearDisplayOnNextInput = true;
});

// ----- FUNGSI PEMBANTU -----

// Update history
function updateHistory(expression, result) {
  const item = document.createElement('li');
  item.innerHTML = `${expression} = ${result}`;
  historyList.appendChild(item);
}

// Clear history
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  historyList.innerHTML = '';
});

// Dukungan keyboard
document.addEventListener('keydown', (event) => {
  // Numbers and operators
  if (/^[0-9]$/.test(event.key)) {
    document.querySelector(`[data-number="${event.key}"]`)?.click();
  } else if (['+', '-', '*', '/', '%', '.'].includes(event.key)) {
    const opMap = {'*': 'x', '/': '÷'};
    const op = opMap[event.key] || event.key;
    const selector = op === '.' ? `[data-number="."]` : `[data-operation="${op}"]`;
    document.querySelector(selector)?.click();
  } 
  // Command keys
  else if (event.key === 'Enter' || event.key === '=') {
    document.querySelector('[data-equals]').click();
  } else if (event.key === 'Backspace') {
    document.querySelector('[data-delete]').click();
  } else if (event.key === 'Escape') {
    document.querySelector('[data-clear]').click();
  }
});
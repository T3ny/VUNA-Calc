/***********************
 * GLOBAL STATE
 ***********************/
let left = '';
let operator = '';
let right = '';
let currentLang = 'en'; // 'en' or 'pt'

/***********************
 * INPUT HANDLING
 ***********************/
function appendToResult(value) {
  if (operator === '') {
    left += value.toString();
  } else {
    right += value.toString();
  }
  updateResult();
}

function bracketToResult(value) {
  if (operator === '') {
    left += value;
  } else {
    right += value;
  }
  updateResult();
}

function operatorToResult(op) {
  if (!left) return;
  if (right) calculateResult();
  operator = op;
  updateResult();
}

function backspace() {
  if (right) {
    right = right.slice(0, -1);
  } else if (operator) {
    operator = '';
  } else if (left) {
    left = left.slice(0, -1);
  }
  updateResult();
}

function clearResult() {
  left = '';
  right = '';
  operator = '';
  document.getElementById('word-area').style.display = 'none';
  updateResult();
}

/***********************
 * CALCULATIONS
 ***********************/
function calculateResult() {
  if (!left || !operator || !right) return;

  const l = parseFloat(left);
  const r = parseFloat(right);
  let result;

  switch (operator) {
    case '+': result = l + r; break;
    case '-': result = l - r; break;
    case '*': result = l * r; break;
    case '/': result = r !== 0 ? l / r : 'Error'; break;
    case '^': result = Math.pow(l, r); break;
    default: return;
  }

  left = result.toString();
  operator = '';
  right = '';
  updateResult();
}

function calculateSquare() {
  if (!left) return;
  left = (parseFloat(left) ** 2).toString();
  operator = '';
  right = '';
  updateResult();
}

function calculateCube() {
  if (!left) return;
  left = (parseFloat(left) ** 3).toString();
  operator = '';
  right = '';
  updateResult();
}

/***********************
 * INTEGRAL (∫ x² dx)
 * Simpson’s Rule
 ***********************/
function calculateIntegral() {
  if (!left || !right) {
    alert('Enter lower and upper limits');
    return;
  }

  let a = parseFloat(left);
  let b = parseFloat(right);

  if (isNaN(a) || isNaN(b)) return;

  const n = 1000;
  const h = (b - a) / n;

  function f(x) {
    return x * x; // x²
  }

  let sum = 0;
  for (let i = 0; i <= n; i++) {
    let x = a + i * h;
    if (i === 0 || i === n) sum += f(x);
    else if (i % 2 === 0) sum += 2 * f(x);
    else sum += 4 * f(x);
  }

  let result = (h / 3) * sum;

  left = result.toString();
  operator = '';
  right = '';
  updateResult();
}

/***********************
 * NUMBER → WORDS (EN)
 ***********************/
function numberToWords(num) {
  if (num === 'Error') return 'Error';
  const n = parseFloat(num);
  if (isNaN(n)) return '';
  if (n === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');

  return num.toString();
}

/***********************
 * NUMBER → WORDS (PT)
 ***********************/
function numberToWordsPT(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return '';
  if (n === 0) return 'Zero';

  const ones = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove'];
  const teens = ['Dez','Onze','Doze','Treze','Catorze','Quinze','Dezasseis','Dezassete','Dezoito','Dezanove'];
  const tens = ['', '', 'Vinte','Trinta','Quarenta','Cinquenta','Sessenta','Setenta','Oitenta','Noventa'];

  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 ? ' e ' + ones[n % 10] : '');

  return num.toString();
}

/***********************
 * DISPLAY + WORD AREA
 ***********************/
function updateResult() {
  const display = left + (operator ? ' ' + operator + ' ' : '') + right;
  document.getElementById('result').value = display || '0';

  const wordArea = document.getElementById('word-area');
  const wordResult = document.getElementById('word-result');

  if (left && !operator && !right) {
    const words =
      currentLang === 'en'
        ? numberToWords(left)
        : numberToWordsPT(left);

    wordResult.innerHTML = `
      <span class="small-label">
        ${currentLang === 'en' ? 'Result in words' : 'Resultado por extenso'}
      </span>
      <strong>${words}</strong>
    `;

    wordArea.style.display = 'flex';
    enableSpeakButton(true);
  } else {
    wordArea.style.display = 'none';
    enableSpeakButton(false);
  }
}

/***********************
 * SPEECH
 ***********************/
function speakResult() {
  const text = document.querySelector('#word-result strong')?.innerText;
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === 'en' ? 'en-US' : 'pt-PT';
  utterance.rate = 0.9;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function enableSpeakButton(state) {
  const btn = document.getElementById('speak-btn');
  if (btn) btn.disabled = !state;
}

/***********************
 * LANGUAGE TOGGLE
 ***********************/
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'pt' : 'en';
  updateResult();
}

/***********************
 * COPY
 ***********************/
function copyResult() {
  const value = document.getElementById('result').value;
  if (!value) return;

  navigator.clipboard.writeText(value)
    .then(() => alert('Copied!'))
    .catch(() => alert('Copy failed'));
}

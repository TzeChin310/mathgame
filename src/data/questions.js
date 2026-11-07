const question = (name, prompt, answer, choices) => ({ name, prompt, answer, choices });

const themes = [
  { sky: 0xc8edfb, hill: 0x8bd2b4, ground: 0x48a87e },
  { sky: 0xcdeafb, hill: 0x91c9b6, ground: 0x449c82 },
  { sky: 0xc9e6fc, hill: 0x90c5bb, ground: 0x448f84 },
  { sky: 0xcdeaf9, hill: 0x8fcbbd, ground: 0x3f9a87 },
  { sky: 0xc5e5fa, hill: 0x8ac7b4, ground: 0x3d927b },
  { sky: 0xc9e8f7, hill: 0x8dc9bb, ground: 0x438f7c },
  { sky: 0xc8e7fa, hill: 0x88c5b5, ground: 0x398e7b },
  { sky: 0xc6e8f8, hill: 0x8cc7b6, ground: 0x3b907d },
  { sky: 0xc7e6f9, hill: 0x87c4b1, ground: 0x388b78 },
  { sky: 0xc5e5fa, hill: 0x84c2ae, ground: 0x368875 },
];

// Each pool is one step in the easy-to-hard progression. A run draws one
// question from every pool so it always contains ten questions in order.
const questionPools = [
  [
    question('小學・加法', '8 + 7 = ?', '15', ['14', '15', '16']),
    question('小學・減法', '42 − 17 = ?', '25', ['24', '25', '26']),
    question('小學・加法', '36 + 27 = ?', '63', ['62', '63', '64']),
    question('小學・減法', '81 − 46 = ?', '35', ['34', '35', '36']),
  ],
  [
    question('小學・乘法', '7 × 8 = ?', '56', ['48', '56', '64']),
    question('小學・除法', '63 ÷ 9 = ?', '7', ['6', '7', '8']),
    question('小學・乘法', '6 × 9 = ?', '54', ['45', '54', '63']),
    question('小學・除法', '72 ÷ 8 = ?', '9', ['7', '8', '9']),
  ],
  [
    question('小學・分數', '3/4 + 1/8 = ?', '7/8', ['5/8', '7/8', '1']),
    question('小學・分數', '2/3 − 1/6 = ?', '1/2', ['1/3', '1/2', '2/3']),
    question('小學・小數', '0.6 + 0.75 = ?', '1.35', ['1.25', '1.35', '1.45']),
    question('小學・小數', '1.2 ÷ 0.3 = ?', '4', ['3', '4', '5']),
  ],
  [
    question('國中・百分比', '160 的 25% = ?', '40', ['32', '40', '48']),
    question('國中・折扣', '200 元打八折，售價 = ?', '160', ['140', '160', '180']),
    question('國中・比例', '甲乙比 2:3，總數 25，乙 = ?', '15', ['10', '15', '20']),
    question('國中・百分比', '80 增加 25% 後 = ?', '100', ['95', '100', '105']),
  ],
  [
    question('國中・一次方程式', '3x + 5 = 20，x = ?', '5', ['4', '5', '6']),
    question('國中・一次方程式', '2(x + 3) = 18，x = ?', '6', ['5', '6', '7']),
    question('國中・一次方程式', '5x − 9 = 26，x = ?', '7', ['6', '7', '8']),
    question('國中・一次方程式', 'x/4 + 3 = 8，x = ?', '20', ['16', '20', '24']),
  ],
  [
    question('國中・畢氏定理', '直角邊 5、12，斜邊 = ?', '13', ['12', '13', '14']),
    question('國中・三角形面積', '底 10、高 6，面積 = ?', '30', ['25', '30', '35']),
    question('國中・周長', '長方形長 8、寬 5，周長 = ?', '26', ['24', '26', '28']),
    question('國中・座標斜率', '通過 (1,2)、(3,6) 的直線斜率 = ?', '2', ['1', '2', '3']),
  ],
  [
    question('高中・二次方程式', 'x² − 5x + 6 = 0，較大根 = ?', '3', ['2', '3', '4']),
    question('高中・二次方程式', 'x² − 7x + 12 = 0，較大根 = ?', '4', ['3', '4', '5']),
    question('高中・二次方程式', 'x² + x − 12 = 0，較大根 = ?', '3', ['−4', '3', '4']),
    question('高中・二次方程式', '2x² − 8x + 6 = 0，較小根 = ?', '1', ['1', '2', '3']),
  ],
  [
    question('高中・三角函數', 'sin 30° = ?', '1/2', ['1/2', '√3/2', '1']),
    question('高中・三角函數', 'cos 60° = ?', '1/2', ['0', '1/2', '√3/2']),
    question('高中・三角函數', 'tan 45° = ?', '1', ['0', '1', '√3']),
    question('高中・三角恆等式', 'sin²30° + cos²30° = ?', '1', ['1/2', '1', '2']),
  ],
  [
    question('大學・微分', 'f(x) = x³，f′(x) = ?', '3x²', ['x²', '3x²', '3x']),
    question('大學・微分', 'f(x) = x⁴，f′(x) = ?', '4x³', ['3x²', '4x³', '4x²']),
    question('大學・微分', 'f(x) = sin x，f′(x) = ?', 'cos x', ['−sin x', 'cos x', 'sin x']),
    question('大學・微分', 'f(x) = 2x³ − 5x，f′(x) = ?', '6x² − 5', ['6x² + 5', '6x² − 5', '2x² − 5']),
  ],
  [
    question('大學・定積分', '∫₀^π sin x dx = ?', '2', ['0', '1', '2']),
    question('大學・定積分', '∫₀² x dx = ?', '2', ['1', '2', '4']),
    question('大學・定積分', '∫₀¹ 3x² dx = ?', '1', ['0', '1', '3']),
    question('大學・定積分', '∫₀^π cos x dx = ?', '0', ['0', '1', '2']),
  ],
];

export function createQuestionSet(previousQuestions = []) {
  return questionPools.map((pool, index) => {
    const previousPrompt = previousQuestions[index]?.prompt;
    const freshPool = pool.filter((item) => item.prompt !== previousPrompt);
    const available = freshPool.length ? freshPool : pool;
    const selected = available[Math.floor(Math.random() * available.length)];
    return { ...selected, ...themes[index] };
  });
}

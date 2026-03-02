function highlightElement(el, text) {
  //const el = document.querySelector(selector);
  const rect = el.getBoundingClientRect();

  const highlight = document.querySelector('.tutorial-highlight');
  highlight.style.top = `${rect.top + window.scrollY}px`;
  highlight.style.left = `${rect.left + window.scrollX}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;

  const tooltip = document.querySelector('.tutorial-tooltip');
  tooltip.style.top = `${rect.bottom + 10 + window.scrollY}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  const tutorialText = document.getElementById('tutorial-text')
  tutorialText.innerText = text;
  console.log(`Setting element ${tutorialText} text to ${text}, ${tutorialText.innerText}`)
}

const tickerInput = document.getElementById('tickerInput');
const fetchButton = document.getElementById('getStock');
const buyButton = document.getElementById('buyButton');
const sellButton = document.getElementById('sellButton');
const addCashButton = document.getElementById('addCash');
const gotoSandboxButton = document.getElementById('sandboxBtn');

const tutorialSteps = [
    { element: tickerInput, text: 'Start by entering a stock ticker symbol here.' },
    { element: fetchButton, text: 'Click this button to fetch the stock data and see the price chart.' },
    { element: buyButton, text: 'Use this button to buy shares of the stock.' },
    { element: sellButton, text: 'Use this button to sell shares of the stock.' },
    { element: addCashButton, text: 'Click here to add cash to your account.' },
    { element: gotoSandboxButton, text: 'Go to the sandbox environment to test out trading strategies without risking real money.' }
]

let currentStep = 0;
function toTutorialStep(step) {
    console.log('Going to tutorial step', step);
    if (step < tutorialSteps.length) {
        const stepInfo = tutorialSteps[step];
        console.log('Highlighting element', stepInfo.element, 'with text', stepInfo.text);
        highlightElement(stepInfo.element, stepInfo.text);
    } else {
        document.getElementById('tutorial-overlay').classList.add('hidden');
    }
}

const startTutorialButton = document.getElementById('start-tutorial');
startTutorialButton.addEventListener('click', () => {
    document.getElementById('tutorial-overlay').classList.remove('hidden');
    currentStep = 0;
    toTutorialStep(currentStep);
});

const nextButton = document.getElementById('next-step');
nextButton.addEventListener('click', () => {
    currentStep++;
    toTutorialStep(currentStep);
});


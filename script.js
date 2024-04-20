
const globalTooltip = setTooltip();

//color for passwords - all
const sqrtScalePwAll = d3.scaleSqrt()
.domain([1, 100]) //max domain is calculated and changed later!
.range([1, 30]);

const colorScalePwAll = d3.scaleSequential(d3.interpolateOrRd)
.domain([1, 100]);

// color for passwords - first letter

const sqrtScalePwFirst = d3.scaleSqrt()
.domain([1, 100])
.range([1, 30]);

const colorScalePwFirst = d3.scaleSequential(d3.interpolateOrRd)
.domain([1, 100]);


function countCharacters(wordList, countingFunction, considerUppercase) {
  if (!considerUppercase) {
      wordList = wordList.map(word => word.toLowerCase());
  }
  return countingFunction(wordList);
}


function countAllOccurrences(wordList) {
  const charCounts = {};
  wordList.forEach(word => {
    for (const char of word) {
      if (charCounts[char]) {
        charCounts[char]++;
      } else {
        charCounts[char] = 1;
      }
    }
  });
  return charCounts;
}

function countFirstChar(wordList) {
  const firstCharCounts = {};
  wordList.forEach(word => {
    const firstChar = word[0];
    if (firstCharCounts[firstChar]) {
      firstCharCounts[firstChar]++;
    } else {
      firstCharCounts[firstChar] = 1;
    }
  });
  return firstCharCounts;
}

function loadDataCreateKb(dataPath, containerId, countingFunction, colorScale, considerUppercase){
  d3.csv(dataPath).then(data => {
    const words = data.map(d => d.string);
    const charCounts = countCharacters(words, countingFunction);
    console.log(`Character counts for ${containerId}: `, charCounts);

    createKeyboard(containerId, charCounts, colorScale, considerUppercase);
  });
}

loadDataCreateKb("assets/passwords.csv", 'kbOne', countAllOccurrences, colorScalePwAll, true);
loadDataCreateKb("assets/passwords.csv", 'kbTwo', countFirstChar, colorScalePwFirst, true);


const kbLayout = [
  [{ char1: '1', char2: '!' },
  { char1: '2', char2: '@' },
  { char1: '3', char2: '#' },
  { char1: '4', char2: '$' },
  { char1: '5', char2: '%' },
  { char1: '6', char2: '^' },
  { char1: '7', char2: '&' },
  { char1: '8', char2: '*' },
  { char1: '9', char2: '(' },
  { char1: '0', char2: ')' },
  { char1: '-', char2: '_' },
  { char1: '=', char2: '+' }],

  [{ char1: 'q', char2: 'Q' },
  { char1: 'w', char2: 'W' },
  { char1: 'e', char2: 'E' },
  { char1: 'r', char2: 'R' },
  { char1: 't', char2: 'T' },
  { char1: 'y', char2: 'Y' },
  { char1: 'u', char2: 'U' },
  { char1: 'i', char2: 'I' },
  { char1: 'o', char2: 'O' },
  { char1: 'p', char2: 'P' },
  { char1: '[', char2: '{' },
  { char1: ']', char2: '}' }],

  [{ char1: 'a', char2: 'A' },
  { char1: 's', char2: 'S' },
  { char1: 'd', char2: 'D' },
  { char1: 'f', char2: 'F' },
  { char1: 'g', char2: 'G' },
  { char1: 'h', char2: 'H' },
  { char1: 'j', char2: 'J' },
  { char1: 'k', char2: 'K' },
  { char1: 'l', char2: 'L' },
  { char1: ';', char2: ':' }],

  [{ char1: 'z', char2: 'Z' },
  { char1: 'x', char2: 'X' },
  { char1: 'c', char2: 'C' },
  { char1: 'v', char2: 'V' },
  { char1: 'b', char2: 'B' },
  { char1: 'n', char2: 'N' },
  { char1: 'm', char2: 'M' },
  { char1: ',', char2: '<' },
  { char1: '.', char2: '>' },
  { char1: '/', char2: '?' }]

];


function createKeyboard(containerId, charCounts, colorScale, considerUppercase) {
  const kbContainer = document.createElement('div');
  kbContainer.className = 'keyboard';
  const totalOccurrences = Object.values(charCounts).reduce((a, b) => a + b, 0);

  kbLayout.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      row.forEach(key => {
          const keyDiv = document.createElement('div');
          keyDiv.className = 'keyboard-key';

          const char1Div = document.createElement('div');
          char1Div.className = 'char1';
          char1Div.textContent = considerUppercase ? key.char1 : key.char1.toLowerCase(); 
          keyDiv.appendChild(char1Div);

          // Add event listeners to the lowercase key
          addEventListeners(char1Div, charCounts, totalOccurrences);

          if (considerUppercase && key.char2) {
              const char2Div = document.createElement('div');
              char2Div.className = 'char2';
              char2Div.textContent = key.char2;
              keyDiv.appendChild(char2Div);

              // Add event listeners to the uppercase key
              addEventListeners(char2Div, charCounts, totalOccurrences);
          }

          rowDiv.appendChild(keyDiv);
      });

      kbContainer.appendChild(rowDiv);
  });

  document.getElementById(containerId).appendChild(kbContainer);

  colorKeysByOccurrence(charCounts, kbContainer, colorScale);
}


function addEventListeners(element, charCounts, totalOccurrences) {
  element.addEventListener('mouseover', function(e) {
    const count = charCounts[element.textContent] || 0;
    const percentage = ((count / totalOccurrences) * 100).toFixed(3);
    globalTooltip.textContent = `${element.textContent}: ${percentage}%`;
    globalTooltip.style.visibility = 'visible';
    globalTooltip.style.top = `${e.pageY + 10}px`;
    globalTooltip.style.left = `${e.pageX + 10}px`;
  });

  element.addEventListener('mousemove', function(e) {
    globalTooltip.style.top = `${e.pageY + 10}px`;
    globalTooltip.style.left = `${e.pageX + 10}px`;
  });

  element.addEventListener('mouseout', function(e) {
    globalTooltip.style.visibility = 'hidden';
  });
}



function setTooltip(){
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
  return tooltip;
}



function getMaxOccurrence(occurrences) {
  return Math.max(...Object.values(occurrences));
}

function encodeCharForId(char) {
  return `key-${char.charCodeAt(0)}`;
}


function colorKeysByOccurrence(charCounts, kbContainer, colorScale) {
  const maxOccurrence = getMaxOccurrence(charCounts);
  colorScale.domain([0, maxOccurrence]);

  kbContainer.querySelectorAll('.keyboard-key').forEach(keyDiv => {
    const char1Div = keyDiv.querySelector('.char1');
    const char2Div = keyDiv.querySelector('.char2');  // This might be null

    const char1 = char1Div.textContent;
    const count1 = charCounts[char1] || 0;
    const color1 = colorScale(count1);

    char1Div.style.backgroundColor = color1;
    char1Div.style.color = getBrightness(color1);

    if (char2Div) {
      const char2 = char2Div.textContent;
      const count2 = charCounts[char2] || 0;
      const color2 = colorScale(count2);

      char2Div.style.backgroundColor = color2;
      char2Div.style.color = getBrightness(color2);
    }
  });
}



function getBrightness(color) {
    // Extracting RGB values from the 'rgb(255, 255, 255)' format
    const rgb = color.match(/\d+/g); 
    
    if (!rgb || rgb.length < 3) {
        console.error('Invalid RGB format', color);
        return 'black'; 
    }
    
    const r = parseInt(rgb[0], 10);  
    const g = parseInt(rgb[1], 10);  
    const b = parseInt(rgb[2], 10);  
    
    // Brightness calculation using the luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return 'black' if background is light; 'white' if dark
    return brightness > 127 ? 'black' : 'white';
}



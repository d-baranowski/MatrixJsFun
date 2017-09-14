animate = window.requestAnimationFrame
canvas = document.getElementById('canvas')
paused = false
lettersToRemove = []
mainClock = new Counter(0, 1)
xToLetters = {}
minKey = 10

window.onkeypress = function() {
  paused = !paused
}



function mergeSort(arr)
{
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left   = arr.slice(0, middle);
    var right  = arr.slice(middle, arr.length);

    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right)
{
    var result = [];

    while (left.length && right.length) {
        if (xToLetters[left[0]] <= xToLetters[right[0]]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

function Counter(val, rate) {
  this.count = val
  this.tick = function() {
    this.count = (this.count + 1 * rate) % 1000
    return this.count
  }
}

function Letter(letter, x, y, color, letters) {
  this.letter = letter
  this.x = x
  this.y = y
  this.color = color
  this.clock = new Counter(rand(0, 1000), rand(1, 3))

  if (xToLetters[x] === undefined) {
    xToLetters[x] = 0
  }
  xToLetters[x]++

  if (letters.length !== undefined) {
    for (i = 1; i < rand(10, 30); i++) {
      letters.push(new Letter(this.letter,this.x, this.y - 16 * i, this.color, i))
    }
  }

  this.draw = function(ctx) {
    clock = this.clock.tick()

    if (clock % 5 === 0) {
      this.letter = randUTF()
      if (letters.length !== undefined) {
        this.color = increaseBrightness(this.color, 0.9)
      } else {
        this.color = increaseBrightness(this.color, 1 - (letters * 0.12))
      }
    }

    this.y = this.y + 6
    ctx.fillStyle = this.color
    ctx.fillText(this.letter, this.x, this.y)
  }
}

function increaseBrightness(hex, percent){
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randUTF() {
  return String.fromCharCode(rand(2300, 2500))
}

function init() {
  letters = []
  w = window.innerWidth
  for (i = 0; i < w / 20; i++) {
    x = i * 20
    xToLetters[x] = 0
  }
  for (j = 0; j < w / 20; j++) {
    x = j * 20
    letters.push(new Letter('A', x ,0,'#2f7c2f', letters))
  }
  animate(draw);
}

function draw() {
  w = window.innerWidth
  h = window.innerHeight
  clockVal = mainClock.tick();
  canvas.width = w
  canvas.height = h
  ctx = canvas.getContext('2d')

  ctx.globalCompositeOperation = 'destination-over'
  ctx.clearRect(0, 0, w, h)
  ctx.rect(0, 0, w, h)
  ctx.font = 'bold 17px serif'

  for (j = lettersToRemove.length - 1; j >= 0; j--) {
      xToLetters[letters[lettersToRemove[j]].x]--
      letters.splice(lettersToRemove[j], 1)
      lettersToRemove.splice(j,1)
  }

  // iterateBy = rand(1, 6)
  // for (j = rand(0, 3) ; j < w / 20; j = j + iterateBy) {
  //   x = j * 20
  //   if (xToLetters[x] < xToLetters[minKey]) {
  //     minKey = x;
  //   }
  // }

  xSortedByLetters = Object.keys(xToLetters)
  xSortedByLetters = mergeSort(xSortedByLetters)

  if (!paused) {
    letters.push(new Letter('A',xSortedByLetters[0] ,0,'#2f7c2f', letters))
  }

  for (var letter in letters) {
    if (letters[letter].y > h + 20) {
      lettersToRemove.push(letter)
    } else {
      letters[letter].draw(ctx, letters)
    }
  }

  ctx.save()
  ctx.restore()
  animate(draw)
}

init()

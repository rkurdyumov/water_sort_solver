'use strict';

class GameDisplay {
  constructor(context) {
    this.ctx = context;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.strokeStyle = 'rgba(200, 200, 200, 1)';
    this.ctx.lineWidth = 3;

    this.vialDimensions = []; // Populated when we call draw().
    this.colorMap = new Map([
      [' ', 'rgba(0, 0, 0, 0)'], // no fill (transparent)
      ['A', 'rgba(58, 46, 195, 1)'], // blue
      ['B', 'rgba(232, 140, 66, 1)'], // orange
      ['C', 'rgba(197, 42, 35, 1)'], // red
      ['D', 'rgba(98, 214, 124, 1)'], // lime
      ['E', 'rgba(234, 94, 123, 1)'], // pink
      ['F', 'rgba(100, 100, 100, 1)'], // gray
      ['G', 'rgba(84, 163, 228, 1)'], // sky blue
      ['H', 'rgba(113, 43, 147, 1)'], // purple
      ['I', 'rgba(120, 150, 11, 1)'], // olive green
      ['J','rgba(241, 218, 87, 1)'], // yellow
      ['K', 'rgba(126, 74, 7, 1)'], // brown
      ['L', 'rgba(16, 101, 51, 1)'] // forest green
    ]);
  }

  draw(stacks_to_draw, selected) {
    // Clear previous drawing.
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    // Store the stacks as [['A', 'B' , 'C', ''], ['D', 'E', 'F', 'G'], etc..]
    const stacks = [];
    for (const stack of stacks_to_draw) {
      stacks.push([...stack.padEnd(4)]);
    }
    if (selected === null) selected = [-1, -1];  // [stack, segment]

    this.vialDimensions = GameDisplay.getVialDimensions(stacks.length);
    for (const [i, dims] of this.vialDimensions.entries()) {
      const [x, y, width, height] = dims;
      const colors = [];
      for (let j = 0; j < stacks[i].length; j++) {
        colors.push(this.colorMap.get(stacks[i][j]));
      }
      // Highlight selected vial segment white.
      const [stack, segment] = selected;
      if (i == stack) {
        colors[segment] = 'rgba(255, 255, 255, 1)'; // white
      }
      this.drawVial(x, y, width, height);
      this.fillSegments(x, y, width, height, colors);
    }
  }

  drawVial(x, y, width, height, colors) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + width, y);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.arc(x + width/2, y + height, width/2, 0, Math.PI, false);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  fillSegments(x, y, width, height, colors) {
    // Split the vial rectangle into 8 strips. The top strip will be empty;
    // Each segment will consist of 2 strips; the bottom segment will have
    // one rectangular strip and one semicircular arc.
    const dy = height/8;
    const pad = this.ctx.lineWidth/2;
    const x1 = x + pad;
    const x2 = x + width - pad;

    this.fillVialSegmentRect(x1, y + 1*dy, x2, y + 3*dy, colors[3]);
    this.fillVialSegmentRect(x1, y + 3*dy, x2, y + 5*dy, colors[2]);
    this.fillVialSegmentRect(x1, y + 5*dy, x2, y + 7*dy, colors[1]);
    this.fillVialSegmentBottom(x1, y + 7*dy, x2, y + 8*dy, colors[0]);
  }

  fillVialSegmentRect(x1, y1, x2, y2, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x1, y2);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  fillVialSegmentBottom(x1, y1, x2, y2, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x1, y2);
    const radius = (x2 - x1)/2;
    this.ctx.arc((x2 + x1)/2, y2, radius, Math.PI, 0, true);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x2, y1);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  inWhichStackSegment(x, y) {
    for (const [i, dims] of this.vialDimensions.entries()) {
      const [x1, y1, width, height] = dims;
      const dy = height/8;
      const x2 = x1 + width;
      // Return [stack, segment]
      if (isPointInBottom(x1, y1 + 7*dy, x2, y1 + 8*dy, x, y)) return [i, 0];
      if (isPointInRectangle(x1, y1 + 5*dy, x2, y1 + 7*dy, x, y)) return [i, 1];
      if (isPointInRectangle(x1, y1 + 3*dy, x2, y1 + 5*dy, x, y)) return [i, 2];
      if (isPointInRectangle(x1, y1 + 1*dy, x2, y1 + 3*dy, x, y)) return [i, 3];
    }
    return null;
  }

  static getVialDimensions(numStacks) {
    const dimsArray = [];
    const radius = 20;
    // Height must be divisible by 8 to avoid empty pixels when filling colors.
    // On retina screens with 2x scale, height must be divisible by 4.
    const height = radius * 7;
    const x0 = 5;
    const y0 = 10;
    const spacing = 2.5 * radius;
    const gap = radius;
    for (let i = 0; i < Math.round(numStacks / 2); i++) {
      // [x, y, width, height] where (x,y) is the top left vial corner
      dimsArray.push([x0 + i * spacing, y0, 2 * radius, height]);
    }
    for (let i = 0; i < Math.floor(numStacks / 2); i++) {
      dimsArray.push([x0 + i*spacing, y0 + height + radius + gap,
                      2 * radius, height]);
    }
    return dimsArray;
  }
}

class GameManager {
  constructor() {
    this.canvas = GameManager.getInitializedCanvas();
    this.gameDisplay = new GameDisplay(this.canvas.getContext('2d'));

    this.canvas.addEventListener('click', event => this.onMouseClick(event));
    this.vialSelect = document.querySelector('#vials');
    this.vialSelect.addEventListener('change', event => this.onVialSelect(event));

    this.solveButton = document.querySelector('#solve');
    this.solveButton.addEventListener('click', () => this.onSolveButtonPress());
    this.backButton = document.querySelector('#back');
    this.backButton.addEventListener('click', () => this.onBackButtonPress());
    this.stepButton = document.querySelector('#step');
    this.stepButton.addEventListener('click', () => this.onStepButtonPress());
    this.resetButton = document.querySelector('#reset');
    this.resetButton.addEventListener('click', () => this.onResetButtonPress());
    this.counter = document.querySelector('#counter');

    this.initializeStacks(14);
    this.gameDisplay.draw(this.currentStacks, this.selectedSegment);
    this.handleButtonStatus();
  }

  initializeStacks(numStacks) {
    switch(numStacks) {
      case 14:
        this.resetStacks = [
          'ABCD', 'ABCD', 'ABCD', 'ABCD', 'EFGH', 'EFGH', 'EFGH', 'EFGH',
          'IJKL', 'IJKL', 'IJKL', 'IJKL', '', ''];
        break;
      case 11:
        this.resetStacks = [
          'ABCD', 'ABCD', 'ABCD', 'ABCD', 'EFGH', 'EFGH', 'EFGH', 'EFGH',
          'IIII', '', ''];
        break;
      case 9:
        this.resetStacks = [
          'ABCD', 'ABCD', 'ABCD', 'ABCD', 'EEFG', 'EFFG', 'EFGG', '', ''];
        break;
    }
    this.selectedSegment = null;
    this.currentStacks = this.resetStacks;
    this.solutionArray = [];
    this.solutionIndex = -1;
  }

  onMouseClick(event) {
    const x = event.layerX;
    const y = event.layerY;
    const curr = this.gameDisplay.inWhichStackSegment(x, y);
    const prev = this.selectedSegment;
    if (curr === null || prev === null || prev === curr) {
      this.selectedSegment = curr;
    } else {
      // Swap two segments.  Swapping is easier with an array of characters.
      const unpacked = [];
      for (const stack of this.currentStacks) {
        unpacked.push([...stack.padEnd(4)]);
      }
      const temp = unpacked[prev[0]][prev[1]];
      unpacked[prev[0]][prev[1]] = unpacked[curr[0]][curr[1]];
      unpacked[curr[0]][curr[1]] = temp;
      const newStacks = [];
      for (const stack of unpacked) {
        newStacks.push(stack.join('').trimEnd());
      }
      if (JSON.stringify(newStacks) !== JSON.stringify(this.currentStacks)) {
        this.solutionArray = [];
        this.solutionIndex = -1;
      }
      this.currentStacks = newStacks;
      this.selectedSegment = null;
    }
    this.gameDisplay.draw(this.currentStacks, this.selectedSegment);
    this.handleButtonStatus();
  }

  onVialSelect(event) {
    this.initializeStacks(Number(event.target.value));
    this.gameDisplay.draw(this.currentStacks, this.selectedSegment);
    this.handleButtonStatus();
  }

  onSolveButtonPress() {
    if (!this.isValidGameState()) {
      alert('Not a valid game state!');
      return;
    }
    const solution = GameState.solve(new GameState(this.currentStacks));
    if (solution.length === 0){
      alert('Cannot find solution!');
      return;
    }
    this.solutionArray = solution;
    this.solutionIndex = 0;
    // Copy in case the solution gets invalidated.
    this.resetStacks = this.solutionArray[this.solutionIndex].map(
      arr => arr.slice());
    this.currentStacks = this.solutionArray[this.solutionIndex];
    this.handleButtonStatus();
  }

  onBackButtonPress() {
    this.solutionIndex--;
    this.currentStacks = this.solutionArray[this.solutionIndex];
    this.gameDisplay.draw(this.currentStacks, this.selectedSegment);
    this.handleButtonStatus();
  }

  onStepButtonPress() {
    this.solutionIndex++;
    this.currentStacks = this.solutionArray[this.solutionIndex];
    this.gameDisplay.draw(this.currentStacks, this.selectedSegment);
    this.handleButtonStatus();
  }

  onResetButtonPress() {
    this.currentStacks = this.resetStacks;
    this.selectedSegment = null;
    if (this.solved()) {
      this.solutionIndex = 0;
    }
    this.gameDisplay.draw(this.currentStacks, this.selectedSegment);
    this.handleButtonStatus();
  }

  handleButtonStatus() {
    // Default to disabled, then enable.
    this.solveButton.disabled = true;
    this.backButton.disabled = true;
    this.stepButton.disabled = true;
    // Don't allow button presses mid-move.
    if (this.selectedSegment !== null) return;
    if (!this.solved()) {
      this.solveButton.disabled = false;
    }
    if (this.solved() && this.solutionIndex > 0) {
      this.backButton.disabled = false;
    }
    if (this.solved() && this.solutionIndex < this.solutionArray.length - 1) {
      this.stepButton.disabled = false;
    }
    // TODO: Technically not a button, so should be separate.
    if (this.solved()) {
      const index = 1 + this.solutionIndex;
      const numSolutionSteps = this.solutionArray.length.toString();
      this.counter.innerHTML = ` ${index}/${numSolutionSteps}`;
    }
  }

  isValidGameState() {
    // Any white space under a filled segment is invalid.
    for (const stack of this.currentStacks) {
      if (stack.indexOf(' ') >= 0) return false;
    }
    return true;
  }

  solved() {
    return this.solutionArray.length > 0;
  }

  static getInitializedCanvas() {
    const canvas = document.querySelector('#canvas');
    // Set display size (css pixels).  Manually chosen to fit 14 vials.
    const width = 350;
    const height = 360;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Set actual size in memory (scaled to account for extra pixel density).
    // Change to 1 on retina screens to see blurry canvas.
    const scale = window.devicePixelRatio;
    canvas.width = width * scale;
    canvas.height = height * scale;

    // Normalize coordinate system to use css pixels.
    canvas.getContext('2d').scale(scale, scale);
    return canvas;
  }
}

// Utility functions.
// TODO: Investigate why canvas isPointInPath doesn't work.
function isPointInRectangle(x1, y1, x2, y2, x, y) {
  if (x < x1 || x > x2 || y < y1 || y > y2) return false;
  return true;
}
function isPointInBottom(x1, y1, x2, y2, x, y) {
  const xMid = (x1 + x2)/2;
  const radius = (x2 - x1)/2;
  if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
    return true;
  } else if ((x - xMid)**2 + (y - y2)**2 <= radius**2) {
    return true;
  }
  return false;
}

const manager = new GameManager();
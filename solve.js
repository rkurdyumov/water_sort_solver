"use strict";

class Stack {
  constructor(items="") {
    this.items = [...items];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  top() {
    return this.items.slice(-1)[0];
  }
  full() {
    return this.items.length === 4;
  }
  empty() {
    return this.items.length === 0;
  }
  missingOne() {
    return this.items.length == 3 && this.monocolor();
  }
  monocolor() {
    return this.items.every(elem => elem === this.items[0]);
  }
  solved() {
    return this.full() && this.monocolor();
  }
  getItems() {
    return this.items;
  }
  toString() {
    return this.items.join("").padEnd(4, " ");
  }
}

class GameState {
  constructor(stackArray) {
    this.stacks = [];
    for (const stack of stackArray) {
      this.stacks.push(new Stack(stack));
    }
  }
  deepcopy() {
    const stacks = [];
    for (const stack of this.stacks) {
      stacks.push(stack.getItems());
    }
    return new GameState(stacks);
  }
  solved() {
    return this.stacks.every(s => s.solved() || s.empty());
  }
  isLegalMove(orig, dest) {
    if (orig === dest) return false;
    if (this.stacks[dest].full()) return false;
    if (this.stacks[orig].empty() || this.stacks[orig].solved()) return false;
    if (this.stacks[dest].empty()) {
      // Not illegal, but moving monocolor stack into empty makes no progress.
      return this.stacks[orig].monocolor() ? false : true;
    }
    // Not illegal, but moving monocolor 3-stack makes no progress.
    if (this.stacks[orig].missingOne()) return false;
    if (this.stacks[orig].top() !== this.stacks[dest].top()) return false;
    return true;
  }
  getLegalMoves() {
    const legal_moves = []; // [from, to]
    for (let orig = 0; orig < this.stacks.length; orig++) {
      for (let dest = 0; dest < this.stacks.length; dest++) {
        if (this.isLegalMove(orig, dest)) {
          legal_moves.push([orig, dest]);
        }
      }
    }
    return legal_moves;
  }
  move(orig, dest) {
    while (this.isLegalMove(orig, dest)) {
      this.stacks[dest].push(this.stacks[orig].pop());
    }
  }
  getKey() {
    return GameState.stacksToKey(this.stacks);
  }
  static stacksToKey(stacks) {
    const key = [];
    for (const stack of stacks) {
      key.push(stack.toString());
    }
    return key.join("|");
  }
  static keyToStacks(key) {
    const stacks= [];
    for (const split of key.split("|")) {
      stacks.push(split.trim());
    }
    return stacks;
  }

  static solve(initial_state) {
    // TODO: Implement a more optimal algorithm than depth-first-search.
    const stack = [initial_state];
    const visited = new Set();
    const parent = new Map();
    while (stack.length > 0) {
      let current_state = stack.pop();
      visited.add(current_state.getKey());
      if (current_state.solved()) {
        let current_key = current_state.getKey();
        const steps = [GameState.keyToStacks(current_key)];
        while (current_key !== initial_state.getKey()) {
          steps.push(GameState.keyToStacks(parent[current_key]));
          current_key = parent[current_key];
        }
        return steps.reverse();
      }
      for (const move of current_state.getLegalMoves()) {
        const new_state = current_state.deepcopy();
        new_state.move(move[0], move[1]);
        if (!visited.has(new_state.getKey())) {
          stack.push(new_state);
          parent[new_state.getKey()] = current_state.getKey();
          visited.add(new_state.getKey());
        }
      }
    }
    return [];
  }
}
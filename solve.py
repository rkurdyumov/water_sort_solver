# The original implementation of the water sort solver in Python.
import copy
import time

class Stack():
    def __init__(self, items=""):
        self._stack = list(items)

    def __eq__(self, other):
        if isinstance(other, type(self)):
            return self._stack == other._stack
        return NotImplemented

    def push(self, item):
        self._stack.append(item)

    def pop(self):
        return self._stack.pop()

    def top(self):
        return self._stack[-1]

    def full(self):
        return len(self._stack) == 4

    def empty(self):
        return len(self._stack) == 0

    def monocolor(self):
        return all(x == self._stack[0] for x in self._stack)

    def missing_one(self):
        return len(self._stack) == 3 and self.monocolor()

    def solved(self):
        return self.full() and self.monocolor()

    def __repr__(self):
        return "Stack('{}')".format("".join(self._stack))

    def __str__(self):
        return "".join(self._stack)

class GameState():
    def __init__(self, stacks):
        self._stacks = [Stack(stack.strip()) for stack in stacks]

    def __hash__(self):
        return hash(self.__str__())

    def __eq__(self, other):
        if isinstance(other, type(self)):
            return self._stacks == other._stacks
        return NotImplemented

    def solved(self):
        return all(stack.solved() or stack.empty() for stack in self._stacks)

    def is_legal_move(self, orig, dest):
        if orig == dest:
            return False
        if self._stacks[dest].full():
            return False
        if self._stacks[orig].empty() or self._stacks[orig].solved():
            return False
        if self._stacks[dest].empty():
            # Legal but strictly sub-optimal
            return False if self._stacks[orig].monocolor() else True
        if self._stacks[orig].missing_one():
            # Legal but strictly sub-optimal
            return False
        if self._stacks[orig].top() != self._stacks[dest].top():
            return False
        return True

    def get_legal_moves(self):
        legal_moves = [] # [from, to]
        for orig in range(len(self._stacks)):
            for dest in range(len(self._stacks)):
                if self.is_legal_move(orig, dest):
                    legal_moves.append([orig, dest])
        return legal_moves

    def move(self, orig, dest):
        while self.is_legal_move(orig, dest):
            self._stacks[dest].push(self._stacks[orig].pop())

    def __repr__(self):
        return "GameState('{}')".format(self.arg_string())

    def arg_string(self):
        return "".join(str(stack).ljust(4) for stack in self._stacks)

    def __str__(self):
        return "|".join(str(stack).ljust(4) for stack in self._stacks)

def solve(initial_state):
    stack = [initial_state]
    visited = {initial_state}
    parent = {}
    while stack:
        current_state = stack.pop()
        if current_state.solved():
            steps = [current_state]
            while current_state != initial_state:
                steps.append(parent[current_state])
                current_state = parent[current_state]
            return reversed(steps)

        for move in current_state.get_legal_moves():
            new_state = copy.deepcopy(current_state)
            new_state.move(*move)
            if new_state not in visited:
                stack.append(new_state)
                parent[new_state] = current_state
                visited.add(new_state)
    return None

state = GameState(["FHDB", "CEEE", "GDHD", "AGBF", "FGHA", "AGIE", "BCHD",
                   "CIFI", "CABI", "", ""])

start = time.time()
solution = solve(state)
print("--- %s seconds ---" % (time.time() - start))
for state in solution:
    print(state)

'''
~/water_sort_solver/ (main) $ python solve.py
--- 0.08284831047058105 seconds ---
FHDB|CEEE|GDHD|AGBF|FGHA|AGIE|BCHD|CIFI|CABI|    |
FHDB|CEEE|GDHD|AGBF|FGHA|AGIE|BCHD|CIFI|CAB |    |I
FHDB|CEEE|GDHD|AGBF|FGHA|AGIE|BCHD|CIFI|CA  |B   |I
FHDB|CEEE|GDHD|AGBF|FGHA|AGIE|BCHD|CIF |CA  |B   |II
FHDB|CEEE|GDHD|AGBF|FGH |AGIE|BCHD|CIF |CAA |B   |II
FHDB|CEEE|GDHD|AGB |FGH |AGIE|BCHD|CIFF|CAA |B   |II
FHDB|CEEE|GDHD|AGBB|FGH |AGIE|BCHD|CIFF|CAA |    |II
FHDB|CEEE|GDHD|AGBB|FGH |AGIE|BCHD|CI  |CAA |FF  |II
FHDB|CEEE|GDHD|AGBB|FGH |AGIE|BCHD|CIII|CAA |FF  |
FHDB|CEEE|GDHD|AG  |FGH |AGIE|BCHD|CIII|CAA |FF  |BB
FHD |CEEE|GDHD|AG  |FGH |AGIE|BCHD|CIII|CAA |FF  |BBB
FHDD|CEEE|GDHD|AG  |FGH |AGIE|BCH |CIII|CAA |FF  |BBB
FHDD|CEEE|GDHD|AG  |FG  |AGIE|BCHH|CIII|CAA |FF  |BBB
FHDD|CEEE|GDHD|AGG |F   |AGIE|BCHH|CIII|CAA |FF  |BBB
FHDD|CEEE|GDHD|AGG |FFF |AGIE|BCHH|CIII|CAA |    |BBB
FHDD|CEEE|GDHD|A   |FFF |AGIE|BCHH|CIII|CAA |GG  |BBB
FHDD|CEEE|GDHD|    |FFF |AGIE|BCHH|CIII|CAAA|GG  |BBB
FHDD|CEEE|GDH |D   |FFF |AGIE|BCHH|CIII|CAAA|GG  |BBB
FHDD|CEEE|GDHH|D   |FFF |AGIE|BCH |CIII|CAAA|GG  |BBB
FH  |CEEE|GDHH|DDD |FFF |AGIE|BCH |CIII|CAAA|GG  |BBB
FHHH|CEEE|GD  |DDD |FFF |AGIE|BCH |CIII|CAAA|GG  |BBB
FHHH|CEEE|G   |DDDD|FFF |AGIE|BCH |CIII|CAAA|GG  |BBB
FHHH|CEEE|GGG |DDDD|FFF |AGIE|BCH |CIII|CAAA|    |BBB
FHHH|CEEE|GGG |DDDD|FFF |AGIE|BC  |CIII|CAAA|H   |BBB
F   |CEEE|GGG |DDDD|FFF |AGIE|BC  |CIII|CAAA|HHHH|BBB
    |CEEE|GGG |DDDD|FFFF|AGIE|BC  |CIII|CAAA|HHHH|BBB
AAA |CEEE|GGG |DDDD|FFFF|AGIE|BC  |CIII|C   |HHHH|BBB
AAA |CEEE|GGG |DDDD|FFFF|AGIE|BCC |CIII|    |HHHH|BBB
AAA |CEEE|GGG |DDDD|FFFF|AGIE|BCC |C   |III |HHHH|BBB
AAA |CEEE|GGG |DDDD|FFFF|AGIE|BCCC|    |III |HHHH|BBB
AAA |CEEE|GGG |DDDD|FFFF|AGI |BCCC|E   |III |HHHH|BBB
AAA |CEEE|GGG |DDDD|FFFF|AG  |BCCC|E   |IIII|HHHH|BBB
AAA |CEEE|GGGG|DDDD|FFFF|A   |BCCC|E   |IIII|HHHH|BBB
AAAA|CEEE|GGGG|DDDD|FFFF|    |BCCC|E   |IIII|HHHH|BBB
AAAA|CEEE|GGGG|DDDD|FFFF|CCC |B   |E   |IIII|HHHH|BBB
AAAA|CEEE|GGGG|DDDD|FFFF|CCC |    |E   |IIII|HHHH|BBBB
AAAA|C   |GGGG|DDDD|FFFF|CCC |    |EEEE|IIII|HHHH|BBBB
AAAA|    |GGGG|DDDD|FFFF|CCCC|    |EEEE|IIII|HHHH|BBBB
'''
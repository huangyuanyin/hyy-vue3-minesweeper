<script setup lang="ts" generic="T extends any, O extends any">
import type { BlockState } from "~/types";

const WIDTH = 5;
const HEIGHT = 5;
const state = ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from(
      { length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      })
    )
  )
);

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

const numberColors = [
  "text-transparent",
  "text-blue-500",
  "text-green-500",
  "text-red-500",
  "text-purple-500",
  "text-yellow-500",
  "text-cyan-500",
  "text-gray-500",
  "text-teal-500",
];

// 生成地雷
function generateMines(initial: BlockState) {
  for (const row of state.value) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) <= 1) continue;
      if (Math.abs(initial.y - block.y) <= 1) continue;
      block.mine = Math.random() < 0.2;
    }
  }
  updateNumbers();
}

// 更新数字
function updateNumbers() {
  state.value.forEach((row) => {
    row.forEach((block) => {
      if (block.mine) return; // 是地雷
      // 遍历周围的坐标
      getSibling(block).forEach((b) => {
        if (b.mine) block.adjacentMines += 1; // 周围是地雷
      });
    });
  });
}

function getSibling(block: BlockState) {
  return directions
    .map(([dx, dy]) => {
      const x2 = block.x + dx; // 周围的坐标
      const y2 = block.y + dy; // 周围的坐标
      if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return undefined; // 超出边界
      return state.value[y2][x2];
    })
    .filter(Boolean) as BlockState[];
}

function expendZero(block: BlockState) {
  if (block.adjacentMines) return;
  // 遍历周围的坐标
  getSibling(block).forEach((s) => {
    if (!s.revealed) {
      s.revealed = true; // 翻开
      expendZero(s); // 递归
    }
  });
}

let mineGenerated = false;
let dev = false;

function onRightClick(block: BlockState) {
  if (block.revealed) return;
  block.flagged = !block.flagged;
}

function onClick(block: BlockState) {
  if (!mineGenerated) {
    generateMines(block);
    mineGenerated = true;
  }
  block.revealed = true; // 翻开
  // 是地雷
  if (block.mine) {
    alert("BOOOOOOOM");
  }
  expendZero(block);
}

function getBlockClass(block: BlockState) {
  if (block.flagged) return "bg-gray-500/10";
  if (!block.revealed) return "bg-gray-500/10 hover:bg-gray-500/20";
  return block.mine ? "bg-red-500/50" : numberColors[block.adjacentMines];
}

watchEffect(checkGameState);

function checkGameState() {
  if (!mineGenerated) return;
  const blocks = state.value.flat();
  if (blocks.every((block) => block.revealed || block.flagged)) {
    if (blocks.some((block) => block.flagged && !block.mine))
      alert("You cheat!");
    else alert("You Win!");
  }
}
</script>

<template>
  <div>
    minesweeper

    <div p5>
      <div
        v-for="(row, y) in state"
        :key="y"
        flex="~"
        items-center
        justify-center
      >
        <button
          v-for="(block, x) in row"
          :key="x"
          flex="~"
          items-center
          justify-center
          w-10
          h-10
          m="0.5"
          border="1 gray-400/10"
          :class="getBlockClass(block)"
          @click="onClick(block)"
          @contextmenu.prevent="onRightClick(block)"
        >
          <template v-if="block.flagged">
            <div i-mdi-flag text-red></div>
          </template>
          <template v-else-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi-mine></div>
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

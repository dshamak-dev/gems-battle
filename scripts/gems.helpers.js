export const log = (...args) => {
  console.info(...args);
};

export const formatNumberOutput = (value = 0, minCharsNum = 1) => {
  const valueCharsLength = String(value).length;
  const charsToAdd = minCharsNum - valueCharsLength;

  if (charsToAdd <= 0) {
    return String(value);
  }

  return [...new Array(charsToAdd).fill(0), value].join("");
};

// max is NOT included
export const getRandom = (min, max, floor = false) => {
  const rand = Math.random() * max + min;
  const res = Math.min(max, rand);

  if (floor) {
    return Math.floor(res);
  } else {
    return res;
  }
};

export const generateId = (length = 4) => {
  const rand = new Array(length)
    .fill(null)
    .map(() => getRandom(0, 10, true))
    .join("");

  return Number(rand);
};

export const getIndexesByDirection = (
  fromIndex,
  gridSize,
  direction = "down"
) => {
  let adjacentIndex = getAdjacentIndexByDirection(
    fromIndex,
    gridSize,
    direction
  );

  if (adjacentIndex !== -1) {
    return [
      adjacentIndex,
      ...getIndexesByDirection(adjacentIndex, gridSize, direction),
    ];
  }

  return [];
};

export const getAdjacentIndexByDirection = (
  targetCellIndex,
  gridSize,
  direction = "down"
) => {
  const row = Math.floor(targetCellIndex / gridSize.cols);
  const col = targetCellIndex - row * gridSize.cols;
  let nextIndex = -1;

  switch (direction) {
    case "down": {
      if (row < gridSize.rows - 1) {
        // row below
        nextIndex = targetCellIndex + gridSize.cols;
      } else {
        // no row below
      }
      break;
    }
    case "up": {
      if (row > 0) {
        // row below
        nextIndex = targetCellIndex - gridSize.cols;
      } else {
        // no row above
      }
      break;
    }
    case "left": {
      if (col < gridSize.cols - 1) {
        // row below
        nextIndex = targetCellIndex + 1;
      } else {
        // no col to the left
      }
      break;
    }
    case "right": {
      if (col > 0) {
        // row below
        nextIndex = targetCellIndex - 1;
      } else {
        // no col to the right
      }
      break;
    }
  }

  return nextIndex;
};

export const getRandomArrayItem = (arr) => {
  const index = getRandomArrayIndex(arr);

  return index === -1 ? null : arr[index];
};

export const getRandomArrayIndex = (arr) => {
  if (arr == null || !Array.isArray(arr)) {
    return -1;
  }

  let randIndex = getRandom(0, arr.length, true);

  return Math.max(Math.min(arr.length - 1, randIndex), 0);
};

export const validateVersion = (a, b) => {
  return Math.floor(a) === Math.floor(b);
};

export const getGame = () => {
  return window?.__context?.game;
};

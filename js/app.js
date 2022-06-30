const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector(".start"),
  win: document.querySelector(".win"),
};

const state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

const createNumberArray = (lowerNumber, higherNumber) => {
  const initialArray = [];
  for (let i = lowerNumber; i <= higherNumber; i++) {
    initialArray.push(i);
  }
  return initialArray;
};

// const emojis = ["🥔", "🍒", "🥑", "🌽", "🥕", "🍇", "🍉", "🍌", "🥭", "🍍"];

const pickRandom = (array, items) => {
  const clonedArray = [...array];
  const pickedArray = [];

  for (let i = 0; i < items; i++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length); // випадковий індекс від 0 до і

    pickedArray.push(clonedArray[randomIndex]);
    clonedArray.splice(randomIndex, 1);
  }

  return pickedArray;
};

const shuffle = (array) => {
  // алгоритм під назвою Тасування Томаса-Єйтса
  const clonedArray = [...array];

  for (let i = clonedArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1)); // випадковий індекс від 0 до і

    // ми використовуємо синтаксис "деструктуруюче присвоювання"
    [clonedArray[i], clonedArray[randomIndex]] = [
      clonedArray[randomIndex],
      clonedArray[i],
    ];

    // const original = clonedArray[i];
    // clonedArray[i] = clonedArray[randomIndex];
    // clonedArray[randomIndex] = original;
  }
  return clonedArray;
};

const generateGame = () => {
  const dimensions = selectors.board.getAttribute("data-dimension");

  if (dimensions % 2 !== 0) {
    throw new Error("The dimesion of the board must be an even number");
  }

  // const emojis = ["🥔", "🍒", "🥑", "🌽", "🥕", "🍇", "🍉", "🍌", "🥭", "🍍"];

  const numbers = createNumberArray(1, 50);

  const picks = pickRandom(numbers, (dimensions * dimensions) / 2);
  const items = shuffle([...picks, ...picks]);

  const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items
              .map(
                (item) => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `
              )
              .join("")}
              
       </div>
    `;

  const parser = new DOMParser().parseFromString(cards, "text/html");

  selectors.board.replaceWith(parser.querySelector(".board"));
};

//функція, яка запускає відлік часу при початку гри
const startGame = () => {
  if (!state.gameStarted) {
    generateGame();
  }
  state.gameStarted = true;
  state.totalTime = 0;
  selectors.start.classList.add("disabled");

  state.loop = setInterval(() => {
    state.totalTime++;
    selectors.moves.innerHTML = `${state.totalFlips} moves`;
    selectors.timer.innerHTML = `time: ${state.totalTime} sec`;
  }, 1000);
};

const flipCard = (card) => {
  state.totalFlips++;
  state.flippedCards++;

  if (!state.gameStarted) {
    startGame();
  }

  if (state.flippedCards <= 2) {
    card.classList.add("flipped");
  }

  if (state.flippedCards === 2) {
    const flippedCards = document.querySelectorAll(".flipped:not(.matched)");

    if (flippedCards[0].innerHTML === flippedCards[1].innerHTML) {
      flippedCards[0].classList.add("matched");
      flippedCards[1].classList.add("matched");
    }

    setTimeout(() => {
      flipBackCards();
    }, 1000);
  }

  if (!document.querySelectorAll(".card:not(.flipped)").length) {
    setTimeout(() => {
      selectors.boardContainer.classList.add("flipped");
      selectors.win.innerHTML = `
            <span class="win-text">
                You won!<br />
                with <span class="highlight">${state.totalFlips}</span> moves<br />
                under <span class="highlight">${state.totalTime}</span> seconds
            </span>
        `;

      clearInterval(state.loop);
      state.gameStarted = false;
      state.totalFlips = 0;

      selectors.start.classList.remove("disabled");
    }, 1000);
  }
};

const flipBackCards = () => {
  document.querySelectorAll(".flipped:not(.matched").forEach((card) => {
    card.classList.remove("flipped");
  });
  state.flippedCards = 0;
};

const attachEventListeners = () => {
  document.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const eventParrent = eventTarget.parentElement;

    if (
      eventTarget.className.includes("card") &&
      !eventParrent.className.includes("flipped")
    ) {
      flipCard(eventParrent);
    } else if (
      eventTarget.nodeName === "BUTTON" &&
      !eventTarget.className.includes("disabled")
    ) {
      startGame();
    }
  });
};

generateGame();
attachEventListeners();

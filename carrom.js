const board = document.getElementById("board");
const strikerEl = document.getElementById("striker");
const aimLine = document.getElementById("aimLine");

const scoreEl = document.getElementById("score");
const coinsLeftEl = document.getElementById("coinsLeft");

const resetBtn = document.getElementById("resetBtn");
const messageEl = document.querySelector(".message");



const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 600;

const LEFT = 32;
const RIGHT = 568;
const TOP = 32;
const BOTTOM = 568;

const BASELINE_Y = 520;

const STRIKER_RADIUS = 15;
const COIN_RADIUS = 12;

const POCKET_RADIUS = 34;

const FRICTION = 0.986;

const WALL_BOUNCE = 0.90;

const STOP_SPEED = 0.055;

const MAX_SPEED = 18;



let score = 0;
let coinsLeft = 19;

let coins = [];

let aiming = false;
let shotRunning = false;

let pointerId = null;

let animationId = null;



const striker = {
    x: 300,
    y: BASELINE_Y,
    vx: 0,
    vy: 0
};



const pockets = [
    { x: 25, y: 25 },
    { x: 575, y: 25 },
    { x: 25, y: 575 },
    { x: 575, y: 575 }
];



function distance(x1, y1, x2, y2) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy);
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}



function getBoardPosition(event) {

    const rect =
        board.getBoundingClientRect();

    return {

        x:
            (event.clientX - rect.left) *
            BOARD_WIDTH /
            rect.width,

        y:
            (event.clientY - rect.top) *
            BOARD_HEIGHT /
            rect.height
    };
}
function loadCoins() {

    coins = [];

    const elements =
        document.querySelectorAll(".coin");

    elements.forEach((element, index) => {

        let type = "white";

        if (
            element.classList.contains("black")
        ) {

            type = "black";
        }

        if (
            element.classList.contains("queen")
        ) {

            type = "queen";
        }

        coins.push({

            id: index,

            element: element,

            type: type,

            x:
                Number(
                    element.dataset.x
                ),

            y:
                Number(
                    element.dataset.y
                ),

            vx: 0,

            vy: 0,

            radius: COIN_RADIUS,

            pocketed: false
        });

    });
}



function drawCoin(coin) {

    if (coin.pocketed) {

        coin.element.style.display =
            "none";

        return;
    }

    coin.element.style.display =
        "block";

    coin.element.style.left =
        `${coin.x - coin.radius}px`;

    coin.element.style.top =
        `${coin.y - coin.radius}px`;
}



function drawStriker() {

    strikerEl.style.left =
        `${striker.x - STRIKER_RADIUS}px`;

    strikerEl.style.top =
        `${striker.y - STRIKER_RADIUS}px`;
}



function initializeGame() {

    if (animationId !== null) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }


    score = 0;

    coinsLeft = 19;


    scoreEl.textContent =
        "0";

    coinsLeftEl.textContent =
        "19";


    striker.x = 300;

    striker.y =
        BASELINE_Y;

    striker.vx = 0;

    striker.vy = 0;


    aiming = false;

    shotRunning = false;

    pointerId = null;


    aimLine.style.display =
        "none";


    messageEl.textContent =
        "Striker ko drag karke shoot karo";


    loadCoins();


    coins.forEach((coin) => {

        coin.vx = 0;

        coin.vy = 0;

        coin.pocketed = false;

        drawCoin(coin);
    });


    drawStriker();
}



resetBtn.addEventListener(
    "click",
    initializeGame
);



board.style.touchAction =
    "none";



function isStriker(point) {

    return (
        distance(
            point.x,
            point.y,
            striker.x,
            striker.y
        )
        <=
        STRIKER_RADIUS + 12
    );
}



function showAim(point) {

    const dx =
        striker.x - point.x;

    const dy =
        striker.y - point.y;


    const d =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (d < 5) {

        aimLine.style.display =
            "none";

        return;
    }


    const length =
        Math.min(d, 220);


    const angle =
        Math.atan2(dy, dx)
        *
        180 /
        Math.PI;


    aimLine.style.display =
        "block";


    aimLine.style.left =
        `${striker.x}px`;


    aimLine.style.top =
        `${striker.y}px`;


    aimLine.style.width =
        `${length}px`;


    aimLine.style.transformOrigin =
        "0 50%";


    aimLine.style.transform =
        `rotate(${angle}deg)`;
}



board.addEventListener(
    "pointerdown",
    function (event) {

        if (shotRunning) {
            return;
        }


        const point =
            getBoardPosition(event);


        if (
            isStriker(point)
        ) {

            aiming = true;

            pointerId =
                event.pointerId;


            try {

                board.setPointerCapture(
                    event.pointerId
                );

            } catch (e) { }


            showAim(point);

            messageEl.textContent =
                "Pull karo aur release karo";


            event.preventDefault();
        }

    }
);



board.addEventListener(
    "pointermove",
    function (event) {

        if (!aiming) {
            return;
        }


        if (
            event.pointerId !==
            pointerId
        ) {

            return;
        }


        const point =
            getBoardPosition(event);


        showAim(point);


        event.preventDefault();
    }
);




function shoot(point) {

    const dx =
        striker.x - point.x;

    const dy =
        striker.y - point.y;


    const pull =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (pull < 8) {

        return false;
    }


    const directionX =
        dx / pull;

    const directionY =
        dy / pull;


    const power =
        Math.min(
            pull,
            180
        );


    const speed =
        Math.max(
            3,
            power / 180 *
            MAX_SPEED
        );


    striker.vx =
        directionX * speed;

    striker.vy =
        directionY * speed;


    shotRunning = true;


    messageEl.textContent =
        "Shot chal raha hai...";


    return true;
}


board.addEventListener(
    "pointerup",
    function (event) {

        if (!aiming) {
            return;
        }


        if (
            event.pointerId !==
            pointerId
        ) {

            return;
        }


        const point =
            getBoardPosition(event);


        aiming = false;

        pointerId = null;


        aimLine.style.display =
            "none";


        try {

            board.releasePointerCapture(
                event.pointerId
            );

        } catch (e) { }


        const fired =
            shoot(point);


        if (fired) {

            startGame();
        }


        event.preventDefault();
    }
);


board.addEventListener(
    "pointercancel",
    function () {

        aiming = false;

        pointerId = null;

        aimLine.style.display =
            "none";
    }
);



board.addEventListener(
    "click",
    function (event) {

        if (
            shotRunning ||
            aiming
        ) {

            return;
        }


        const point =
            getBoardPosition(event);


        if (
            point.y >
            BASELINE_Y - 35
            &&
            point.y <
            BASELINE_Y + 35
        ) {

            striker.x =
                clamp(
                    point.x,
                    55,
                    545
                );


            striker.y =
                BASELINE_Y;


            drawStriker();
        }

    }
);



function strikerWall() {

    const r =
        STRIKER_RADIUS;


    if (
        striker.x - r <= LEFT
    ) {

        striker.x =
            LEFT + r;

        striker.vx =
            Math.abs(
                striker.vx
            ) *
            WALL_BOUNCE;
    }


    if (
        striker.x + r >= RIGHT
    ) {

        striker.x =
            RIGHT - r;

        striker.vx =
            -Math.abs(
                striker.vx
            ) *
            WALL_BOUNCE;
    }


    if (
        striker.y - r <= TOP
    ) {

        striker.y =
            TOP + r;

        striker.vy =
            Math.abs(
                striker.vy
            ) *
            WALL_BOUNCE;
    }


    if (
        striker.y + r >= BOTTOM
    ) {

        striker.y =
            BOTTOM - r;

        striker.vy =
            -Math.abs(
                striker.vy
            ) *
            WALL_BOUNCE;
    }
}




function coinWall(coin) {

    const r =
        coin.radius;


    if (
        coin.x - r <= LEFT
    ) {

        coin.x =
            LEFT + r;

        coin.vx =
            Math.abs(
                coin.vx
            ) *
            WALL_BOUNCE;
    }


    if (
        coin.x + r >= RIGHT
    ) {

        coin.x =
            RIGHT - r;

        coin.vx =
            -Math.abs(
                coin.vx
            ) *
            WALL_BOUNCE;
    }


    if (
        coin.y - r <= TOP
    ) {

        coin.y =
            TOP + r;

        coin.vy =
            Math.abs(
                coin.vy
            ) *
            WALL_BOUNCE;
    }


    if (
        coin.y + r >= BOTTOM
    ) {

        coin.y =
            BOTTOM - r;

        coin.vy =
            -Math.abs(
                coin.vy
            ) *
            WALL_BOUNCE;
    }
}




function strikerCoinCollision(coin) {

    if (coin.pocketed) {
        return;
    }


    let dx =
        coin.x - striker.x;

    let dy =
        coin.y - striker.y;


    let d =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const minDistance =
        STRIKER_RADIUS +
        coin.radius;


    if (
        d >= minDistance
    ) {

        return;
    }


    if (d === 0) {

        d = 0.001;

        dx = 0.001;

        dy = 0;
    }


    const nx =
        dx / d;

    const ny =
        dy / d;




    const overlap =
        minDistance - d;


    coin.x +=
        nx *
        overlap;

    coin.y +=
        ny *
        overlap;




    const relativeX =
        striker.vx -
        coin.vx;

    const relativeY =
        striker.vy -
        coin.vy;


    const velocity =
        relativeX * nx +
        relativeY * ny;


    if (
        velocity <= 0
    ) {

        return;
    }




    const restitution =
        0.95;


    const impulse =
        velocity *
        restitution;


    // Striker
    striker.vx -=
        nx * impulse;

    striker.vy -=
        ny * impulse;


    // Coin
    coin.vx +=
        nx * impulse;

    coin.vy +=
        ny * impulse;



    coin.vx *= 1.02;
    coin.vy *= 1.02;
}



function coinCollision(a, b) {

    if (
        a.pocketed ||
        b.pocketed
    ) {

        return;
    }


    let dx =
        b.x - a.x;

    let dy =
        b.y - a.y;


    let d =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const minDistance =
        a.radius +
        b.radius;


    if (
        d >= minDistance
    ) {

        return;
    }




    if (d === 0) {

        const randomAngle =
            Math.random() *
            Math.PI *
            2;


        dx =
            Math.cos(
                randomAngle
            );

        dy =
            Math.sin(
                randomAngle
            );

        d = 1;
    }


    const nx =
        dx / d;

    const ny =
        dy / d;




    const overlap =
        minDistance - d;


    const correction =
        overlap / 2;


    a.x -=
        nx * correction;

    a.y -=
        ny * correction;


    b.x +=
        nx * correction;

    b.y +=
        ny * correction;




    const rvx =
        b.vx - a.vx;

    const rvy =
        b.vy - a.vy;


    const velocityAlongNormal =
        rvx * nx +
        rvy * ny;



    if (
        velocityAlongNormal >= 0
    ) {

        return;
    }

    const restitution =
        0.92;


    const impulse =
        -(1 + restitution) *
        velocityAlongNormal /
        2;


    // Coin A
    a.vx -=
        impulse * nx;

    a.vy -=
        impulse * ny;


    // Coin B
    b.vx +=
        impulse * nx;

    b.vy +=
        impulse * ny;
}

function checkCoinPocket(coin) {

    if (coin.pocketed) {
        return false;
    }


    for (
        const pocket of pockets
    ) {

        const d =
            distance(
                coin.x,
                coin.y,
                pocket.x,
                pocket.y
            );


        if (
            d <=
            POCKET_RADIUS
        ) {

            pocketCoin(coin);

            return true;
        }
    }


    return false;
}

function pocketCoin(coin) {

    if (coin.pocketed) {
        return;
    }


    coin.pocketed = true;

    coin.vx = 0;
    coin.vy = 0;


    coin.element.style.display =
        "none";


    coinsLeft--;


    coinsLeftEl.textContent =
        coinsLeft;


    if (
        coin.type === "white"
    ) {

        score += 10;

        messageEl.textContent =
            "White Coin +10";
    }


    else if (
        coin.type === "black"
    ) {

        score += 20;

        messageEl.textContent =
            "Black Coin +20";
    }


    else if (
        coin.type === "queen"
    ) {

        score += 50;

        messageEl.textContent =
            "Queen +50";
    }


    scoreEl.textContent =
        score;


    if (
        coinsLeft === 0
    ) {

        messageEl.textContent =
            "GAME OVER! Score: " +
            score;
    }
}

function checkStrikerPocket() {

    for (
        const pocket of pockets
    ) {

        const d =
            distance(
                striker.x,
                striker.y,
                pocket.x,
                pocket.y
            );


        if (
            d <=
            POCKET_RADIUS
        ) {

            striker.vx = 0;
            striker.vy = 0;


            score =
                Math.max(
                    0,
                    score - 5
                );


            scoreEl.textContent =
                score;


            messageEl.textContent =
                "Striker pocket! -5";


            striker.x = 300;

            striker.y =
                BASELINE_Y;


            drawStriker();


            return true;
        }
    }


    return false;
}

function moveObjects() {

    striker.x +=
        striker.vx;

    striker.y +=
        striker.vy;


    coins.forEach(
        (coin) => {

            if (
                coin.pocketed
            ) {

                return;
            }


            coin.x +=
                coin.vx;

            coin.y +=
                coin.vy;
        }
    );
}

function friction() {

    striker.vx *=
        FRICTION;

    striker.vy *=
        FRICTION;


    if (
        Math.abs(
            striker.vx
        ) < STOP_SPEED
    ) {

        striker.vx = 0;
    }


    if (
        Math.abs(
            striker.vy
        ) < STOP_SPEED
    ) {

        striker.vy = 0;
    }


    coins.forEach(
        (coin) => {

            if (
                coin.pocketed
            ) {

                return;
            }


            coin.vx *=
                FRICTION;

            coin.vy *=
                FRICTION;


            if (
                Math.abs(
                    coin.vx
                ) < STOP_SPEED
            ) {

                coin.vx = 0;
            }


            if (
                Math.abs(
                    coin.vy
                ) < STOP_SPEED
            ) {

                coin.vy = 0;
            }

        }
    );
}

function collisionSystem() {

    coins.forEach(
        (coin) => {

            strikerCoinCollision(
                coin
            );
        }
    );

    for (
        let i = 0;
        i < coins.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < coins.length;
            j++
        ) {

            coinCollision(
                coins[i],
                coins[j]
            );
        }
    }
}

function pocketSystem() {

    // Striker
    checkStrikerPocket();


    // Coins
    coins.forEach(
        (coin) => {

            checkCoinPocket(
                coin
            );
        }
    );
}

function objectsMoving() {

    const strikerSpeed =
        Math.sqrt(
            striker.vx ** 2 +
            striker.vy ** 2
        );


    if (
        strikerSpeed >
        STOP_SPEED
    ) {

        return true;
    }


    for (
        const coin of coins
    ) {

        if (
            coin.pocketed
        ) {

            continue;
        }


        const speed =
            Math.sqrt(
                coin.vx ** 2 +
                coin.vy ** 2
            );


        if (
            speed >
            STOP_SPEED
        ) {

            return true;
        }
    }


    return false;
}


function gameLoop() {

    // 1. Move
    moveObjects();


    // 2. Pocket FIRST
    pocketSystem();


    // 3. Walls
    if (
        !checkStrikerPocket()
    ) {

        strikerWall();
    }


    coins.forEach(
        (coin) => {

            if (
                coin.pocketed
            ) {

                return;
            }


            if (
                !checkCoinPocket(
                    coin
                )
            ) {

                coinWall(coin);
            }
        }
    );


    // 4. COLLISIONS
    collisionSystem();


    // 5. Pocket again
    pocketSystem();


    // 6. Friction
    friction();


    // 7. Draw
    drawStriker();


    coins.forEach(
        (coin) => {

            drawCoin(coin);
        }
    );


    // 8. Continue
    if (
        objectsMoving()
    ) {

        animationId =
            requestAnimationFrame(
                gameLoop
            );

    }

    else {

        animationId = null;

        shotRunning = false;


        striker.vx = 0;
        striker.vy = 0;


        striker.y =
            BASELINE_Y;


        striker.x =
            clamp(
                striker.x,
                55,
                545
            );


        drawStriker();


        if (
            coinsLeft > 0
        ) {

            messageEl.textContent =
                "Next Shot - Striker ko drag karke shoot karo";
        }
    }
}

function startGame() {

    if (
        animationId !== null
    ) {

        return;
    }


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}

initializeGame();
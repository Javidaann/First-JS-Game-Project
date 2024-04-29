// proje
let pixelSize = 31;
let rows = 19;
let columns = 26;

let canvas;
let canvasWidth = pixelSize * columns; // 32 * 16
let canvasHeight = pixelSize * rows; // 32 * 16
let context;

// gemi değişkenleri
let gemiWidth = pixelSize*2;
let gemiHeight = pixelSize*2;
let gemiX = pixelSize * columns/2 - pixelSize;
let gemiY = pixelSize * rows - pixelSize*2;

let gemi = {
    x : gemiX,
    y : gemiY,
    width : gemiWidth,
    height : gemiHeight
}

let gemiImg;
let gemiHizX = pixelSize; // gemi hareket hızı

// uzaylı değişkenleri
let uzayliArray = [];
let uzayliWidth = pixelSize*1.5;
let uzayliHeight = pixelSize*1.5;
let uzayliX = pixelSize;
let uzayliY = pixelSize;
let uzayliImg;

let uzayliRows = 2;
let uzayliColumns = 3;
let uzayliSayi = 0; 
let uzayliHizX = 0.7; // uzaylı hareket hızı

// mermi değişkenleri
let mermiArray = [];
let mermiHizY = -10; // mermi hızı

let puan = 0;
let gameOver = false;

window.onload = function() {
    canvas = document.getElementById("board");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context = canvas.getContext("2d"); 

    // resimler
    gemiImg = new Image(); // gemi resmi
    gemiImg.src = "./img/ship.png";
    gemiImg.onload = function() {
        context.drawImage(gemiImg, gemi.x, gemi.y, gemi.width, gemi.height);
    }

    uzayliImg = new Image(); // uzaylı resmi
    uzayliImg.src = "./img/alien.png";
    uzayliYarat();

    uzayArkaPlan = new Image(); // uzay arka planı
    uzayArkaPlan.src = "./img/spaceBack.jpg";
    uzayArkaPlan.onload = function() {
        context.drawImage(uzayArkaPlan, 0, 0, canvasWidth, canvasHeight);
    }
    
    
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip); 
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    
    context.clearRect(0, 0, canvas.width, canvas.height);

    // arka plan
    context.drawImage(uzayArkaPlan, 0, 0, canvasWidth, canvasHeight);

    // gemi
    context.drawImage(gemiImg, gemi.x, gemi.y, gemi.width, gemi.height);

    // uzaylı kurulumu
    for (let i = 0; i < uzayliArray.length; i++) {
        let uzayli = uzayliArray[i];
        if (uzayli.alive) {
            uzayli.x += uzayliHizX;

            // uzaylı sınıra dokunursa geri döndür
            if (uzayli.x + uzayli.width >= canvas.width || uzayli.x <= 0) {
                uzayliHizX *= -1;
                uzayli.x += uzayliHizX*2;

                // uzaylı sınıra dokunursa aşağı kaydır
                for (let j = 0; j < uzayliArray.length; j++) {
                    uzayliArray[j].y += uzayliHeight;
                }
            }
            context.drawImage(uzayliImg, uzayli.x, uzayli.y, uzayli.width, uzayli.height);

            if (uzayli.y >= gemi.y) {
                gameOver = true;
            }
        }
    }

    // mermi kurulumu
    for (let i = 0; i < mermiArray.length; i++) {
        let bullet = mermiArray[i];
        bullet.y += mermiHizY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // mermi uzaylılara dokunursa
        for (let j = 0; j < uzayliArray.length; j++) {
            let uzayli = uzayliArray[j];
            if (!bullet.used && uzayli.alive && detectCollision(bullet, uzayli)) {
                bullet.used = true;
                uzayli.alive = false;
                uzayliSayi--;
                puan += 20; // 1 uzaylının ölümü -> +20 puan
            }
        }
    }

    // mermi uzaylıya dokunursa yok olur 
    while (mermiArray.length > 0 && (mermiArray[0].used || mermiArray[0].y < 0)) {
        mermiArray.shift(); 
    }

    // sonraki oyun kısmı
    if (uzayliSayi == 0) {
        // sütun ve satırlardaki uzaylı sayısını 1 artır
        puan += uzayliColumns * uzayliRows * 10; // tüm uzaylı bitince bonus puan
        uzayliColumns = Math.min(uzayliColumns + 1, columns/2 -2); 
        uzayliRows = Math.min(uzayliRows + 1, rows-4); 
        if (uzayliHizX > 0) {
            uzayliHizX += 0.2; // uzaylının sağa doğru hareket hızını arttır
        }
        else {
            uzayliHizX -= 0.2; // uzaylının sola doğru hareket hızını arttır
        }
        uzayliArray = [];
        mermiArray = [];
        uzayliYarat();
    }

    // puanı yazdır
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText("Puan: " + puan, 5, 20);


    // oyun sonu
    if (gameOver) {
        context.fillStyle="black";
        context.fillRect(canvas.width/2 - 60, canvas.height/2 - 30, 140, 50);
        context.font="24px bold";
        context.fillStyle="white";
        context.fillText("GAME OVER", canvas.width/2 - 60, canvas.height/2);
    }

    // kazandın
    if (uzayliHizX >= 1.9) {
        context.fillStyle="white";
        context.font="24px courier";
        context.fillText("YOU WIN!", canvas.width/2 - 60, canvas.height/2);
        gameOver = true;
    }
}


// gemi kontrol fonksiyonları
function moveShip(e) {

    if (e.code == "ArrowLeft" && gemi.x - gemiHizX >= 0) {
        gemi.x -= gemiHizX; // sola git
    }
    else if (e.code == "ArrowRight" && gemi.x + gemiHizX + gemi.width <= canvas.width) {
        gemi.x += gemiHizX; // sağa git
    }
    else if (e.code == "ArrowUp" && gemi.y - gemiHizX >= 0) {
        gemi.y -= gemiHizX; // yukarı git
    }
    else if (e.code == "ArrowDown" && gemi.y + gemiHizX + gemi.height <= canvas.height) {
        gemi.y += gemiHizX; // aşağı git
    }
    else if (e.keyCode == 82) { 
        window.location.reload(); // yeniden başlat
    }
}

function uzayliYarat() {
    for (let c = 0; c < uzayliColumns; c++) {
        for (let r = 0; r < uzayliRows; r++) {
            let uzayli = {
                img : uzayliImg,
                x : uzayliX + c*uzayliWidth,
                y : uzayliY + r*uzayliHeight,
                width : uzayliWidth,
                height : uzayliHeight,
                alive : true
            }
            uzayliArray.push(uzayli);
        }
    }
    uzayliSayi = uzayliArray.length;
}

// mermi kontrol fonksiyonları
function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        let bullet = {
            x : gemi.x + gemiWidth*15/32,
            y : gemi.y,
            width : pixelSize/8,
            height : pixelSize/2,
            used : false
        }
        mermiArray.push(bullet);
    }
}

// çarpışmayı tespit etme fonksiyonu
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&  
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;    
}


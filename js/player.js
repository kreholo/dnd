import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Kullanıcı giriş yapmamışsa ana sayfaya şutla
const lobbyId = localStorage.getItem("currentLobbyId");
const playerId = localStorage.getItem("playerId");

if (!lobbyId || !playerId) {
    alert("Lobi bilgisi bulunamadı, ana sayfaya yönlendiriliyorsunuz.");
    window.location.href = "index.html";
}

// Arayüz Elementleri
const displayCharacterName = document.getElementById("displayCharacterName");
const displayLobbyId = document.getElementById("displayLobbyId");
const hpInput = document.getElementById("hpInput");
const maxHpInput = document.getElementById("maxHpInput");
const statInputs = {
    str: document.getElementById("stat-str"),
    dex: document.getElementById("stat-dex"),
    con: document.getElementById("stat-con"),
    int: document.getElementById("stat-int"),
    wis: document.getElementById("stat-wis"),
    cha: document.getElementById("stat-cha")
};

let characterName = "Bilinmeyen Kahraman";

// 1. OYUNCU BİLGİLERİNİ ÇEK VE EKRANA YAZ
async function loadPlayerData() {
    displayLobbyId.innerText = lobbyId;
    
    const playerRef = doc(db, "Lobbies", lobbyId, "Players", playerId);
    const snap = await getDoc(playerRef);

    if (snap.exists()) {
        const data = snap.data();
        characterName = data.character_name || data.name;
        displayCharacterName.innerText = characterName;

        hpInput.value = data.hp || 10;
        maxHpInput.value = data.max_hp || 10;

        if (data.stats) {
            statInputs.str.value = data.stats.str || 10;
            statInputs.dex.value = data.stats.dex || 10;
            statInputs.con.value = data.stats.con || 10;
            statInputs.int.value = data.stats.int || 10;
            statInputs.wis.value = data.stats.wis || 10;
            statInputs.cha.value = data.stats.cha || 10;
        }
    }
}

// Sayfa yüklendiğinde verileri çek
loadPlayerData();

// 2. HP GÜNCELLEME İŞLEMİ
document.getElementById("updateHpBtn").addEventListener("click", async () => {
    const btn = document.getElementById("updateHpBtn");
    btn.innerText = "Kaydediliyor...";
    
    const playerRef = doc(db, "Lobbies", lobbyId, "Players", playerId);
    await updateDoc(playerRef, {
        hp: parseInt(hpInput.value),
        max_hp: parseInt(maxHpInput.value)
    });

    btn.innerText = "Güncellendi!";
    setTimeout(() => btn.innerText = "HP Güncelle", 2000);
});

// 3. STATLARI KAYDETME İŞLEMİ
document.getElementById("saveStatsBtn").addEventListener("click", async () => {
    const btn = document.getElementById("saveStatsBtn");
    btn.innerText = "Kaydediliyor...";
    
    const playerRef = doc(db, "Lobbies", lobbyId, "Players", playerId);
    await updateDoc(playerRef, {
        stats: {
            str: parseInt(statInputs.str.value),
            dex: parseInt(statInputs.dex.value),
            con: parseInt(statInputs.con.value),
            int: parseInt(statInputs.int.value),
            wis: parseInt(statInputs.wis.value),
            cha: parseInt(statInputs.cha.value)
        }
    });

    btn.innerText = "Kaydedildi!";
    setTimeout(() => btn.innerText = "Statları Kaydet", 2000);
});

// 4. ZAR ATMA VE FIREBASE'E GÖNDERME İŞLEMİ
document.getElementById("rollDiceBtn").addEventListener("click", async () => {
    const diceType = parseInt(document.getElementById("diceType").value);
    const modifier = parseInt(document.getElementById("diceModifier").value) || 0;
    
    // Zar atma matematiği
    const baseRoll = Math.floor(Math.random() * diceType) + 1;
    const totalRoll = baseRoll + modifier;

    // Ekranda Göster
    const diceResultBox = document.getElementById("diceResultBox");
    document.getElementById("finalRollResult").innerText = totalRoll;
    
    const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    document.getElementById("rollDetails").innerText = `(d${diceType}: ${baseRoll}) ${modText}`;
    
    diceResultBox.classList.remove("hidden");

    // Zarı DM'in görmesi için Firebase'deki 'Rolls' koleksiyonuna kaydet
    const rollsRef = collection(db, "Lobbies", lobbyId, "Rolls");
    await addDoc(rollsRef, {
        player_id: playerId,
        character_name: characterName,
        dice_type: "d" + diceType,
        base_roll: baseRoll,
        modifier: modifier,
        total: totalRoll,
        timestamp: serverTimestamp()
    });
});
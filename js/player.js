import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const lobbyId = localStorage.getItem("currentLobbyId");
const playerId = localStorage.getItem("playerId");

if (!lobbyId || !playerId) {
    alert("Lobi bilgisi bulunamadı, ana sayfaya yönlendiriliyorsunuz.");
    window.location.href = "index.html";
}

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

// D&D Modifer Hesaplama Kuralı (Örn: 14 için +2, 8 için -1)
function getModifier(statValue) {
    return Math.floor((statValue - 10) / 2);
}

// Oyuncu verilerini çek
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
loadPlayerData();

// HP ve Stat Kaydetme Butonları
document.getElementById("updateHpBtn").addEventListener("click", async () => {
    const btn = document.getElementById("updateHpBtn");
    btn.innerText = "Kaydediliyor...";
    await updateDoc(doc(db, "Lobbies", lobbyId, "Players", playerId), { hp: parseInt(hpInput.value), max_hp: parseInt(maxHpInput.value) });
    btn.innerText = "Güncellendi!";
    setTimeout(() => btn.innerText = "HP Güncelle", 2000);
});

document.getElementById("saveStatsBtn").addEventListener("click", async () => {
    const btn = document.getElementById("saveStatsBtn");
    btn.innerText = "Kaydediliyor...";
    await updateDoc(doc(db, "Lobbies", lobbyId, "Players", playerId), {
        stats: {
            str: parseInt(statInputs.str.value), dex: parseInt(statInputs.dex.value),
            con: parseInt(statInputs.con.value), int: parseInt(statInputs.int.value),
            wis: parseInt(statInputs.wis.value), cha: parseInt(statInputs.cha.value)
        }
    });
    btn.innerText = "Kaydedildi!";
    setTimeout(() => btn.innerText = "Statları Kaydet", 2000);
});

// ZARI FIREBASE'E GÖNDERME ORTAK FONKSİYONU
async function sendRollToFirebase(rollTitle, baseRoll, modifier, totalRoll) {
    const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const detailText = `(d20: ${baseRoll}) ${modText}`;

    // Ekranı güncelle
    document.getElementById("finalRollResult").innerText = totalRoll;
    document.getElementById("rollDetails").innerText = `${rollTitle} ${detailText}`;
    document.getElementById("diceResultBox").classList.remove("hidden");

    // Firebase'e yaz
    await addDoc(collection(db, "Lobbies", lobbyId, "Rolls"), {
        player_id: playerId,
        character_name: characterName,
        roll_title: rollTitle,
        base_roll: baseRoll,
        modifier: modifier,
        total: totalRoll,
        timestamp: serverTimestamp()
    });
}

// 1. HIZLI ZARLARA TIKLANINCA
document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const statType = e.target.getAttribute("data-stat");
        let statValue = 10;
        let rollTitle = "";

        if (statType === "perception") {
            statValue = parseInt(statInputs.wis.value);
            rollTitle = "Algı (Perception)";
        } else {
            statValue = parseInt(statInputs[statType].value);
            rollTitle = statType.toUpperCase() + " Zarı";
        }

        const modifier = getModifier(statValue);
        const baseRoll = Math.floor(Math.random() * 20) + 1;
        const totalRoll = baseRoll + modifier;

        sendRollToFirebase(rollTitle, baseRoll, modifier, totalRoll);
    });
});

// 2. MANUEL ZARA TIKLANINCA
document.getElementById("rollDiceBtn").addEventListener("click", () => {
    const diceType = parseInt(document.getElementById("diceType").value);
    const modifier = parseInt(document.getElementById("diceModifier").value) || 0;
    
    const baseRoll = Math.floor(Math.random() * diceType) + 1;
    const totalRoll = baseRoll + modifier;
    
    sendRollToFirebase(`Manuel d${diceType}`, baseRoll, modifier, totalRoll);
});

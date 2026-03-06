import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DM'in lobide olup olmadığını kontrol edelim
const lobbyId = localStorage.getItem("currentLobbyId");
const userRole = localStorage.getItem("userRole");

if (!lobbyId || userRole !== "DM") {
    alert("DM yetkiniz yok veya lobi bilgisi bulunamadı. Ana sayfaya yönlendiriliyorsunuz.");
    window.location.href = "index.html";
}

// Arayüz Elementleri
const dmLobbyIdDisplay = document.getElementById("dmLobbyIdDisplay");
const playersList = document.getElementById("playersList");
const diceLog = document.getElementById("diceLog");

// Lobi ID'sini ekrana yaz
dmLobbyIdDisplay.innerText = lobbyId;

// -----------------------------------------
// 1. OYUNCULARI CANLI DİNLEME (onSnapshot)
// -----------------------------------------
const playersRef = collection(db, "Lobbies", lobbyId, "Players");

// onSnapshot, veritabanında bir değişiklik olduğu anda bu fonksiyonu tekrar çalıştırır
onSnapshot(playersRef, (snapshot) => {
    playersList.innerHTML = ""; // Listeyi temizle
    
    if (snapshot.empty) {
        playersList.innerHTML = "<p style='color: var(--text-muted);'>Henüz masaya oturan oyuncu yok...</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const charName = data.character_name || data.name;
        
        // Güvenlik: Statlar henüz girilmemişse varsayılan 10 yap
        const stats = data.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

        // Oyuncu kartı HTML iskeletini oluştur
        const playerCardHTML = `
            <div class="player-card">
                <div class="player-header">
                    <span class="player-name">${charName}</span>
                    <span class="player-hp">HP: ${data.hp || 0} / ${data.max_hp || 0}</span>
                </div>
                <div class="stats-row">
                    <div class="stat-item"><span class="stat-label">STR</span>${stats.str}</div>
                    <div class="stat-item"><span class="stat-label">DEX</span>${stats.dex}</div>
                    <div class="stat-item"><span class="stat-label">CON</span>${stats.con}</div>
                    <div class="stat-item"><span class="stat-label">INT</span>${stats.int}</div>
                    <div class="stat-item"><span class="stat-label">WIS</span>${stats.wis}</div>
                    <div class="stat-item"><span class="stat-label">CHA</span>${stats.cha}</div>
                </div>
            </div>
        `;
        playersList.innerHTML += playerCardHTML;
    });
});

// -----------------------------------------
// 2. ZARLARI CANLI DİNLEME (onSnapshot)
// -----------------------------------------
const rollsRef = collection(db, "Lobbies", lobbyId, "Rolls");
// Zarları en yeniden en eskiye doğru sıralamak için bir sorgu (query) oluşturuyoruz
const rollsQuery = query(rollsRef, orderBy("timestamp", "desc"));

onSnapshot(rollsQuery, (snapshot) => {
    diceLog.innerHTML = ""; // Logu temizle
    
    if (snapshot.empty) {
        diceLog.innerHTML = "<p style='color: var(--text-muted); text-align: center;'>Henüz masada zar yuvarlanmadı.</p>";
        return;
    }
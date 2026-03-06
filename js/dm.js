// dm.js dosyasının içindeki 2. ZARLARI CANLI DİNLEME kısmını sil ve bunu yapıştır:
import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DM kontrolü ve Oyuncu Listesi kısımları aynı kalıyor... (Önceki kodlarını silme, sadece zar kısmını değiştiriyoruz)
// Veya karmaşa olmasın diye sadece ZAR DİNLEME bölümünü şu şekilde güncelle:

const rollsRef = collection(db, "Lobbies", localStorage.getItem("currentLobbyId"), "Rolls");
// YENİ: Limit(20) eklendi!
const rollsQuery = query(rollsRef, orderBy("timestamp", "desc"), limit(20));

onSnapshot(rollsQuery, (snapshot) => {
    const diceLog = document.getElementById("diceLog");
    diceLog.innerHTML = ""; 
    
    if (snapshot.empty) {
        diceLog.innerHTML = "<p style='color: var(--text-muted); text-align: center;'>Henüz masada zar yuvarlanmadı.</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const modText = data.modifier >= 0 ? `+${data.modifier}` : `${data.modifier}`;
        
        const logHTML = `
            <div class="log-entry">
                <div class="log-char">${data.character_name} <span style="font-size:0.8rem; color:#888;">şunu attı:</span></div>
                <div class="log-result">${data.total}</div>
                <div class="log-detail">${data.roll_title || "Zar"}: ${data.base_roll} (Bonus: ${modText})</div>
            </div>
        `;
        diceLog.innerHTML += logHTML;
    });
});

import { db } from "./firebase-config.js";
// Firestore'dan ihtiyacımız olan fonksiyonları çekiyoruz
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// HTML'deki elementleri yakalıyoruz
const createLobbyBtn = document.getElementById("createLobbyBtn");
const lobbyResult = document.getElementById("lobbyResult");
const generatedLobbyIdSpan = document.getElementById("generatedLobbyId");
const goToDmPanelBtn = document.getElementById("goToDmPanelBtn");
const joinLobbyForm = document.getElementById("joinLobbyForm");

// Rastgele, kısa ve akılda kalıcı bir lobi ID'si üreten fonksiyon
function generateLobbyId() {
    return "oda-" + Math.random().toString(36).substring(2, 6); // Örn: oda-4f2a
}

// -----------------------------------------
// 1. DM: YENİ LOBİ OLUŞTURMA İŞLEMİ
// -----------------------------------------
createLobbyBtn.addEventListener("click", async () => {
    try {
        // Butonu devre dışı bırakıp kullanıcıya bilgi veriyoruz
        createLobbyBtn.disabled = true;
        createLobbyBtn.innerText = "Zindan Kuruluyor...";

        const newLobbyId = generateLobbyId();
        const lobbyRef = doc(db, "Lobbies", newLobbyId);

        // Firestore'a Lobi belgesini yazıyoruz
        await setDoc(lobbyRef, {
            dm_id: "dm_" + Date.now(), // Şimdilik basit bir zaman damgası id'si
            status: "active",
            createdAt: serverTimestamp()
        });

        // Arayüzü güncelliyoruz
        generatedLobbyIdSpan.innerText = newLobbyId;
        lobbyResult.classList.remove("hidden");
        lobbyResult.style.display = "block";
        createLobbyBtn.innerText = "Lobi Oluşturuldu!";

        // DM'in ve Lobinin bilgilerini tarayıcıya (localStorage) kaydediyoruz ki diğer sayfaya aktarabilelim
        localStorage.setItem("currentLobbyId", newLobbyId);
        localStorage.setItem("userRole", "DM");

    } catch (error) {
        console.error("Lobi oluşturma hatası:", error);
        alert("Lobi oluşturulamadı. Veritabanı bağlantını kontrol et.");
        createLobbyBtn.disabled = false;
        createLobbyBtn.innerText = "Yeni Lobi Oluştur";
    }
});

// DM Paneline Git Butonu Tıklaması
goToDmPanelBtn.addEventListener("click", () => {
    window.location.href = "dm-panel.html"; // Birazdan bu sayfayı yapacağız
});

// -----------------------------------------
// 2. OYUNCU: LOBİYE KATILMA İŞLEMİ
// -----------------------------------------
joinLobbyForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    
    const lobbyId = document.getElementById("lobbyIdInput").value.trim();
    const playerName = document.getElementById("playerNameInput").value.trim();
    const characterName = document.getElementById("characterNameInput").value.trim();
    const submitBtn = joinLobbyForm.querySelector("button");

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Bağlanılıyor...";

        // Önce girilen Lobi ID'si veritabanında var mı diye kontrol ediyoruz
        const lobbyRef = doc(db, "Lobbies", lobbyId);
        const lobbySnap = await getDoc(lobbyRef);

        if (lobbySnap.exists()) {
            // Lobi var! Oyuncuyu bu lobinin altındaki 'Players' koleksiyonuna kaydediyoruz
            const playerId = "player_" + Date.now();
            const playerRef = doc(db, "Lobbies", lobbyId, "Players", playerId);

            await setDoc(playerRef, {
                name: playerName,
                character_name: characterName,
                stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, // Oyuncu panele geçince bunları güncelleyecek
                hp: 10,
                max_hp: 10,
                joinedAt: serverTimestamp()
            });

            // Oyuncu bilgilerini tarayıcıya kaydediyoruz
            localStorage.setItem("currentLobbyId", lobbyId);
            localStorage.setItem("playerId", playerId);
            localStorage.setItem("userRole", "Player");

            // Oyuncu paneline yönlendiriyoruz
            window.location.href = "player-panel.html"; 

        } else {
            alert("Böyle bir lobi bulunamadı! DM'in verdiği kodu kontrol et.");
            submitBtn.disabled = false;
            submitBtn.innerText = "Lobiye Katıl";
        }
    } catch (error) {
        console.error("Bağlantı hatası:", error);
        alert("Bağlantı sırasında bir hata oluştu.");
        submitBtn.disabled = false;
        submitBtn.innerText = "Lobiye Katıl";
    }
});
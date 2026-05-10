let lastSentTime = 0; // Chống spam
const SEND_COOLDOWN_MS = 1000;

// ── SignalR connection ─────────────────────────────────────────
const chatConnection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect()
    .build();

chatConnection.on("ReceiveMessage", (userName, content, createdAt) => {
    appendMessage({ userName, content, createdAt });
    scrollToBottom();
});

async function startSignalR() {
    try {
        await chatConnection.start();
        console.log("SignalR connected.");
    } catch (err) {
        console.error("SignalR connect error:", err);
        setTimeout(startSignalR, 3000);
    }
}

startSignalR();

// ── Escape HTML để chống XSS ───────────────────────────────────
function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ── Tạo và chèn message vào DOM ────────────────────────────────
function appendMessage({ userName, content, createdAt }) {
    const box = document.getElementById("chat-messages");
    const isMe = userName === normalizeNameJS(currentGuestName);

    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper " + (isMe ? "right" : "left");

    const meta = document.createElement("div");
    meta.className = "msg-meta";

    const nameEl = document.createElement("span");
    nameEl.className = "msg-name";
    nameEl.textContent = userName;

    const timeEl = document.createElement("span");
    timeEl.className = "msg-time";
    timeEl.textContent = createdAt || "";

    meta.appendChild(nameEl);
    meta.appendChild(timeEl);

    const bubble = document.createElement("div");
    bubble.className = "msg " + (isMe ? "msg-right" : "msg-left");
    bubble.textContent = content; // textContent an toàn, không dùng innerHTML

    wrapper.appendChild(meta);
    wrapper.appendChild(bubble);
    box.appendChild(wrapper);
}

// ── Normalize tên ở phía JS để so sánh với DB ─────────────────
function normalizeNameJS(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d");
}

// ── Load lịch sử chat ──────────────────────────────────────────
async function loadChatHistory() {
    const box = document.getElementById("chat-messages");
    box.innerHTML = ""; // Xóa tin nhắn hardcode

    try {
        const res = await fetch("/api/chat/messages");
        if (!res.ok) throw new Error("Lỗi load lịch sử");
        const msgs = await res.json();
        msgs.forEach(m => appendMessage({
            userName: m.userName,
            content: m.content,
            createdAt: m.createdAt
        }));
        scrollToBottom();
    } catch (err) {
        console.error("Load lịch sử thất bại:", err);
    }
}

// ── Gửi tin nhắn ───────────────────────────────────────────────
async function sendMsg(e) {
    if (e && e.key !== "Enter") return;

    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;

    if (!currentGuestName) {
        // Tuỳ bạn: hiển thị yêu cầu nhập tên theo UI của mình
        console.warn("Chưa có tên người dùng.");
        return;
    }

    // Chống spam: 1 tin / 1 giây
    const now = Date.now();
    if (now - lastSentTime < SEND_COOLDOWN_MS) return;
    lastSentTime = now;

    const btn = document.getElementById("chat-send-btn");
    btn.disabled = true;
    input.disabled = true;

    try {
        const res = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userName: currentGuestName,
                content: text
            })
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Gửi thất bại:", err);
            return;
        }

        input.value = "";
        // SignalR sẽ broadcast về, không cần appendMessage thủ công ở đây

    } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
    } finally {
        btn.disabled = false;
        input.disabled = false;
        input.focus();
        setTimeout(() => { btn.disabled = false; }, SEND_COOLDOWN_MS);
    }
}

// ── Toggle chat popup ──────────────────────────────────────────
function toggleChat() {
    const popup = document.getElementById("chat-popup");
    const btn = document.getElementById("chat-btn");
    const isHidden = popup.style.display === "none" || popup.style.display === "";
    popup.style.display = isHidden ? "flex" : "none";
    if (btn) btn.classList.toggle("active", isHidden);
    if (isHidden) scrollToBottom();
}

// ── Scroll xuống cuối ──────────────────────────────────────────
function scrollToBottom() {
    const box = document.getElementById("chat-messages");
    if (box) box.scrollTop = box.scrollHeight;
}

// ── Khởi động khi trang load ───────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadChatHistory();
});
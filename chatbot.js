// chatbot.js - Secure OpenAI Integration

const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('typing-indicator');

// ระบบประวัติการสนทนา
let conversationHistory = [
    { role: "system", content: "คุณคือผู้ช่วยทางการเงินชื่อ BudgetBuddy ที่เชี่ยวชาญด้านการจัดการงบประมาณ การออมเงิน และการวางแผนการเงิน พูดแบบเป็นกันเองแต่專業 เป็นภาษาไทย" }
];

// เพิ่มข้อความในแชท
function addMessage(role, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-2 p-3 rounded ${role === 'user' ? 'bg-primary text-white ms-5' : 'bg-light text-dark me-5'}`;
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ส่งข้อความไปยัง backend
async function sendToBackend(message) {
    // จำลอง endpoint ของคุณ - ต้องเปลี่ยนเป็น URL จริงของ backend คุณ
    const BACKEND_URL = 'https://your-backend-api.com/openai-proxy';
    
    conversationHistory.push({ role: "user", content: message });
    
    try {
        typingIndicator.style.display = 'block';
        chatBox.scrollTop = chatBox.scrollHeight;
        
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        conversationHistory.push({ role: "assistant", content: aiResponse });
        addMessage('assistant', aiResponse);
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('assistant', 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
        typingIndicator.style.display = 'none';
    }
}

// ฟังก์ชันส่งข้อความ
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    chatInput.value = '';
    sendToBackend(message);
}

// ส่งด้วยปุ่ม Enter
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
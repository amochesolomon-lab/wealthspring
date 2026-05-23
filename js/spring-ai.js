'use strict';

/* -----------------------------------------------
   SPRINGAI — Hybrid Engine
   1. Tries keyword match from knowledge.json first (instant)
   2. Falls back to Groq via Cloudflare Worker (smart)
----------------------------------------------- */

// ⚠️ REPLACE THIS with your Cloudflare Worker URL after deployment
var WORKER_URL = 'https://crimson-dawn-e3da.theseraphicd3signer.workers.dev/';

var messagesArea    = document.getElementById('chat-messages');
var quickRepliesBar = document.getElementById('quick-replies-bar');
var chatInput       = document.getElementById('chat-input');
var sendBtn         = document.getElementById('chat-send');

var isBusy        = false;
var knowledgeData = null;

// Conversation history for Groq (so it remembers context)
// Format: [{ role: 'user'|'assistant', text: '...' }]
var conversationHistory = [];
var MAX_HISTORY = 10; // keep last 10 turns to avoid token bloat


/* -----------------------------------------------
   TIME HELPER
----------------------------------------------- */
function currentTime() {
  return new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}


/* -----------------------------------------------
   SCROLL
----------------------------------------------- */
function scrollToLatest() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}


/* -----------------------------------------------
   RENDER HELPERS
----------------------------------------------- */
function addBotBubble(html) {
  var row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML =
    '<div class="msg-row-avatar" aria-hidden="true">S</div>' +
    '<div class="msg-group">' +
      '<div class="msg-bubble msg-bubble-bot">' + html + '</div>' +
      '<span class="msg-time">' + currentTime() + '</span>' +
    '</div>';
  messagesArea.appendChild(row);
  scrollToLatest();
}

function addUserBubble(text) {
  var row = document.createElement('div');
  row.className = 'msg-row user-row';
  row.innerHTML =
    '<div class="msg-group">' +
      '<div class="msg-bubble msg-bubble-user">' + escapeHTML(text) + '</div>' +
      '<span class="msg-time">' + currentTime() + '</span>' +
    '</div>';
  messagesArea.appendChild(row);
  scrollToLatest();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Convert Groq plain text (with ** and \n) to simple HTML
function formatBotText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// Check for [SHOW_WHATSAPP] tag and strip it from visible text
// Returns { text: cleanText, showWhatsApp: true|false }
function parseGroqReply(rawText) {
  var showWhatsApp = rawText.indexOf('[SHOW_WHATSAPP]') !== -1;
  var cleanText    = rawText.replace(/\[SHOW_WHATSAPP\]/g, '').trim();
  return { text: cleanText, showWhatsApp: showWhatsApp };
}

function showTypingIndicator() {
  var row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'typing-row';
  row.setAttribute('aria-label', 'SpringAI is typing');
  row.innerHTML =
    '<div class="msg-row-avatar" aria-hidden="true">S</div>' +
    '<div class="typing-bubble"><span></span><span></span><span></span></div>';
  messagesArea.appendChild(row);
  scrollToLatest();
}

function removeTypingIndicator() {
  var row = document.getElementById('typing-row');
  if (row) { row.remove(); }
}

function showWhatsAppHandoff() {
  var block = document.createElement('div');
  block.className = 'chat-handoff-block';
  block.innerHTML =
    '<p>Let me connect you with our team for further assistance.</p>' +
    '<button class="btn btn-whatsapp" data-wa="springai" style="font-size:0.78rem;padding:10px 20px;">' +
      '<svg class="wa-icon" viewBox="0 0 24 24">' +
        '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>' +
        '<path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.524 5.855L.057 23.243a.75.75 0 00.916.916l5.388-1.467A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.98 0-3.852-.538-5.464-1.48l-.39-.23-4.04 1.1 1.1-4.04-.23-.39A10.448 10.448 0 011.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5z"/>' +
      '</svg>' +
      'Chat with Our Team on WhatsApp' +
    '</button>';
  messagesArea.appendChild(block);
  scrollToLatest();
}


/* -----------------------------------------------
   LOAD KNOWLEDGE.JSON
----------------------------------------------- */
function loadKnowledge() {
  return fetch('./knowledge.json')
    .then(function (res) {
      if (!res.ok) { throw new Error('knowledge.json not found'); }
      return res.json();
    })
    .then(function (json) {
      knowledgeData = json;
      if (!Array.isArray(knowledgeData.items)) { knowledgeData.items = []; }
    })
    .catch(function (err) {
      console.warn('knowledge.json load failed:', err);
      knowledgeData = { items: [], fallback: { message: '' } };
    });
}


/* -----------------------------------------------
   KEYWORD MATCHING ENGINE
----------------------------------------------- */
function normalizeText(text) {
  return text.trim().toLowerCase();
}

function scoreItem(normalizedInput, item) {
  var score = 0;
  item.keywords.forEach(function (keyword) {
    if (normalizedInput.indexOf(keyword.toLowerCase()) !== -1) {
      score += 1;
    }
  });
  return score;
}

function getKeywordResponse(text) {
  if (!knowledgeData || !Array.isArray(knowledgeData.items)) { return null; }

  var normalized = normalizeText(text);
  var bestItem   = null;
  var bestScore  = 0;

  knowledgeData.items.forEach(function (item) {
    var score = scoreItem(normalized, item);
    if (score > bestScore) {
      bestScore = score;
      bestItem  = item;
    }
  });

  return (bestItem && bestScore >= 1) ? bestItem.answer : null;
}


/* -----------------------------------------------
   GROQ WORKER CALL
----------------------------------------------- */
function callGroqWorker(userMessage) {
  var historySlice = conversationHistory.slice(-MAX_HISTORY);

  return fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      history: historySlice,
    }),
  })
  .then(function (res) {
    if (!res.ok) { throw new Error('Worker responded with ' + res.status); }
    return res.json();
  })
  .then(function (data) {
    if (data.error) { throw new Error(data.error); }
    return data.reply;
  });
}


/* -----------------------------------------------
   MAIN SEND LOGIC
----------------------------------------------- */
function sendMessage(text) {
  text = text.trim();
  if (!text || isBusy) { return; }

  isBusy = true;
  sendBtn.disabled = true;
  quickRepliesBar.style.display = 'none';

  addUserBubble(text);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  showTypingIndicator();

  // Step 1 — try keyword match (instant, no network)
  var keywordAnswer = getKeywordResponse(text);

  if (keywordAnswer) {
    setTimeout(function () {
      removeTypingIndicator();
      addBotBubble(keywordAnswer);
      // Push to history so Groq has context on follow-up questions
      conversationHistory.push({ role: 'user',  text: text });
      conversationHistory.push({ role: 'assistant', text: keywordAnswer });
      isBusy = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }, 600 + Math.random() * 400);

  } else {
    // Step 2 — fall back to Groq Worker
    callGroqWorker(text)
      .then(function (reply) {
        removeTypingIndicator();
        var parsed = parseGroqReply(reply);
        addBotBubble(formatBotText(parsed.text));
        if (parsed.showWhatsApp) { showWhatsAppHandoff(); }
        conversationHistory.push({ role: 'user',  text: text });
        conversationHistory.push({ role: 'assistant', text: parsed.text });
      })
      .catch(function (err) {
        console.error('Groq Worker error:', err);
        removeTypingIndicator();
        addBotBubble('I\'m having a little trouble right now. Please try again in a moment.');
        showWhatsAppHandoff();
      })
      .finally(function () {
        isBusy = false;
        sendBtn.disabled = false;
        chatInput.focus();
      });
  }
}


/* -----------------------------------------------
   QUICK REPLIES
----------------------------------------------- */
function handleQuickReply(text) {
  sendMessage(text);
}


/* -----------------------------------------------
   EVENT LISTENERS
----------------------------------------------- */
sendBtn.addEventListener('click', function () {
  sendMessage(chatInput.value);
});

chatInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value);
  }
});

chatInput.addEventListener('input', function () {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 110) + 'px';
});


/* -----------------------------------------------
   INIT
----------------------------------------------- */
loadKnowledge();
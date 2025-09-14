let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let stream = null;
let analysisCount = 0;

async function startCamera() {
    try {
        // Update status
        setCameraStatus('processing', 'Initializing camera...');
        
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        
        video.srcObject = stream;
        video.classList.remove('hidden');
        document.getElementById('camera-placeholder').classList.add('hidden');
        
        // Update status
        setCameraStatus('active', 'Camera active - Ready to capture');
        setButtonStates({capture:true, stop:true, start:false});
        
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please ensure you have granted camera permissions.');
        setCameraStatus('inactive', 'Camera access denied');
        setButtonStates({capture:false, stop:false, start:true});
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    video.classList.add('hidden');
    document.getElementById('camera-placeholder').classList.remove('hidden');
    setCameraStatus('inactive', 'Camera stopped');
    setButtonStates({capture:false, stop:false, start:true});
}

// New helper updates status indicator and status text
function setCameraStatus(status, message) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('camera-status-text');
    statusIndicator.className = `status-indicator status-${status}`;
    statusText.textContent = `Camera Status: ${message}`;
}

// Manage button enabled states; pass booleans for capture/stop/start
function setButtonStates({capture = false, stop = false, start = true}) {
    const cap = document.getElementById('capture-btn');
    const st = document.getElementById('stop-camera-btn');
    const stt = document.getElementById('start-camera-btn');
    if (cap) cap.disabled = !capture;
    if (st) st.disabled = !stop;
    if (stt) stt.disabled = !start;
}

function capturePhoto() {
    if (!stream) {
        alert('Please start the camera first');
        return;
    }

    // Update status
    setCameraStatus('processing', 'Analyzing skin...');
    document.getElementById('capture-btn').disabled = true;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');

    // Simulate AI analysis with realistic results and pass image data
    setTimeout(() => {
        performSkinAnalysis(dataUrl);
        setCameraStatus('active', 'Analysis complete - Ready for next capture');
        document.getElementById('capture-btn').disabled = false;
    }, 1200);
}

// Main analysis function; accepts optional image data URL (from camera or upload)
function performSkinAnalysis(imageDataUrl) {
    analysisCount++;
    
    // Generate realistic skin analysis scores
    const baseScore = 75 + Math.random() * 20; // 75-95 range
    const hydration = Math.max(60, baseScore + (Math.random() - 0.5) * 15);
    const texture = Math.max(65, baseScore + (Math.random() - 0.5) * 12);
    const clarity = Math.max(70, baseScore + (Math.random() - 0.5) * 18);
    
    // Update metrics with animation
    animateScore('overall-score', Math.round(baseScore), 'overall-progress');
    animateScore('hydration-level', Math.round(hydration), 'hydration-progress');
    animateScore('texture-score', Math.round(texture), 'texture-progress');
    animateScore('clarity-score', Math.round(clarity), 'clarity-progress');

    // Prepare entry
    const entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        score: Math.round(baseScore),
        hydration: Math.round(hydration),
        texture: Math.round(texture),
        clarity: Math.round(clarity),
        image: imageDataUrl || canvas.toDataURL('image/jpeg')
    };

    // Save & render
    saveAnalysis(entry);

    // Update recommendations based on scores
    updateRecommendations(hydration, texture, clarity);
}

function animateScore(elementId, targetScore, progressId) {
    const element = document.getElementById(elementId);
    const progressBar = document.getElementById(progressId);
    let currentScore = 0;
    
    const animation = setInterval(() => {
        currentScore += 2;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        
        element.textContent = currentScore;
        progressBar.style.width = currentScore + '%';
        
        // Update progress bar color based on score
        if (currentScore >= 85) {
            progressBar.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        } else if (currentScore >= 70) {
            progressBar.style.background = 'linear-gradient(45deg, #20c997, #17a2b8)';
        } else if (currentScore >= 50) {
            progressBar.style.background = 'linear-gradient(45deg, #ffc107, #fd7e14)';
        } else {
            progressBar.style.background = 'linear-gradient(45deg, #dc3545, #e83e8c)';
        }
    }, 50);
}

function addToHistory(score) {
    const historyList = document.getElementById('history-list');

    // Create history item
    const item = document.createElement('div');
    item.className = 'history-item';

    const left = document.createElement('div');
    const dateDiv = document.createElement('div');
    dateDiv.className = 'history-date';
    dateDiv.textContent = new Date().toLocaleString();
    const note = document.createElement('div');
    note.style.fontSize = '0.9rem';
    note.style.color = '#666';
    note.textContent = 'Captured analysis';

    left.appendChild(dateDiv);
    left.appendChild(note);

    const right = document.createElement('div');
    right.className = 'history-score ' + scoreClass(score);
    right.textContent = score + '/100';

    item.appendChild(left);
    item.appendChild(right);

    // Prepend to history list
    if (historyList.firstChild) {
        historyList.insertBefore(item, historyList.firstChild);
    } else {
        historyList.appendChild(item);
    }

}

function scoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-fair';
    return 'score-poor';
}

function updateRecommendations(hydration, texture, clarity) {
    // Gentle, minimal update to existing recommendation items
    const recs = document.querySelectorAll('.recommendation-item');

    // Hydration recommendation
    if (recs[0]) {
        if (hydration < 70) {
            recs[0].innerHTML = '<strong>🧴 Hydration Boost:</strong> Your skin shows signs of dehydration. Use a hyaluronic acid serum twice daily and increase water intake.';
        } else {
            recs[0].innerHTML = '<strong>🧴 Hydration:</strong> Hydration levels look good — continue your current moisturizing routine.';
        }
    }

    // Texture recommendation
    if (recs[1]) {
        if (texture < 75) {
            recs[1].innerHTML = '<strong>🧼 Texture Care:</strong> Consider gentle exfoliation 1-2x weekly and using products with niacinamide.';
        } else {
            recs[1].innerHTML = '<strong>🧼 Texture:</strong> Texture appears smooth — maintain a gentle exfoliation routine.';
        }
    }

    // Clarity recommendation
    if (recs[2]) {
        if (clarity < 75) {
            recs[2].innerHTML = '<strong>✨ Clarity:</strong> Mild blemishes detected. Use spot treatments and keep skin clean to improve clarity.';
        } else {
            recs[2].innerHTML = '<strong>✨ Clarity:</strong> Skin clarity is good — keep up with consistent cleansing and sunscreen.';
        }
    }
}

// ----- Persistence and UI helpers -----
function saveAnalysis(entry) {
    const list = JSON.parse(localStorage.getItem('skin_history') || '[]');
    list.unshift(entry);
    localStorage.setItem('skin_history', JSON.stringify(list));
    renderHistory();
    // update before/after with newest
    document.getElementById('before-img').src = entry.image;
    document.getElementById('after-img').src = entry.image; // placeholder until heatmap
    drawHeatmap(entry);
    incrementPoints(10);
    updateCharts();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    const list = JSON.parse(localStorage.getItem('skin_history') || '[]');
    // clear existing dynamic items (keep static examples)
    // remove all existing items then re-add default examples + items
    historyList.innerHTML = '';
    list.slice(0, 20).forEach(item => {
        const node = document.createElement('div');
        node.className = 'history-item';
        node.innerHTML = `
            <div>
                <div class="history-date">${new Date(item.ts).toLocaleString()}</div>
                <div style="font-size:0.9rem;color:#666;">Saved analysis</div>
            </div>
            <div class="history-score ${scoreClass(item.score)}">${item.score}/100</div>
        `;
        historyList.appendChild(node);
    });
}

function incrementPoints(n) {
    const current = Number(localStorage.getItem('skin_points') || '0');
    const next = current + n;
    localStorage.setItem('skin_points', String(next));
    document.getElementById('points').textContent = String(next);
}

// ----- Charts -----
let acneChart, hydrationChart;
function updateCharts() {
    const list = JSON.parse(localStorage.getItem('skin_history') || '[]').slice(0, 12).reverse();
    const labels = list.map(i => new Date(i.ts).toLocaleDateString());
    const acneData = list.map(i => i.score);
    const hydrationData = list.map(i => i.hydration);

    if (!acneChart) {
        acneChart = new Chart(document.getElementById('acne-chart').getContext('2d'), {
            type: 'line', data: { labels, datasets: [{label:'Health', data:acneData, borderColor:'#ff6b6b', tension:0.3, fill:false}]}, options:{responsive:true}
        });
    } else { acneChart.data.labels = labels; acneChart.data.datasets[0].data = acneData; acneChart.update(); }

    if (!hydrationChart) {
        hydrationChart = new Chart(document.getElementById('hydration-chart').getContext('2d'), {
            type: 'line', data: { labels, datasets: [{label:'Hydration', data:hydrationData, borderColor:'#4db6ac', tension:0.3, fill:false}]}, options:{responsive:true}
        });
    } else { hydrationChart.data.labels = labels; hydrationChart.data.datasets[0].data = hydrationData; hydrationChart.update(); }
}

// ----- Heatmap (simple simulated) -----
function drawHeatmap(entry) {
    const img = new Image();
    img.src = entry.image;
    img.onload = () => {
        const canvasHM = document.getElementById('heatmap-canvas');
        const ctxHM = canvasHM.getContext('2d');
        ctxHM.clearRect(0,0,canvasHM.width, canvasHM.height);
        // draw translucent simulated hotspots
        for (let i=0;i<6;i++) {
            const x = Math.random() * canvasHM.width;
            const y = Math.random() * canvasHM.height;
            const r = 30 + Math.random() * 60;
            const grad = ctxHM.createRadialGradient(x,y,0,x,y,r);
            grad.addColorStop(0,'rgba(255,0,0,0.6)');
            grad.addColorStop(1,'rgba(255,0,0,0)');
            ctxHM.fillStyle = grad;
            ctxHM.fillRect(x-r,y-r,r*2,r*2);
        }
    };
}

// ----- Upload & AR handlers -----
document.getElementById('upload-btn').addEventListener('click', () => {
    const file = document.getElementById('image-input').files[0];
    if (!file) { alert('Select an image first'); return; }
    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        document.getElementById('before-img').src = dataUrl;
        document.getElementById('after-img').src = dataUrl;
        // run analysis on uploaded image
        performSkinAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
});

document.getElementById('ar-toggle').addEventListener('click', () => {
    alert('AR preview is a simulated toggle in this prototype. In a full app, enable WebAR or WebGL filters.');
});

// before/after slider
document.getElementById('ba-slider').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    const clip = `inset(0 ${100-v}% 0 0)`; // after-img clipped from right
    document.getElementById('after-img').style.clipPath = clip;
});

// ----- Chatbot stub -----
document.getElementById('chat-btn').addEventListener('click', () => {
    const q = document.getElementById('chat-input').value.trim();
    if (!q) return;
    // very small deterministic stub to avoid external AI calls
    let resp = '';
    if (q.toLowerCase().includes('oily')) resp = 'Oily skin can be caused by overactive sebaceous glands, humidity, or using overly rich products. Try oil-free non-comedogenic moisturizers.';
    else if (q.toLowerCase().includes('dry')) resp = 'Dry skin often benefits from humectants like hyaluronic acid and occlusives like petrolatum at night.';
    else resp = 'For personalized explanations, upload a recent photo and refer to the recommendations provided. If in doubt, consult a dermatologist.';
    document.getElementById('chat-response').textContent = resp;
});

// ----- UV check (uses open UV index API optionally) -----
document.getElementById('uv-check').addEventListener('click', async () => {
    const lat = document.getElementById('uv-lat').value || '37.7749';
    const lng = document.getElementById('uv-lng').value || '-122.4194';
    const key = document.getElementById('uv-key').value.trim();
    const target = document.getElementById('uv-result');
    target.textContent = 'Checking...';
    try {
        // Example using open-meteo UV API (no key)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&timezone=auto`;
        const res = await fetch(url);
        const json = await res.json();
        const uv = (json.hourly && json.hourly.uv_index && json.hourly.uv_index[0]) || 'N/A';
        target.textContent = `Current UV index: ${uv}`;
    } catch (e) {
        target.textContent = 'Unable to fetch UV data';
    }
});

// ----- Export & Doctor stub -----
document.getElementById('export-json').addEventListener('click', () => {
    const data = localStorage.getItem('skin_history') || '[]';
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'skin_report.json'; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('start-call').addEventListener('click', () => {
    alert('Video call feature requires backend signaling; this is a placeholder.');
});

// ----- Initialization -----
window.addEventListener('load', () => {
    const pts = Number(localStorage.getItem('skin_points') || '0');
    document.getElementById('points').textContent = String(pts);
    renderHistory(); updateCharts();
    // initial button states
    setButtonStates({capture:false, stop:false, start:true});
    // upload button disabled until file chosen
    const uploadBtn = document.getElementById('upload-btn');
    const input = document.getElementById('image-input');
    uploadBtn.disabled = true;
    input.addEventListener('change', () => { uploadBtn.disabled = !input.files.length; });
});

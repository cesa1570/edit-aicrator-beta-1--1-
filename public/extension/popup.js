// Button: Scrape Product
document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status-bar');
    const previewBox = document.getElementById('product-preview');

    statusDiv.textContent = "⏳ กำลังดึงข้อมูลสินค้า...";
    statusDiv.style.color = "#fbbf24";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: "SCRAPE" }, (response) => {
            if (chrome.runtime.lastError) {
                statusDiv.textContent = "❌ Error: กรุณา Refresh หน้าเว็บแล้วลองใหม่";
                statusDiv.style.color = "#f87171";
            } else if (response && response.data) {
                const { title, image, price } = response.data;

                // Update Preview Box
                previewBox.innerHTML = `
                    <img src="${image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
                    <div style="position: absolute; bottom: 0; background: rgba(0,0,0,0.7); width: 100%; font-size: 10px; padding: 2px;">${price}</div>
                `;
                previewBox.style.border = "2px solid #34d399";
                previewBox.style.position = "relative";
                previewBox.style.overflow = "hidden";

                statusDiv.textContent = "✅ ดึงข้อมูลสำเร็จ: " + title.substring(0, 20) + "...";
                statusDiv.style.color = "#34d399";
            } else {
                statusDiv.textContent = "⚠️ ไม่พบข้อมูลสินค้าในหน้านี้";
                statusDiv.style.color = "#fbbf24";
            }
        });
    }
});

// Button: Start Automation
document.getElementById('startBtn').addEventListener('click', async () => {
    const btn = document.getElementById('startBtn');
    const statusDiv = document.getElementById('status-bar');

    // 1. Check if we have product data (simulated check)
    // In a real flow, we might auto-scrape here if not done yet

    // 2. Gather All Settings from UI
    const settings = {
        visualTheme: document.getElementById('visual-theme')?.value || 'Default',
        videoCount: document.querySelector('input[type="number"]')?.value || 1,
        coverText: document.querySelector('.toggle-row:nth-child(4) input')?.checked || false,
        voiceScript: document.querySelector('.toggle-row:nth-child(5) input')?.checked || false, // Note: These are still fragile if layout changes
        ugcModel: {
            gender: document.getElementById('ugc-gender')?.value,
            nation: document.getElementById('ugc-nation')?.value,
            age: document.getElementById('ugc-age')?.value,
            body: document.getElementById('ugc-body')?.value
        },
        videoSettings: {
            ratio: document.getElementById('video-ratio')?.value,
            imageCount: document.getElementById('video-img-count')?.value,
            camera: document.getElementById('video-camera')?.value
        }
    };

    // Toggle State
    if (btn.textContent.includes('เริ่มทำงาน')) {
        btn.innerHTML = '⏹ หยุดการทำงาน';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        statusDiv.textContent = "🚀 Gathering Data & Starting Flow...";
        statusDiv.style.color = "#34d399";

        // --- REAL WORKFLOW TRIGGER ---
        console.log("🔥 Starting Automation with Settings:", settings);

        // 3. Trigger Content Script to run Auto-Click / Scrape
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, {
                action: "START_FLOW",
                settings: settings
            }, (response) => {
                if (response?.success) {
                    statusDiv.textContent = "✅ Flow Started: " + response.message;
                }
            });
        }

    } else {
        btn.innerHTML = '▶ เริ่มทำงานอัตโนมัติ';
        btn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        statusDiv.textContent = "Ready to work...";
        statusDiv.style.color = "#64748b";

        // Stop signal
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) chrome.tabs.sendMessage(tab.id, { action: "STOP_FLOW" });
    }
});
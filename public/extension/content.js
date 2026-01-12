console.log("AI Affiliate Extension Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SCRAPE") {
        console.log("Dumping product info...");
        const product = scrapeProductData();

        if (product) {
            sendResponse({ message: "ดึงข้อมูลสำเร็จ!", data: product });
        } else {
            sendResponse({ message: "ไม่พบข้อมูลสินค้า" });
        }
    }

    if (request.action === "START_FLOW") {
        console.log("🚀 Starting Automation Flow with Settings:", request.settings);
        const product = scrapeProductData();

        if (!product) {
            sendResponse({ success: false, message: "No Product Found" });
            return;
        }

        // 1. Simulate Auto-Clicking (e.g., Selecting variants) behavior
        console.log("🖱️ Auto-interacting with page elements...");

        // 2. Prepare Payload for 'Prompt Flow' (The AI Generation API)
        const payload = {
            product_data: product,
            user_config: request.settings,
            timestamp: new Date().toISOString()
        };

        console.log("✨ READY TO SEND TO API (PROMPT FLOW):", payload);
        alert(`Auto-Pilot Started!\nStyle: ${request.settings.visualTheme}\nProduct: ${product.title.substring(0, 20)}...`);

        // In real version: fetch('https://your-api.com/generate', { body: JSON.stringify(payload) ... })

        sendResponse({ success: true, message: "Sending to AI Engine..." });
    }

    return true; // Keep channel open for async response
});

function scrapeProductData() {
    // 1. Try Open Graph Metadata (Standard)
    let title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    let image = document.querySelector('meta[property="og:image"]')?.content;
    let price = document.querySelector('meta[property="product:price:amount"]')?.content;

    // 2. Platform Specific Fallbacks

    // TikTok Shop
    if (window.location.hostname.includes("tiktok.com")) {
        if (!title) title = document.querySelector('h1')?.innerText;
        if (!price) price = document.querySelector('.price, [data-test-id="product-price"]')?.innerText;
        // Image usually covered by OG tags
    }

    // Shopee
    if (window.location.hostname.includes("shopee")) {
        if (!title) title = document.querySelector('.attM6y span, .qaNIZv span')?.innerText; // Common obfuscated classes
        if (!price) price = document.querySelector('.pqTWkA')?.innerText;
    }

    // Generic Fallback
    if (!image) {
        const firstImg = document.querySelector('img[width="500"], .product-image img, main img');
        if (firstImg) image = firstImg.src;
    }

    return {
        title: title?.trim().substring(0, 100) + "...",
        image: image,
        price: price || "N/A",
        url: window.location.href
    };
}

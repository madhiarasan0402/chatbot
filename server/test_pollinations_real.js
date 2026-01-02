async function checkUrl(url) {
    try {
        const response = await fetch(url);
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        if (response.status !== 200) {
            const text = await response.text();
            console.log(`Error Body: ${text.substring(0, 100)}`);
        }
    } catch (e) {
        console.log(`URL: ${url} | Failed: ${e.message}`);
    }
}

async function run() {
    const prompt = encodeURIComponent("futuristic city");
    console.log("--- Testing New API ---");
    await checkUrl(`https://gen.pollinations.ai/image/${prompt}?nologo=true`);
    console.log("\n--- Testing Legacy API ---");
    await checkUrl(`https://image.pollinations.ai/prompt/${prompt}?nologo=true`);
}

run();

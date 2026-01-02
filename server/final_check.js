async function test(url) {
    try {
        const res = await fetch(url);
        console.log(`URL: ${url} | Status: ${res.status} | Type: ${res.headers.get('content-type')}`);
    } catch (e) {
        console.log(`URL: ${url} | Error: ${e.message}`);
    }
}

async function run() {
    // These are the most likely working formats in late 2025/2026
    await test("https://pollinations.ai/p/bike");
    await test("https://gen.pollinations.ai/image/bike");
    await test("https://image.pollinations.ai/prompt/bike"); // The old one
}
run();

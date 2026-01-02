async function checkUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`URL: ${url} | Status: ${response.status} | Content-Type: ${response.headers.get('content-type')}`);
    } catch (e) {
        console.log(`URL: ${url} | Failed: ${e.message}`);
    }
}

async function run() {
    await checkUrl("https://image.pollinations.ai/prompt/bike");
    await checkUrl("https://gen.pollinations.ai/prompt/bike");
    await checkUrl("https://pollinations.ai/p/bike");
}

run();

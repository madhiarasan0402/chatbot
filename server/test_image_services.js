// Test multiple image generation services to find the best one

async function testPollinationsFlux(prompt) {
    console.log("\n=== Testing Pollinations (flux) ===");
    try {
        const encoded = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux`;
        console.log(`URL: ${url}`);

        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            console.log(`✓ Image received: ${buffer.byteLength} bytes`);
            return url;
        } else {
            const text = await response.text();
            console.log(`✗ Error: ${text.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`✗ Failed: ${e.message}`);
    }
    return null;
}

async function testPollinationsFluxPro(prompt) {
    console.log("\n=== Testing Pollinations (flux-pro) ===");
    try {
        const encoded = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux-pro`;
        console.log(`URL: ${url}`);

        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            console.log(`✓ Image received: ${buffer.byteLength} bytes`);
            return url;
        } else {
            const text = await response.text();
            console.log(`✗ Error: ${text.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`✗ Failed: ${e.message}`);
    }
    return null;
}

async function testPollinationsTurbo(prompt) {
    console.log("\n=== Testing Pollinations (turbo) ===");
    try {
        const encoded = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=turbo`;
        console.log(`URL: ${url}`);

        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            console.log(`✓ Image received: ${buffer.byteLength} bytes`);
            return url;
        } else {
            const text = await response.text();
            console.log(`✗ Error: ${text.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`✗ Failed: ${e.message}`);
    }
    return null;
}

async function testHuggingFace(prompt) {
    console.log("\n=== Testing HuggingFace Inference ===");
    try {
        const url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
        console.log(`URL: ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt })
        });

        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            console.log(`✓ Image received: ${buffer.byteLength} bytes`);
            return `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`;
        } else {
            const text = await response.text();
            console.log(`✗ Error: ${text.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`✗ Failed: ${e.message}`);
    }
    return null;
}

async function testReplicateFlux(prompt) {
    console.log("\n=== Testing Replicate-style API ===");
    try {
        const encoded = encodeURIComponent(prompt);
        const url = `https://fal.run/flux/schnell?prompt=${encoded}`;
        console.log(`URL: ${url}`);

        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const text = await response.text();
            console.log(`Response preview: ${text.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`✗ Failed: ${e.message}`);
    }
    return null;
}

async function runTests() {
    const testPrompt = "a beautiful sunset over mountains with a lake in the foreground, photorealistic, 8k";

    console.log("====================================");
    console.log("IMAGE GENERATION SERVICE TESTS");
    console.log("====================================");
    console.log(`Test Prompt: "${testPrompt}"`);

    const results = [];

    results.push(await testPollinationsFlux(testPrompt));
    results.push(await testPollinationsFluxPro(testPrompt));
    results.push(await testPollinationsTurbo(testPrompt));
    results.push(await testHuggingFace(testPrompt));
    results.push(await testReplicateFlux(testPrompt));

    console.log("\n====================================");
    console.log("SUMMARY");
    console.log("====================================");
    const working = results.filter(r => r !== null);
    console.log(`Working services: ${working.length}/${results.length}`);
    if (working.length > 0) {
        console.log("\nRecommended URL patterns:");
        working.forEach((url, i) => console.log(`${i + 1}. ${url}`));
    } else {
        console.log("\n⚠️  No services are currently working. This might be a network issue.");
    }
}

runTests();

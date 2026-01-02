async function testAirforce() {
    console.log("Testing Airforce API...");
    try {
        const response = await fetch("https://api.airforce/v1/image/generations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "a mountain bike, high resolution, 4k",
                model: "flux"
            })
        });
        const data = await response.json();
        console.log("Airforce Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.log("Airforce Failed:", e.message);
    }
}

testAirforce();

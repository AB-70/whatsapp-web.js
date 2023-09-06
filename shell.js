/**
 * ==== wwebjs-shell ====
 * Used for quickly testing library features
 *
 * Running `npm run shell` will start WhatsApp Web with headless=false
 * and then drop you into Node REPL with `client` in its context.
 */

const repl = require("repl");

const { Client, LocalAuth } = require("./index");
let atmpt = 0;
function f() {
    atmpt += 1;
    console.log(`Initializing...(${atmpt})`);
    const client = new Client({
        puppeteer: {
            headless: false,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-extensions",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                //"--single-process", // <- this one doesn't works in Windows
                "--disable-gpu",
            ],
            protocolTimeout: 30000,
        },
        authStrategy: new LocalAuth(),
        authTimeoutMs: 0,
    });
    client.initialize().catch(async (r) => {
        await client.destroy();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        f();
    });
    client.on("qr", () => {
        console.log("Please scan the QR code on the browser.");
    });

    client.on("authenticated", (session) => {
        console.log(JSON.stringify(session));
    });

    client.on("ready", () => {
        const shell = repl.start("wwebjs> ");
        shell.context.client = client;
        shell.on("exit", async () => {
            await client.destroy();
        });
    });
}
f();

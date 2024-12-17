const { execSync, spawn } = require("child_process");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("Setting up Layar Help App local deployment..");

async function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function setup() {
    const clientId = await askQuestion("Enter your client ID: ");
    const clientSecret = await askQuestion("Enter your client secret: ");

    console.log("\nCreating backend .env file...");
    const envContent = `client_id="${clientId}"\nclient_secret="${clientSecret}"`;
    fs.writeFileSync("./backend/.env", envContent);
    console.log(".env file created successfully.\n");

    console.log("Installing backend dependencies...");
    execSync("npm install", { cwd: "./backend", stdio: "inherit" });

    console.log("\nInstalling frontend dependencies...");
    execSync("npm install", { cwd: "./frontend", stdio: "inherit" });

    console.log("\nStarting backend server...");
    const backend = spawn("npm", ["start"], { cwd: "./backend", shell: true, stdio: "inherit" });

    console.log("\nStarting frontend server...");
    const frontend = spawn("npm", ["start"], { cwd: "./frontend", shell: true, stdio: "inherit" });

    console.log("\n✅ Servers are running:");
    console.log("Backend: http://localhost:5000");
    console.log("Frontend: http://localhost:3000");

    rl.close();

    backend.on("close", (code) => console.log(`Backend exited with code ${code}`));
    frontend.on("close", (code) => console.log(`Frontend exited with code ${code}`));
}

setup().catch((err) => {
    console.error("An error occurred during setup:", err);
    rl.close();
});

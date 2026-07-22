const fs = require('fs');
const { Firestore } = require('@google-cloud/firestore');
const { OAuth2Client } = require('google-auth-library');

async function main() {
    const configPath = 'C:\\Users\\comun\\.config\\configstore\\firebase-tools.json';
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const tokenInfo = configData.tokens;

    const auth = new OAuth2Client();
    auth.setCredentials({
        access_token: tokenInfo.access_token,
        refresh_token: tokenInfo.refresh_token
    });

    const db = new Firestore({
        projectId: 'gest-grupos-hotel',
        authClient: auth
    });

    const ids = ['PRES-898290', 'PRES-690767', 'PRES-636737'];
    for (const id of ids) {
        const doc = await db.collection('groups').doc(id).get();
        if (doc.exists) {
            console.log(`\n=== FOUND ${id} ===`);
            console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log(`\n=== NOT FOUND ${id} ===`);
        }
    }
}

main().catch(console.error);

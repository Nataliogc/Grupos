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

    const snapshot = await db.collection('groups').limit(5).get();
    
    snapshot.forEach(doc => {
        console.log(`\n=== DOCUMENT ID: ${doc.id} ===`);
        console.log(JSON.stringify(doc.data(), null, 2));
    });
}

main().catch(console.error);

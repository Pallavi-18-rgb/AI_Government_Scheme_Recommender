const db = require('./backend/config/db');

async function testRecs() {
    try {
        const [users] = await db.execute('SELECT age, gender, occupation, income, education, state, category, disability_status, marital_status FROM Users WHERE id = 4');
        const user = users[0];
        
        const [schemes] = await db.execute('SELECT * FROM Government_Schemes');
        
        for (const scheme of schemes) {
            let score = 0;
            let match_breakdown = {};
            let reasons = [];

            const schemeNameStr = (scheme.scheme_name || '').toLowerCase();
            const eligStr = (scheme.eligibility || '').toLowerCase();
            const catStr = (scheme.category || '').toLowerCase();
            const schemeOccStr = (scheme.occupation || '').toLowerCase();
            const userOccStr = (user.occupation || '').toLowerCase();
            const userCatStr = (user.category || '').toLowerCase();
            const schemeStateStr = (scheme.state || 'All').toLowerCase();
            const schemeEduStr = (scheme.education || 'All').toLowerCase();
            
            // Just copying the start of the logic...
            
            // ... I can just run the function directly by copy-pasting the actual route logic
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
testRecs();

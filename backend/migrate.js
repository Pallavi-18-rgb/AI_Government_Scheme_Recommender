const mysql = require('mysql2/promise');

async function run() {
    try {
        const db = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'welfare_assistant' });
        
        try {
            await db.execute("ALTER TABLE Government_Schemes ADD COLUMN required_documents JSON, ADD COLUMN application_steps JSON, ADD COLUMN estimated_approval_time VARCHAR(50) DEFAULT '15-30 days', ADD COLUMN benefits_amount VARCHAR(50) DEFAULT 'Variable'");
        } catch(e) {
            console.log('Columns may already exist in Government_Schemes');
        }

        await db.execute("CREATE TABLE IF NOT EXISTS User_Documents (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, document_type VARCHAR(100), is_available BOOLEAN DEFAULT FALSE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE, UNIQUE KEY user_doc (user_id, document_type))");
        
        try {
            await db.execute("ALTER TABLE Recommendation_Feedback ADD COLUMN application_status VARCHAR(50) DEFAULT 'Not Started'");
        } catch(e) {
            console.log('application_status column may already exist');
        }

        const [schemes] = await db.execute('SELECT id, eligibility FROM Government_Schemes');
        for (const s of schemes) {
            const docs = ['Aadhaar Card', 'Bank Passbook'];
            if (s.eligibility && s.eligibility.toLowerCase().includes('income')) docs.push('Income Certificate');
            if (s.eligibility && s.eligibility.toLowerCase().includes('caste')) docs.push('Caste Certificate');
            if (s.eligibility && s.eligibility.toLowerCase().includes('disability')) docs.push('Disability Certificate');
            
            const steps = ['Register on official portal', 'Fill application form', 'Upload required documents', 'Submit for verification'];
            
            await db.execute('UPDATE Government_Schemes SET required_documents = ?, application_steps = ? WHERE id = ?', [JSON.stringify(docs), JSON.stringify(steps), s.id]);
        }
        
        console.log('Migration complete');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

run();

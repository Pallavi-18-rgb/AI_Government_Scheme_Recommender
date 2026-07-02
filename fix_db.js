const mysql = require('mysql2/promise');

async function run() {
    try {
        const db = await mysql.createConnection({ host: process.env.DB_HOST || 'govscheme_db', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || 'rootpassword', database: process.env.DB_NAME || 'govschemes' });
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Recommendation_Feedback (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT,
              scheme_id INT,
              recommendation_id INT,
              rating INT DEFAULT 0,
              liked BOOLEAN DEFAULT FALSE,
              disliked BOOLEAN DEFAULT FALSE,
              saved BOOLEAN DEFAULT FALSE,
              applied BOOLEAN DEFAULT FALSE,
              review_text TEXT,
              application_status VARCHAR(50) DEFAULT 'Not Started',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS User_Documents (
              id INT AUTO_INCREMENT PRIMARY KEY, 
              user_id INT, 
              document_type VARCHAR(100), 
              is_available BOOLEAN DEFAULT FALSE, 
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
              FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE, 
              UNIQUE KEY user_doc (user_id, document_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        try {
            await db.execute(`ALTER TABLE Users ADD COLUMN marital_status VARCHAR(50)`);
        } catch(e) {}
        
        try {
            await db.execute(`ALTER TABLE Government_Schemes 
                ADD COLUMN education VARCHAR(255) DEFAULT 'All',
                ADD COLUMN required_documents JSON, 
                ADD COLUMN application_steps JSON, 
                ADD COLUMN estimated_approval_time VARCHAR(50) DEFAULT '15-30 days', 
                ADD COLUMN benefits_amount VARCHAR(50) DEFAULT 'Variable'`);
        } catch(e) {}
        
        const [schemes] = await db.execute('SELECT id, eligibility FROM Government_Schemes');
        for (const s of schemes) {
            const docs = ['Aadhaar Card', 'Bank Passbook'];
            if (s.eligibility && s.eligibility.toLowerCase().includes('income')) docs.push('Income Certificate');
            if (s.eligibility && s.eligibility.toLowerCase().includes('caste')) docs.push('Caste Certificate');
            if (s.eligibility && s.eligibility.toLowerCase().includes('disability')) docs.push('Disability Certificate');
            
            const steps = ['Register on official portal', 'Fill application form', 'Upload required documents', 'Submit for verification'];
            
            await db.execute('UPDATE Government_Schemes SET required_documents = ?, application_steps = ? WHERE id = ?', [JSON.stringify(docs), JSON.stringify(steps), s.id]);
        }

        console.log('Done!');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();

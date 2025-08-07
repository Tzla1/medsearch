const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medsearch_db',
  multipleStatements: true
};

async function runSeedScripts() {
  let connection;
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Read and execute specialty seeds
    console.log('🏥 Seeding specialties...');
    const specialtiesSQL = fs.readFileSync(
      path.join(__dirname, 'seeds', 'specialties.sql'),
      'utf8'
    );
    await connection.execute(specialtiesSQL);
    console.log('✅ Specialties seeded successfully');
    
    // Read and execute doctor seeds
    console.log('👨‍⚕️ Seeding doctors...');
    const doctorsSQL = fs.readFileSync(
      path.join(__dirname, 'seeds', 'doctors.sql'),
      'utf8'
    );
    await connection.execute(doctorsSQL);
    console.log('✅ Doctors seeded successfully');
    
    // Verify data
    console.log('\n📊 Database Summary:');
    
    const [specialtyCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM specialties WHERE is_active = TRUE'
    );
    console.log(`   • Specialties: ${specialtyCount[0].count}`);
    
    const [doctorCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM doctors WHERE is_verified = TRUE'
    );
    console.log(`   • Doctors: ${doctorCount[0].count}`);
    
    const [specialtyStats] = await connection.execute(`
      SELECT 
        s.name as specialty,
        COUNT(d.id) as doctor_count,
        ROUND(AVG(d.consultation_fee), 2) as avg_fee,
        ROUND(AVG(d.rating_avg), 1) as avg_rating
      FROM specialties s
      LEFT JOIN doctors d ON s.id = d.specialty_id AND d.is_verified = TRUE
      WHERE s.is_active = TRUE
      GROUP BY s.id, s.name
      HAVING doctor_count > 0
      ORDER BY doctor_count DESC
      LIMIT 10
    `);
    
    console.log('\n🏆 Top 10 Specialties:');
    specialtyStats.forEach(stat => {
      console.log(`   • ${stat.specialty}: ${stat.doctor_count} doctors (Avg: $${stat.avg_fee}, Rating: ${stat.avg_rating})`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql.substring(0, 200) + '...');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runSeedScripts();
}

module.exports = { runSeedScripts };
import { connectMongoDB } from '../config/mongodb';
import { User, UserRole } from '../models/mongodb/User';
import { Customer } from '../models/mongodb/Customer';
import { Doctor, DoctorStatus } from '../models/mongodb/Doctor';
import { CompanyAdmin } from '../models/mongodb/CompanyAdmin';
import { Specialty } from '../models/mongodb/Specialty';
import { Appointment, AppointmentStatus, AppointmentType, PaymentStatus } from '../models/mongodb/Appointment';
import { Review, ReviewStatus } from '../models/mongodb/Review';

// Seed data
const seedData = {
  specialties: [
    {
      name: 'Cardiología',
      nameEn: 'Cardiology',
      description: 'Especialidad médica que se ocupa del diagnóstico y tratamiento de las enfermedades del corazón y del sistema circulatorio',
      descriptionEn: 'Medical specialty dealing with disorders of the heart and blood vessels',
      icon: '❤️',
      category: 'Medical',
      commonConditions: ['Hipertensión arterial', 'Arritmias', 'Insuficiencia cardíaca', 'Infarto de miocardio', 'Angina de pecho'],
      commonProcedures: ['Electrocardiograma', 'Ecocardiograma', 'Prueba de esfuerzo', 'Cateterismo cardíaco', 'Angioplastia'],
      priority: 10,
      seoKeywords: ['corazón', 'cardiología', 'hipertensión', 'arritmia', 'infarto']
    },
    {
      name: 'Dermatología',
      nameEn: 'Dermatology',
      description: 'Especialidad médica que se dedica al estudio de la estructura y función de la piel',
      descriptionEn: 'Medical specialty dealing with skin, hair, nails, and related diseases',
      icon: '🧴',
      category: 'Medical',
      commonConditions: ['Acné', 'Psoriasis', 'Dermatitis', 'Melanoma', 'Vitiligo'],
      commonProcedures: ['Biopsia de piel', 'Crioterapia', 'Dermatoscopia', 'Terapia fotodinámica', 'Extirpación de lesiones'],
      priority: 8,
      seoKeywords: ['piel', 'dermatología', 'acné', 'psoriasis', 'melanoma']
    },
    {
      name: 'Pediatría',
      nameEn: 'Pediatrics',
      description: 'Especialidad médica que estudia al niño y sus enfermedades',
      descriptionEn: 'Medical specialty focused on the medical care of infants, children, and adolescents',
      icon: '👶',
      category: 'Pediatric',
      commonConditions: ['Infecciones respiratorias', 'Vacunación', 'Crecimiento y desarrollo', 'Alergias', 'Gastroenteritis'],
      commonProcedures: ['Control de niño sano', 'Vacunación', 'Evaluación del desarrollo', 'Otoscopia', 'Antropometría'],
      priority: 10,
      seoKeywords: ['pediatría', 'niños', 'vacunas', 'crecimiento', 'desarrollo']
    },
    {
      name: 'Ginecología',
      nameEn: 'Gynecology',
      description: 'Especialidad médica y quirúrgica que estudia el sistema reproductor femenino',
      descriptionEn: 'Medical practice dealing with the health of the female reproductive system',
      icon: '👩‍⚕️',
      category: 'Women Health',
      commonConditions: ['Embarazo', 'Menopausia', 'Endometriosis', 'Síndrome de ovario poliquístico', 'Infecciones vaginales'],
      commonProcedures: ['Papanicolau', 'Colposcopia', 'Ecografía ginecológica', 'Biopsia endometrial', 'Histeroscopia'],
      priority: 9,
      seoKeywords: ['ginecología', 'embarazo', 'menopausia', 'endometriosis', 'papanicolau']
    },
    {
      name: 'Traumatología y Ortopedia',
      nameEn: 'Orthopedics and Traumatology',
      description: 'Especialidad médica dedicada a corregir o evitar las deformidades o traumas del sistema musculoesquelético',
      descriptionEn: 'Medical specialty focused on the musculoskeletal system',
      icon: '🦴',
      category: 'Surgical',
      commonConditions: ['Fracturas', 'Artritis', 'Lesiones deportivas', 'Hernias discales', 'Tendinitis'],
      commonProcedures: ['Reducción de fracturas', 'Artroscopia', 'Artroplastia', 'Osteosíntesis', 'Infiltraciones'],
      priority: 8,
      seoKeywords: ['traumatología', 'ortopedia', 'fracturas', 'artritis', 'lesiones']
    },
    {
      name: 'Psiquiatría',
      nameEn: 'Psychiatry',
      description: 'Especialidad de la medicina dedicada al estudio de los trastornos mentales',
      descriptionEn: 'Medical specialty devoted to the diagnosis, prevention, and treatment of mental disorders',
      icon: '🧠',
      category: 'Mental Health',
      commonConditions: ['Depresión', 'Ansiedad', 'Trastorno bipolar', 'Esquizofrenia', 'TDAH'],
      commonProcedures: ['Evaluación psiquiátrica', 'Psicoterapia', 'Prescripción de medicamentos', 'Terapia cognitivo-conductual', 'Terapia familiar'],
      priority: 8,
      seoKeywords: ['psiquiatría', 'depresión', 'ansiedad', 'salud mental', 'terapia']
    }
  ],

  users: [
    // Doctors
    {
      clerkUserId: 'user_doctor1_test',
      email: 'dr.martinez@medsearch.com',
      username: 'dr.martinez',
      firstName: 'Carlos',
      lastName: 'Martínez',
      role: UserRole.DOCTOR,
      profileImageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      isVerified: true,
      isActive: true
    },
    {
      clerkUserId: 'user_doctor2_test',
      email: 'dra.rodriguez@medsearch.com',
      username: 'dra.rodriguez',
      firstName: 'Ana',
      lastName: 'Rodríguez',
      role: UserRole.DOCTOR,
      profileImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      isVerified: true,
      isActive: true
    },
    {
      clerkUserId: 'user_doctor3_test',
      email: 'dr.lopez@medsearch.com',
      username: 'dr.lopez',
      firstName: 'Miguel',
      lastName: 'López',
      role: UserRole.DOCTOR,
      profileImageUrl: 'https://images.unsplash.com/photo-1582750433443-93cb9c49e4be?w=400',
      isVerified: true,
      isActive: true
    },
    // Customers
    {
      clerkUserId: 'user_customer1_test',
      email: 'maria.garcia@email.com',
      username: 'maria.garcia',
      firstName: 'María',
      lastName: 'García',
      role: UserRole.CUSTOMER,
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b6d4c16f?w=400',
      isVerified: true,
      isActive: true
    },
    {
      clerkUserId: 'user_customer2_test',
      email: 'juan.perez@email.com',
      username: 'juan.perez',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.CUSTOMER,
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      isVerified: true,
      isActive: true
    },
    // Admin
    {
      clerkUserId: 'user_admin1_test',
      email: 'admin@medsearch.com',
      username: 'admin',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: UserRole.COMPANY_ADMIN,
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      isVerified: true,
      isActive: true
    }
  ]
};

async function seedSpecialties() {
  console.log('🌱 Seeding specialties...');
  
  for (const specialtyData of seedData.specialties) {
    try {
      await Specialty.findOneAndUpdate(
        { nameEn: specialtyData.nameEn },
        specialtyData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error seeding specialty ${specialtyData.name}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${seedData.specialties.length} specialties`);
}

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  for (const userData of seedData.users) {
    try {
      await User.findOneAndUpdate(
        { clerkUserId: userData.clerkUserId },
        userData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error seeding user ${userData.email}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${seedData.users.length} users`);
}

async function seedCustomers() {
  console.log('🌱 Seeding customers...');
  
  const customerUsers = await User.find({ role: UserRole.CUSTOMER });
  
  for (const user of customerUsers) {
    try {
      const customerData = {
        userId: user._id,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'prefer_not_to_say' as const,
        phoneNumber: '+52 55 1234 5678',
        address: {
          street: 'Av. Revolución 123',
          city: 'Ciudad de México',
          state: 'Ciudad de México',
          country: 'México',
          zipCode: '03100'
        },
        emergencyContact: {
          name: 'Contacto Emergencia',
          phoneNumber: '+52 55 8765 4321',
          relationship: 'Familiar'
        },
        insuranceProvider: 'Seguro Popular',
        preferredLanguage: 'es'
      };

      await Customer.findOneAndUpdate(
        { userId: user._id },
        customerData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error seeding customer for user ${user.email}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${customerUsers.length} customers`);
}

async function seedDoctors() {
  console.log('🌱 Seeding doctors...');
  
  const doctorUsers = await User.find({ role: UserRole.DOCTOR });
  const specialties = await Specialty.find();
  
  const doctorProfiles = [
    {
      licenseNumber: 'MED-12345-CDX',
      specialtyNames: ['Cardiología'],
      education: [
        {
          degree: 'Médico Cirujano',
          institution: 'Universidad Nacional Autónoma de México',
          year: 2010
        },
        {
          degree: 'Especialidad en Cardiología',
          institution: 'Instituto Nacional de Cardiología',
          year: 2014
        }
      ],
      experience: [
        {
          position: 'Cardiólogo',
          institution: 'Hospital General de México',
          startDate: new Date('2014-01-01'),
          endDate: new Date('2020-12-31'),
          current: false
        },
        {
          position: 'Cardiólogo Senior',
          institution: 'Centro Médico ABC',
          startDate: new Date('2021-01-01'),
          current: true
        }
      ],
      consultationFee: 1500,
      about: 'Especialista en cardiología con más de 10 años de experiencia. Enfoque en prevención y tratamiento de enfermedades cardiovasculares.',
      languages: ['Español', 'Inglés']
    },
    {
      licenseNumber: 'MED-67890-RDZ',
      specialtyNames: ['Dermatología'],
      education: [
        {
          degree: 'Médico Cirujano',
          institution: 'Instituto Politécnico Nacional',
          year: 2012
        },
        {
          degree: 'Especialidad en Dermatología',
          institution: 'Hospital General Dr. Manuel Gea González',
          year: 2016
        }
      ],
      experience: [
        {
          position: 'Dermatóloga',
          institution: 'Clínica de Especialidades',
          startDate: new Date('2016-01-01'),
          current: true
        }
      ],
      consultationFee: 1200,
      about: 'Dermatóloga especializada en medicina estética y tratamiento de enfermedades de la piel.',
      languages: ['Español', 'Francés']
    },
    {
      licenseNumber: 'MED-13579-LPZ',
      specialtyNames: ['Pediatría'],
      education: [
        {
          degree: 'Médico Cirujano',
          institution: 'Universidad Autónoma Metropolitana',
          year: 2008
        },
        {
          degree: 'Especialidad en Pediatría',
          institution: 'Hospital Infantil de México Federico Gómez',
          year: 2012
        }
      ],
      experience: [
        {
          position: 'Pediatra',
          institution: 'Hospital Infantil de México',
          startDate: new Date('2012-01-01'),
          endDate: new Date('2018-12-31'),
          current: false
        },
        {
          position: 'Pediatra Consulta Privada',
          institution: 'Consultorio Privado',
          startDate: new Date('2019-01-01'),
          current: true
        }
      ],
      consultationFee: 800,
      about: 'Pediatra con amplia experiencia en el cuidado integral de niños y adolescentes.',
      languages: ['Español']
    }
  ];

  for (let i = 0; i < doctorUsers.length && i < doctorProfiles.length; i++) {
    const user = doctorUsers[i];
    const profile = doctorProfiles[i];
    
    try {
      // Find specialty IDs
      const doctorSpecialties = specialties.filter(s => 
        profile.specialtyNames.includes(s.name)
      );
      
      const doctorData = {
        userId: user._id,
        licenseNumber: profile.licenseNumber,
        specialtyIds: doctorSpecialties.map(s => s._id),
        education: profile.education,
        experience: profile.experience,
        consultationFee: profile.consultationFee,
        consultationDuration: 30,
        languages: profile.languages,
        about: profile.about,
        address: {
          street: 'Av. Insurgentes Sur 1234',
          city: 'Ciudad de México',
          state: 'Ciudad de México',
          country: 'México',
          zipCode: '03100'
        },
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', isActive: true }
        ],
        status: DoctorStatus.VERIFIED,
        ratings: { average: 4.5 + Math.random() * 0.5, count: Math.floor(Math.random() * 50) + 10 },
        totalAppointments: Math.floor(Math.random() * 200) + 50,
        completedAppointments: Math.floor(Math.random() * 150) + 40
      };

      await Doctor.findOneAndUpdate(
        { userId: user._id },
        doctorData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error seeding doctor for user ${user.email}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${Math.min(doctorUsers.length, doctorProfiles.length)} doctors`);
}

async function seedCompanyAdmins() {
  console.log('🌱 Seeding company admins...');
  
  const adminUsers = await User.find({ role: UserRole.COMPANY_ADMIN });
  
  for (const user of adminUsers) {
    try {
      const adminData = {
        userId: user._id,
        department: 'Platform Management',
        permissions: {
          canManageDoctors: true,
          canManageUsers: true,
          canViewReports: true,
          canManageContent: true,
          canAccessFinancials: true
        },
        isActive: true
      };

      await CompanyAdmin.findOneAndUpdate(
        { userId: user._id },
        adminData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error seeding admin for user ${user.email}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${adminUsers.length} company admins`);
}

async function seedAppointments() {
  console.log('🌱 Seeding appointments...');
  
  const customers = await Customer.find().populate('userId');
  const doctors = await Doctor.find().populate('userId');
  
  if (customers.length === 0 || doctors.length === 0) {
    console.log('⚠️ No customers or doctors found, skipping appointments');
    return;
  }

  const appointmentTypes = [AppointmentType.CONSULTATION, AppointmentType.FOLLOW_UP, AppointmentType.PREVENTIVE];
  const statuses = [AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING];
  
  for (let i = 0; i < 10; i++) {
    try {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30) - 15); // ±15 days
      scheduledDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9 AM to 5 PM
      
      const scheduledEndTime = new Date(scheduledDate);
      scheduledEndTime.setMinutes(scheduledEndTime.getMinutes() + 30);

      const appointmentData = {
        customerId: customer._id,
        doctorId: doctor._id,
        appointmentType,
        scheduledDate,
        scheduledEndTime,
        status,
        reasonForVisit: 'Consulta general de rutina',
        payment: {
          amount: doctor.consultationFee || 1000,
          status: status === AppointmentStatus.COMPLETED ? PaymentStatus.PAID : PaymentStatus.PENDING
        }
      };

      await Appointment.create(appointmentData);
    } catch (error) {
      console.error(`Error seeding appointment ${i}:`, error);
    }
  }
  
  console.log('✅ Seeded 10 appointments');
}

async function seedReviews() {
  console.log('🌱 Seeding reviews...');
  
  const completedAppointments = await Appointment.find({ 
    status: AppointmentStatus.COMPLETED 
  }).populate(['customerId', 'doctorId']);
  
  if (completedAppointments.length === 0) {
    console.log('⚠️ No completed appointments found, skipping reviews');
    return;
  }

  const reviewTexts = [
    'Excelente atención, muy profesional y detallado en sus explicaciones.',
    'El doctor fue muy amable y resolvió todas mis dudas.',
    'Buena experiencia, aunque la espera fue un poco larga.',
    'Muy recomendado, excelente trato y diagnóstico acertado.',
    'El tratamiento fue efectivo, estoy muy satisfecho con los resultados.'
  ];

  for (let i = 0; i < Math.min(5, completedAppointments.length); i++) {
    try {
      const appointment = completedAppointments[i];
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
      
      const reviewData = {
        customerId: appointment.customerId._id,
        doctorId: appointment.doctorId._id,
        appointmentId: appointment._id,
        rating,
        title: rating === 5 ? 'Excelente servicio' : 'Muy buena atención',
        comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
        aspects: {
          punctuality: rating,
          communication: rating,
          treatment: rating,
          facilities: rating - Math.floor(Math.random() * 2),
          overallExperience: rating
        },
        wouldRecommend: rating >= 4,
        visitDate: appointment.scheduledDate,
        status: ReviewStatus.APPROVED
      };

      await Review.create(reviewData);
    } catch (error) {
      console.error(`Error seeding review ${i}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${Math.min(5, completedAppointments.length)} reviews`);
}

async function updateSpecialtyStatistics() {
  console.log('🌱 Updating specialty statistics...');
  
  const specialties = await Specialty.find();
  
  for (const specialty of specialties) {
    try {
      const doctorCount = await Doctor.countDocuments({
        specialtyIds: specialty._id,
        status: DoctorStatus.VERIFIED
      });

      const doctorStats = await Doctor.aggregate([
        { $match: { specialtyIds: specialty._id, status: DoctorStatus.VERIFIED } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$ratings.average' },
            totalAppointments: { $sum: '$totalAppointments' },
            avgFee: { $avg: '$consultationFee' },
            minFee: { $min: '$consultationFee' },
            maxFee: { $max: '$consultationFee' }
          }
        }
      ]);

      const stats = doctorStats[0] || {
        avgRating: 0,
        totalAppointments: 0,
        avgFee: 0,
        minFee: 0,
        maxFee: 0
      };

      await Specialty.findByIdAndUpdate(specialty._id, {
        statistics: {
          totalDoctors: doctorCount,
          averageRating: stats.avgRating || 0,
          totalAppointments: stats.totalAppointments || 0,
          lastUpdated: new Date()
        },
        averageConsultationFee: {
          min: stats.minFee || 0,
          max: stats.maxFee || 0,
          average: stats.avgFee || 0
        }
      });
    } catch (error) {
      console.error(`Error updating statistics for specialty ${specialty.name}:`, error);
    }
  }
  
  console.log(`✅ Updated statistics for ${specialties.length} specialties`);
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Seed data in order
    await seedSpecialties();
    await seedUsers();
    await seedCustomers();
    await seedDoctors();
    await seedCompanyAdmins();
    await seedAppointments();
    await seedReviews();
    await updateSpecialtyStatistics();
    
    console.log('\n✅ Database seeding completed successfully!');
    
    // Print summary
    const counts = {
      specialties: await Specialty.countDocuments(),
      users: await User.countDocuments(),
      customers: await Customer.countDocuments(),
      doctors: await Doctor.countDocuments(),
      appointments: await Appointment.countDocuments(),
      reviews: await Review.countDocuments()
    };
    
    console.log('\n📊 Final counts:');
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default main;
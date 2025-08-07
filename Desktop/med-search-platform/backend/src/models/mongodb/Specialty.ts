import { Schema, model, Document, Types } from 'mongoose';

export interface ISpecialty extends Document {
  name: string;
  nameEn: string; // English name
  description: string;
  descriptionEn: string; // English description
  icon: string; // Emoji or icon identifier
  imageUrl?: string;
  category: string; // General category (e.g., "Medical", "Surgical", "Diagnostic")
  parentSpecialty?: Types.ObjectId; // For sub-specialties
  subSpecialties: Types.ObjectId[];
  commonConditions: string[]; // Common conditions treated
  commonProcedures: string[]; // Common procedures performed
  requiredEducation: string[]; // Required education/certifications
  averageConsultationDuration: number; // in minutes
  averageConsultationFee: {
    min: number;
    max: number;
    average: number;
  };
  isActive: boolean;
  priority: number; // For sorting in UI
  seoKeywords: string[]; // For search optimization
  relatedSpecialties: Types.ObjectId[];
  statistics: {
    totalDoctors: number;
    totalAppointments: number;
    averageRating: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SpecialtySchema = new Schema<ISpecialty>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  nameEn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  descriptionEn: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true
  },
  imageUrl: String,
  category: {
    type: String,
    required: true,
    enum: ['Medical', 'Surgical', 'Diagnostic', 'Mental Health', 'Pediatric', 'Women Health', 'Emergency', 'Preventive', 'Alternative'],
    index: true
  },
  parentSpecialty: {
    type: Schema.Types.ObjectId,
    ref: 'Specialty'
  },
  subSpecialties: [{
    type: Schema.Types.ObjectId,
    ref: 'Specialty'
  }],
  commonConditions: [{
    type: String,
    trim: true
  }],
  commonProcedures: [{
    type: String,
    trim: true
  }],
  requiredEducation: [{
    type: String,
    trim: true
  }],
  averageConsultationDuration: {
    type: Number,
    default: 30,
    min: 15
  },
  averageConsultationFee: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    average: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  seoKeywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  relatedSpecialties: [{
    type: Schema.Types.ObjectId,
    ref: 'Specialty'
  }],
  statistics: {
    totalDoctors: {
      type: Number,
      default: 0
    },
    totalAppointments: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes
SpecialtySchema.index({ category: 1, isActive: 1, priority: -1 });
SpecialtySchema.index({ seoKeywords: 1 });
SpecialtySchema.index({ 'statistics.totalDoctors': -1 });

// Method to update statistics
SpecialtySchema.methods.updateStatistics = async function() {
  // This would be called periodically to update counts
  // In a real implementation, this would query the Doctor and Appointment collections
  this.statistics.lastUpdated = new Date();
  await this.save();
};

// Static method to get specialty hierarchy
SpecialtySchema.statics.getHierarchy = async function() {
  const specialties = await this.find({ isActive: true, parentSpecialty: null })
    .populate('subSpecialties')
    .sort({ priority: -1, name: 1 });
  
  return specialties;
};

// Static method to search specialties
SpecialtySchema.statics.searchSpecialties = async function(query: string, limit: number = 10) {
  const searchRegex = new RegExp(query, 'i');
  
  return await this.find({
    isActive: true,
    $or: [
      { name: searchRegex },
      { nameEn: searchRegex },
      { seoKeywords: { $in: [searchRegex] } },
      { commonConditions: { $in: [searchRegex] } }
    ]
  })
  .sort({ 'statistics.totalDoctors': -1, priority: -1 })
  .limit(limit);
};

// Static method to seed initial specialties
SpecialtySchema.statics.seedSpecialties = async function() {
  const specialties = [
    {
      name: 'Cardiología',
      nameEn: 'Cardiology',
      description: 'Especialidad médica que se ocupa del corazón y el sistema circulatorio',
      descriptionEn: 'Medical specialty dealing with the heart and circulatory system',
      icon: '❤️',
      category: 'Medical',
      commonConditions: ['Hipertensión', 'Arritmias', 'Insuficiencia cardíaca', 'Infarto'],
      commonProcedures: ['Electrocardiograma', 'Ecocardiograma', 'Cateterismo'],
      priority: 10
    },
    {
      name: 'Dermatología',
      nameEn: 'Dermatology',
      description: 'Especialidad que trata enfermedades de la piel, cabello y uñas',
      descriptionEn: 'Specialty treating diseases of the skin, hair, and nails',
      icon: '🔬',
      category: 'Medical',
      commonConditions: ['Acné', 'Psoriasis', 'Dermatitis', 'Melanoma'],
      commonProcedures: ['Biopsia de piel', 'Crioterapia', 'Dermatoscopia'],
      priority: 8
    },
    {
      name: 'Pediatría',
      nameEn: 'Pediatrics',
      description: 'Medicina especializada en la salud de bebés, niños y adolescentes',
      descriptionEn: 'Medicine specialized in the health of babies, children, and adolescents',
      icon: '👶',
      category: 'Pediatric',
      commonConditions: ['Infecciones respiratorias', 'Alergias', 'Vacunación', 'Crecimiento'],
      commonProcedures: ['Vacunación', 'Control de niño sano', 'Evaluación del desarrollo'],
      priority: 10
    },
    {
      name: 'Neurología',
      nameEn: 'Neurology',
      description: 'Especialidad que trata trastornos del sistema nervioso',
      descriptionEn: 'Specialty treating disorders of the nervous system',
      icon: '🧠',
      category: 'Medical',
      commonConditions: ['Migraña', 'Epilepsia', 'Parkinson', 'Alzheimer'],
      commonProcedures: ['Electroencefalograma', 'Resonancia magnética', 'Punción lumbar'],
      priority: 7
    },
    {
      name: 'Ginecología',
      nameEn: 'Gynecology',
      description: 'Especialidad dedicada a la salud del sistema reproductor femenino',
      descriptionEn: 'Specialty dedicated to female reproductive system health',
      icon: '👩‍⚕️',
      category: 'Women Health',
      commonConditions: ['Embarazo', 'Menopausia', 'Endometriosis', 'Ovarios poliquísticos'],
      commonProcedures: ['Papanicolau', 'Ecografía pélvica', 'Colposcopia'],
      priority: 9
    },
    {
      name: 'Traumatología',
      nameEn: 'Orthopedics',
      description: 'Especialidad que trata lesiones y enfermedades del sistema musculoesquelético',
      descriptionEn: 'Specialty treating injuries and diseases of the musculoskeletal system',
      icon: '🦴',
      category: 'Surgical',
      commonConditions: ['Fracturas', 'Artritis', 'Lesiones deportivas', 'Hernias discales'],
      commonProcedures: ['Radiografías', 'Artroscopia', 'Reducción de fracturas'],
      priority: 8
    },
    {
      name: 'Oftalmología',
      nameEn: 'Ophthalmology',
      description: 'Especialidad médica que trata enfermedades de los ojos',
      descriptionEn: 'Medical specialty treating eye diseases',
      icon: '👁️',
      category: 'Surgical',
      commonConditions: ['Miopía', 'Cataratas', 'Glaucoma', 'Conjuntivitis'],
      commonProcedures: ['Examen de agudeza visual', 'Tonometría', 'Cirugía de cataratas'],
      priority: 7
    },
    {
      name: 'Psiquiatría',
      nameEn: 'Psychiatry',
      description: 'Especialidad médica dedicada a los trastornos mentales',
      descriptionEn: 'Medical specialty dedicated to mental disorders',
      icon: '🧘',
      category: 'Mental Health',
      commonConditions: ['Depresión', 'Ansiedad', 'Trastorno bipolar', 'Esquizofrenia'],
      commonProcedures: ['Evaluación psiquiátrica', 'Psicoterapia', 'Manejo de medicamentos'],
      priority: 8
    }
  ];

  for (const specialty of specialties) {
    await this.findOneAndUpdate(
      { nameEn: specialty.nameEn },
      specialty,
      { upsert: true, new: true }
    );
  }
};

export const Specialty = model<ISpecialty>('Specialty', SpecialtySchema);
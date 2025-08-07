-- ===============================================================
-- SEED DATA FOR DOCTORS - 20 doctors per specialty
-- ===============================================================

-- Limpiar datos existentes
DELETE FROM doctors;
ALTER TABLE doctors AUTO_INCREMENT = 1;

-- ===============================================================
-- MEDICINA GENERAL (20 doctores)
-- ===============================================================
INSERT INTO doctors (user_id, first_name, last_name, specialty_id, phone_number, address, city, state, zip_code, bio, consultation_fee, years_experience, is_verified, is_accepting_patients, rating_avg, rating_count) VALUES

-- Medicina General (specialty_id = 1)
(NULL, 'Carlos', 'Rodriguez', 1, '555-0101', 'Av. Insurgentes 1234', 'Ciudad de México', 'CDMX', '01000', 'Médico general con amplia experiencia en atención primaria', 450.00, 8, TRUE, TRUE, 4.5, 45),
(NULL, 'Maria', 'Garcia', 1, '555-0102', 'Calle Reforma 567', 'Ciudad de México', 'CDMX', '01010', 'Especialista en medicina familiar y preventiva', 500.00, 12, TRUE, TRUE, 4.7, 67),
(NULL, 'Roberto', 'Martinez', 1, '555-0103', 'Av. Universidad 890', 'Ciudad de México', 'CDMX', '01020', 'Médico con enfoque en medicina integral', 420.00, 6, TRUE, TRUE, 4.3, 32),
(NULL, 'Ana', 'Lopez', 1, '555-0104', 'Calle Madero 234', 'Ciudad de México', 'CDMX', '01030', 'Atención médica personalizada para toda la familia', 480.00, 10, TRUE, TRUE, 4.6, 54),
(NULL, 'Luis', 'Hernandez', 1, '555-0105', 'Av. Juarez 456', 'Ciudad de México', 'CDMX', '01040', 'Medicina preventiva y tratamiento de enfermedades crónicas', 470.00, 9, TRUE, TRUE, 4.4, 41),
(NULL, 'Patricia', 'Jimenez', 1, '555-0106', 'Calle 5 de Mayo 789', 'Ciudad de México', 'CDMX', '01050', 'Médico general con especialización en geriatría', 520.00, 15, TRUE, TRUE, 4.8, 73),
(NULL, 'Diego', 'Morales', 1, '555-0107', 'Av. Chapultepec 123', 'Ciudad de México', 'CDMX', '01060', 'Atención médica integral con enfoque humanizado', 440.00, 7, TRUE, TRUE, 4.2, 28),
(NULL, 'Carmen', 'Ruiz', 1, '555-0108', 'Calle Hidalgo 345', 'Ciudad de México', 'CDMX', '01070', 'Medicina familiar y cuidados preventivos', 490.00, 11, TRUE, TRUE, 4.5, 49),
(NULL, 'Fernando', 'Castro', 1, '555-0109', 'Av. Revolución 678', 'Ciudad de México', 'CDMX', '01080', 'Especialista en medicina interna y familiar', 460.00, 8, TRUE, TRUE, 4.3, 36),
(NULL, 'Silvia', 'Vargas', 1, '555-0110', 'Calle Morelos 901', 'Ciudad de México', 'CDMX', '01090', 'Médico general con amplia experiencia clínica', 510.00, 13, TRUE, TRUE, 4.7, 61),
(NULL, 'Alejandro', 'Mendez', 1, '555-0111', 'Av. Constituyentes 234', 'Ciudad de México', 'CDMX', '01100', 'Atención médica integral para adultos y niños', 430.00, 6, TRUE, TRUE, 4.1, 25),
(NULL, 'Gabriela', 'Torres', 1, '555-0112', 'Calle Independencia 567', 'Ciudad de México', 'CDMX', '01110', 'Medicina preventiva y promoción de la salud', 485.00, 10, TRUE, TRUE, 4.6, 52),
(NULL, 'Miguel', 'Ramos', 1, '555-0113', 'Av. Patriotismo 890', 'Ciudad de México', 'CDMX', '01120', 'Médico familiar con enfoque en medicina preventiva', 475.00, 9, TRUE, TRUE, 4.4, 38),
(NULL, 'Leticia', 'Flores', 1, '555-0114', 'Calle Allende 123', 'Ciudad de México', 'CDMX', '01130', 'Atención médica personalizada y humanizada', 495.00, 12, TRUE, TRUE, 4.5, 47),
(NULL, 'Ricardo', 'Santana', 1, '555-0115', 'Av. Tlalpan 456', 'Ciudad de México', 'CDMX', '01140', 'Medicina general con especialización en urgencias', 440.00, 7, TRUE, TRUE, 4.2, 31),
(NULL, 'Mónica', 'Aguilar', 1, '555-0116', 'Calle Cuauhtémoc 789', 'Ciudad de México', 'CDMX', '01150', 'Médico familiar con enfoque integral', 505.00, 14, TRUE, TRUE, 4.8, 69),
(NULL, 'Javier', 'Delgado', 1, '555-0117', 'Av. División del Norte 012', 'Ciudad de México', 'CDMX', '01160', 'Atención médica de calidad para toda la familia', 455.00, 8, TRUE, TRUE, 4.3, 34),
(NULL, 'Rosa', 'Peña', 1, '555-0118', 'Calle Doctores 345', 'Ciudad de México', 'CDMX', '01170', 'Medicina preventiva y cuidados primarios', 480.00, 10, TRUE, TRUE, 4.6, 55),
(NULL, 'Arturo', 'Silva', 1, '555-0119', 'Av. Coyoacán 678', 'Ciudad de México', 'CDMX', '01180', 'Médico general con amplia experiencia en consulta externa', 465.00, 9, TRUE, TRUE, 4.4, 42),
(NULL, 'Elena', 'Guerrero', 1, '555-0120', 'Calle Tacuba 901', 'Ciudad de México', 'CDMX', '01190', 'Atención médica integral con enfoque preventivo', 490.00, 11, TRUE, TRUE, 4.7, 58),

-- Medicina Familiar (specialty_id = 2)
(NULL, 'Eduardo', 'Campos', 2, '555-0201', 'Av. Insurgentes Sur 1111', 'Ciudad de México', 'CDMX', '02000', 'Especialista en medicina familiar con enfoque comunitario', 520.00, 15, TRUE, TRUE, 4.8, 82),
(NULL, 'Claudia', 'Ortiz', 2, '555-0202', 'Calle San Jerónimo 222', 'Ciudad de México', 'CDMX', '02010', 'Medicina familiar integral para todas las edades', 480.00, 12, TRUE, TRUE, 4.6, 65),
(NULL, 'Ramón', 'Vega', 2, '555-0203', 'Av. Miguel Ángel de Quevedo 333', 'Ciudad de México', 'CDMX', '02020', 'Atención médica familiar con enfoque preventivo', 500.00, 13, TRUE, TRUE, 4.7, 71),
(NULL, 'Beatriz', 'Herrera', 2, '555-0204', 'Calle Universidad 444', 'Ciudad de México', 'CDMX', '02030', 'Médico familiar especializado en adolescentes', 495.00, 11, TRUE, TRUE, 4.5, 58),
(NULL, 'Francisco', 'Molina', 2, '555-0205', 'Av. Patriotismo 555', 'Ciudad de México', 'CDMX', '02040', 'Medicina familiar con enfoque en enfermedades crónicas', 510.00, 14, TRUE, TRUE, 4.7, 76),
(NULL, 'Isabella', 'Cruz', 2, '555-0206', 'Calle Eje Central 666', 'Ciudad de México', 'CDMX', '02050', 'Atención integral para familias mexicanas', 485.00, 10, TRUE, TRUE, 4.4, 53),
(NULL, 'Héctor', 'Romero', 2, '555-0207', 'Av. Revolución 777', 'Ciudad de México', 'CDMX', '02060', 'Medicina familiar preventiva y terapéutica', 505.00, 12, TRUE, TRUE, 4.6, 67),
(NULL, 'Adriana', 'Guzmán', 2, '555-0208', 'Calle Félix Cuevas 888', 'Ciudad de México', 'CDMX', '02070', 'Especialista en medicina familiar y comunitaria', 490.00, 9, TRUE, TRUE, 4.3, 45),
(NULL, 'Sergio', 'Navarro', 2, '555-0209', 'Av. Cuauhtémoc 999', 'Ciudad de México', 'CDMX', '02080', 'Médico familiar con enfoque en medicina preventiva', 515.00, 16, TRUE, TRUE, 4.8, 89),
(NULL, 'Lucía', 'Paredes', 2, '555-0210', 'Calle Insurgentes Norte 1010', 'Ciudad de México', 'CDMX', '02090', 'Atención médica familiar integral y personalizada', 475.00, 8, TRUE, TRUE, 4.2, 39),
(NULL, 'Gonzalo', 'Medina', 2, '555-0211', 'Av. Álvaro Obregón 1111', 'Ciudad de México', 'CDMX', '02100', 'Medicina familiar con especialización en geriatría', 525.00, 17, TRUE, TRUE, 4.9, 94),
(NULL, 'Valeria', 'Ríos', 2, '555-0212', 'Calle Barranca del Muerto 1212', 'Ciudad de México', 'CDMX', '02110', 'Médico familiar especializado en pediatría', 480.00, 10, TRUE, TRUE, 4.5, 56),
(NULL, 'Raúl', 'Cortés', 2, '555-0213', 'Av. Viaducto 1313', 'Ciudad de México', 'CDMX', '02120', 'Atención médica familiar con enfoque holístico', 500.00, 13, TRUE, TRUE, 4.6, 72),
(NULL, 'Cristina', 'Lara', 2, '555-0214', 'Calle Observatorio 1414', 'Ciudad de México', 'CDMX', '02130', 'Medicina familiar preventiva y educativa', 495.00, 11, TRUE, TRUE, 4.4, 48),
(NULL, 'Andrés', 'Soto', 2, '555-0215', 'Av. Río Mixcoac 1515', 'Ciudad de México', 'CDMX', '02140', 'Especialista en medicina familiar y urgencias', 510.00, 14, TRUE, TRUE, 4.7, 78),
(NULL, 'Karla', 'Espinoza', 2, '555-0216', 'Calle Circuito Interior 1616', 'Ciudad de México', 'CDMX', '02150', 'Médico familiar con enfoque en salud mental', 485.00, 9, TRUE, TRUE, 4.3, 41),
(NULL, 'Emilio', 'Cabrera', 2, '555-0217', 'Av. Periférico 1717', 'Ciudad de México', 'CDMX', '02160', 'Atención médica familiar integral y continua', 520.00, 15, TRUE, TRUE, 4.8, 85),
(NULL, 'Paola', 'Montoya', 2, '555-0218', 'Calle Anillo Periférico 1818', 'Ciudad de México', 'CDMX', '02170', 'Medicina familiar con especialización en nutrición', 490.00, 12, TRUE, TRUE, 4.5, 62),
(NULL, 'Octavio', 'Reyes', 2, '555-0219', 'Av. Constituyentes 1919', 'Ciudad de México', 'CDMX', '02180', 'Médico familiar especializado en medicina deportiva', 505.00, 13, TRUE, TRUE, 4.6, 69),
(NULL, 'Fernanda', 'Ibarra', 2, '555-0220', 'Calle Eje 10 Sur 2020', 'Ciudad de México', 'CDMX', '02190', 'Atención médica familiar con enfoque comunitario', 475.00, 8, TRUE, TRUE, 4.2, 37);

-- ===============================================================
-- CARDIOLOGÍA (20 doctores)
-- ===============================================================
INSERT INTO doctors (user_id, first_name, last_name, specialty_id, phone_number, address, city, state, zip_code, bio, consultation_fee, years_experience, is_verified, is_accepting_patients, rating_avg, rating_count) VALUES

-- Cardiología (specialty_id = 3)
(NULL, 'Alberto', 'Mendoza', 3, '555-0301', 'Av. Polanco 1000', 'Ciudad de México', 'CDMX', '03000', 'Cardiólogo especializado en arritmias y marcapasos', 1200.00, 20, TRUE, TRUE, 4.9, 156),
(NULL, 'Diana', 'Salinas', 3, '555-0302', 'Calle Masaryk 2000', 'Ciudad de México', 'CDMX', '03010', 'Especialista en cardiología intervencionista', 1350.00, 18, TRUE, TRUE, 4.8, 143),
(NULL, 'Mauricio', 'Fuentes', 3, '555-0303', 'Av. Presidente Masaryk 3000', 'Ciudad de México', 'CDMX', '03020', 'Cardiólogo con subespecialidad en electrofisiología', 1400.00, 22, TRUE, TRUE, 4.9, 178),
(NULL, 'Sofía', 'Castillo', 3, '555-0304', 'Calle Campos Elíseos 4000', 'Ciudad de México', 'CDMX', '03030', 'Especialista en ecocardiografía y cardiopatías congénitas', 1150.00, 16, TRUE, TRUE, 4.7, 124),
(NULL, 'Jorge', 'Peña', 3, '555-0305', 'Av. Ejército Nacional 5000', 'Ciudad de México', 'CDMX', '03040', 'Cardiólogo especializado en insuficiencia cardíaca', 1300.00, 19, TRUE, TRUE, 4.8, 167),
(NULL, 'Mariana', 'Vázquez', 3, '555-0306', 'Calle Homero 6000', 'Ciudad de México', 'CDMX', '03050', 'Especialista en cardiología preventiva y rehabilitación', 1100.00, 14, TRUE, TRUE, 4.6, 98),
(NULL, 'Rodrigo', 'Chávez', 3, '555-0307', 'Av. Horacio 7000', 'Ciudad de México', 'CDMX', '03060', 'Cardiólogo intervencionista especializado en angioplastia', 1450.00, 25, TRUE, TRUE, 4.9, 201),
(NULL, 'Camila', 'Sandoval', 3, '555-0308', 'Calle Virgilio 8000', 'Ciudad de México', 'CDMX', '03070', 'Especialista en cardiopatías isquémicas', 1250.00, 17, TRUE, TRUE, 4.7, 135),
(NULL, 'Óscar', 'Bautista', 3, '555-0309', 'Av. Cervantes 9000', 'Ciudad de México', 'CDMX', '03080', 'Cardiólogo especializado en hipertensión arterial', 1180.00, 15, TRUE, TRUE, 4.6, 112),
(NULL, 'Alejandra', 'Moreno', 3, '555-0310', 'Calle Molière 1010', 'Ciudad de México', 'CDMX', '03090', 'Especialista en cardiología pediátrica', 1320.00, 18, TRUE, TRUE, 4.8, 149),
(NULL, 'Víctor', 'Contreras', 3, '555-0311', 'Av. Newton 1111', 'Ciudad de México', 'CDMX', '03100', 'Cardiólogo especializado en cirugía cardiovascular', 1500.00, 23, TRUE, TRUE, 4.9, 189),
(NULL, 'Natalia', 'Herrera', 3, '555-0312', 'Calle Arquímedes 1212', 'Ciudad de México', 'CDMX', '03110', 'Especialista en medicina nuclear cardiológica', 1280.00, 16, TRUE, TRUE, 4.7, 127),
(NULL, 'Felipe', 'Aguilar', 3, '555-0313', 'Av. Galileo 1313', 'Ciudad de México', 'CDMX', '03120', 'Cardiólogo especializado en valvulopatías', 1350.00, 20, TRUE, TRUE, 4.8, 162),
(NULL, 'Daniela', 'Luna', 3, '555-0314', 'Calle Kepler 1414', 'Ciudad de México', 'CDMX', '03130', 'Especialista en cardiología geriátrica', 1200.00, 14, TRUE, TRUE, 4.6, 105),
(NULL, 'Ignacio', 'Solís', 3, '555-0315', 'Av. Copérnico 1515', 'Ciudad de México', 'CDMX', '03140', 'Cardiólogo especializado en trasplante cardíaco', 1600.00, 26, TRUE, TRUE, 4.9, 234),
(NULL, 'Renata', 'Pacheco', 3, '555-0316', 'Calle Eugenio Sue 1616', 'Ciudad de México', 'CDMX', '03150', 'Especialista en cardiología de la mujer', 1150.00, 13, TRUE, TRUE, 4.5, 89),
(NULL, 'Guillermo', 'Ramírez', 3, '555-0317', 'Av. Tennyson 1717', 'Ciudad de México', 'CDMX', '03160', 'Cardiólogo especializado en deportistas', 1380.00, 19, TRUE, TRUE, 4.8, 171),
(NULL, 'Verónica', 'Estrada', 3, '555-0318', 'Calle Julio Verne 1818', 'Ciudad de México', 'CDMX', '03170', 'Especialista en imagen cardiovascular avanzada', 1420.00, 21, TRUE, TRUE, 4.9, 195),
(NULL, 'Manuel', 'Rojas', 3, '555-0319', 'Av. Edgar Allan Poe 1919', 'Ciudad de México', 'CDMX', '03180', 'Cardiólogo intervencionista pediátrico', 1550.00, 24, TRUE, TRUE, 4.9, 218),
(NULL, 'Andrea', 'Téllez', 3, '555-0320', 'Calle Lord Byron 2020', 'Ciudad de México', 'CDMX', '03190', 'Especialista en cardiología preventiva y lipidología', 1250.00, 17, TRUE, TRUE, 4.7, 138);

-- ===============================================================
-- DERMATOLOGÍA (20 doctores)
-- ===============================================================
INSERT INTO doctors (user_id, first_name, last_name, specialty_id, phone_number, address, city, state, zip_code, bio, consultation_fee, years_experience, is_verified, is_accepting_patients, rating_avg, rating_count) VALUES

-- Dermatología (specialty_id = 4)
(NULL, 'Sebastián', 'Villalobos', 4, '555-0401', 'Av. Roma Norte 1000', 'Ciudad de México', 'CDMX', '04000', 'Dermatólogo especializado en dermatología cosmética', 900.00, 15, TRUE, TRUE, 4.8, 210),
(NULL, 'Valeria', 'Núñez', 4, '555-0402', 'Calle Álvaro Obregón 2000', 'Ciudad de México', 'CDMX', '04010', 'Especialista en dermatología pediátrica', 850.00, 12, TRUE, TRUE, 4.7, 167),
(NULL, 'Leonardo', 'Márquez', 4, '555-0403', 'Av. Condesa 3000', 'Ciudad de México', 'CDMX', '04020', 'Dermatólogo especializado en cáncer de piel', 1100.00, 20, TRUE, TRUE, 4.9, 298),
(NULL, 'Paulina', 'Guerrero', 4, '555-0404', 'Calle Michoacán 4000', 'Ciudad de México', 'CDMX', '04030', 'Especialista en dermatología estética y láser', 950.00, 14, TRUE, TRUE, 4.6, 189),
(NULL, 'Cristóbal', 'Salazar', 4, '555-0405', 'Av. Tamaulipas 5000', 'Ciudad de México', 'CDMX', '04040', 'Dermatólogo especializado en psoriasis y dermatitis', 820.00, 11, TRUE, TRUE, 4.5, 143),
(NULL, 'Emilia', 'Cordero', 4, '555-0406', 'Calle Campeche 6000', 'Ciudad de México', 'CDMX', '04050', 'Especialista en tricología y enfermedades del cabello', 880.00, 13, TRUE, TRUE, 4.7, 176),
(NULL, 'Tomás', 'Blanco', 4, '555-0407', 'Av. Nuevo León 7000', 'Ciudad de México', 'CDMX', '04060', 'Dermatólogo especializado en cirugía dermatológica', 1050.00, 18, TRUE, TRUE, 4.8, 234),
(NULL, 'Rebeca', 'Zamora', 4, '555-0408', 'Calle Sonora 8000', 'Ciudad de México', 'CDMX', '04070', 'Especialista en dermatología geriátrica', 800.00, 10, TRUE, TRUE, 4.4, 125),
(NULL, 'Iván', 'Cervantes', 4, '555-0409', 'Av. Insurgentes Sur 9000', 'Ciudad de México', 'CDMX', '04080', 'Dermatólogo especializado en melanoma', 1150.00, 22, TRUE, TRUE, 4.9, 267),
(NULL, 'Mariana', 'Herrera', 4, '555-0410', 'Calle Orizaba 1010', 'Ciudad de México', 'CDMX', '04090', 'Especialista en dermatología cosmética y antienvejecimiento', 920.00, 16, TRUE, TRUE, 4.6, 198),
(NULL, 'Diego', 'Vargas', 4, '555-0411', 'Av. Yucatán 1111', 'Ciudad de México', 'CDMX', '04100', 'Dermatólogo especializado en acné y rosácea', 780.00, 9, TRUE, TRUE, 4.3, 134),
(NULL, 'Constanza', 'Mendoza', 4, '555-0412', 'Calle Durango 1212', 'Ciudad de México', 'CDMX', '04110', 'Especialista en dermatología quirúrgica', 1000.00, 17, TRUE, TRUE, 4.7, 221),
(NULL, 'Gabriel', 'Jiménez', 4, '555-0413', 'Av. Veracruz 1313', 'Ciudad de México', 'CDMX', '04120', 'Dermatólogo especializado en enfermedades autoinmunes', 980.00, 15, TRUE, TRUE, 4.6, 187),
(NULL, 'Sabrina', 'Delgado', 4, '555-0414', 'Calle Colima 1414', 'Ciudad de México', 'CDMX', '04130', 'Especialista en dermatopatología', 1080.00, 19, TRUE, TRUE, 4.8, 245),
(NULL, 'Nicolás', 'Fernández', 4, '555-0415', 'Av. Oaxaca 1515', 'Ciudad de México', 'CDMX', '04140', 'Dermatólogo especializado en vitiligo', 860.00, 12, TRUE, TRUE, 4.5, 156),
(NULL, 'Luciana', 'Ruiz', 4, '555-0416', 'Calle Tlaxcala 1616', 'Ciudad de México', 'CDMX', '04150', 'Especialista en dermatología oncológica', 1120.00, 21, TRUE, TRUE, 4.9, 289),
(NULL, 'Esteban', 'Morales', 4, '555-0417', 'Av. Puebla 1717', 'Ciudad de México', 'CDMX', '04160', 'Dermatólogo especializado en alergias cutáneas', 840.00, 11, TRUE, TRUE, 4.4, 142),
(NULL, 'Ximena', 'Castro', 4, '555-0418', 'Calle Guadalajara 1818', 'Ciudad de México', 'CDMX', '04170', 'Especialista en medicina estética facial', 960.00, 14, TRUE, TRUE, 4.7, 203),
(NULL, 'Maximiliano', 'Sánchez', 4, '555-0419', 'Av. Mazatlán 1919', 'Ciudad de México', 'CDMX', '04180', 'Dermatólogo especializado en cirugía reconstructiva', 1070.00, 18, TRUE, TRUE, 4.8, 231),
(NULL, 'Paloma', 'Romero', 4, '555-0420', 'Calle Mérida 2020', 'Ciudad de México', 'CDMX', '04190', 'Especialista en dermatología preventiva', 790.00, 8, TRUE, TRUE, 4.2, 119);

-- ===============================================================
-- ENDOCRINOLOGÍA (20 doctores)
-- ===============================================================
INSERT INTO doctors (user_id, first_name, last_name, specialty_id, phone_number, address, city, state, zip_code, bio, consultation_fee, years_experience, is_verified, is_accepting_patients, rating_avg, rating_count) VALUES

-- Endocrinología (specialty_id = 5)
(NULL, 'Ricardo', 'Benítez', 5, '555-0501', 'Av. Santa Fe 1000', 'Ciudad de México', 'CDMX', '05000', 'Endocrinólogo especializado en diabetes', 1000.00, 18, TRUE, TRUE, 4.8, 234),
(NULL, 'Ana', 'Quintero', 5, '555-0502', 'Calle Carlos Lazo 2000', 'Ciudad de México', 'CDMX', '05010', 'Especialista en tiroides y paratiroides', 950.00, 15, TRUE, TRUE, 4.7, 189),
(NULL, 'Pedro', 'Salinas', 5, '555-0503', 'Av. Vasco de Quiroga 3000', 'Ciudad de México', 'CDMX', '05020', 'Endocrinólogo especializado en obesidad', 1100.00, 20, TRUE, TRUE, 4.9, 278),
(NULL, 'Laura', 'Montiel', 5, '555-0504', 'Calle Javier Barros Sierra 4000', 'Ciudad de México', 'CDMX', '05030', 'Especialista en endocrinología reproductiva', 980.00, 16, TRUE, TRUE, 4.6, 167),
(NULL, 'Andrés', 'Villareal', 5, '555-0505', 'Av. Prolongación Paseo de la Reforma 5000', 'Ciudad de México', 'CDMX', '05040', 'Endocrinólogo especializado en metabolismo óseo', 1050.00, 19, TRUE, TRUE, 4.8, 223),
(NULL, 'Karla', 'Medina', 5, '555-0506', 'Calle Guillermo González Camarena 6000', 'Ciudad de México', 'CDMX', '05050', 'Especialista en endocrinología pediátrica', 920.00, 14, TRUE, TRUE, 4.5, 145),
(NULL, 'José', 'Alvarado', 5, '555-0507', 'Av. Constituyentes 7000', 'Ciudad de México', 'CDMX', '05060', 'Endocrinólogo especializado en suprarrenales', 1080.00, 21, TRUE, TRUE, 4.9, 256),
(NULL, 'Cecilia', 'Ramírez', 5, '555-0508', 'Calle Bosque de Duraznos 8000', 'Ciudad de México', 'CDMX', '05070', 'Especialista en diabetes gestacional', 940.00, 13, TRUE, TRUE, 4.6, 156),
(NULL, 'Miguel', 'Torres', 5, '555-0509', 'Av. Paseo de las Palmas 9000', 'Ciudad de México', 'CDMX', '05080', 'Endocrinólogo especializado en hipófisis', 1120.00, 22, TRUE, TRUE, 4.9, 289),
(NULL, 'Verónica', 'Espinoza', 5, '555-0510', 'Calle Monte Líbano 1010', 'Ciudad de México', 'CDMX', '05090', 'Especialista en trastornos hormonales femeninos', 960.00, 17, TRUE, TRUE, 4.7, 198),
(NULL, 'Felipe', 'Guerrero', 5, '555-0511', 'Av. Lomas de Chapultepec 1111', 'Ciudad de México', 'CDMX', '05100', 'Endocrinólogo especializado en andrología', 1000.00, 18, TRUE, TRUE, 4.8, 212),
(NULL, 'Silvia', 'Morales', 5, '555-0512', 'Calle Sierra Madre 1212', 'Ciudad de México', 'CDMX', '05110', 'Especialista en síndrome metabólico', 970.00, 15, TRUE, TRUE, 4.6, 178),
(NULL, 'Raúl', 'Hernández', 5, '555-0513', 'Av. Bosques de las Lomas 1313', 'Ciudad de México', 'CDMX', '05120', 'Endocrinólogo especializado en osteoporosis', 1040.00, 19, TRUE, TRUE, 4.8, 234),
(NULL, 'Claudia', 'Jiménez', 5, '555-0514', 'Calle Palmas 1414', 'Ciudad de México', 'CDMX', '05130', 'Especialista en endocrinología geriátrica', 920.00, 16, TRUE, TRUE, 4.5, 167),
(NULL, 'Eduardo', 'Castillo', 5, '555-0515', 'Av. Tecamachalco 1515', 'Ciudad de México', 'CDMX', '05140', 'Endocrinólogo especializado en crecimiento', 990.00, 20, TRUE, TRUE, 4.7, 201),
(NULL, 'Mayra', 'Delgado', 5, '555-0516', 'Calle Reforma Social 1616', 'Ciudad de México', 'CDMX', '05150', 'Especialista en neuroendocrinología', 1110.00, 23, TRUE, TRUE, 4.9, 267),
(NULL, 'Alejandro', 'Vázquez', 5, '555-0517', 'Av. Fuente de Tritones 1717', 'Ciudad de México', 'CDMX', '05160', 'Endocrinólogo especializado en diabetes tipo 1', 980.00, 17, TRUE, TRUE, 4.6, 189),
(NULL, 'Guadalupe', 'Sánchez', 5, '555-0518', 'Calle Bosque de Radiata 1818', 'Ciudad de México', 'CDMX', '05170', 'Especialista en trastornos de la pubertad', 950.00, 14, TRUE, TRUE, 4.5, 156),
(NULL, 'Roberto', 'Navarro', 5, '555-0519', 'Av. Paseo de la Reforma 1919', 'Ciudad de México', 'CDMX', '05180', 'Endocrinólogo especializado en hirsutismo', 1020.00, 18, TRUE, TRUE, 4.8, 223),
(NULL, 'Martha', 'Rojas', 5, '555-0520', 'Calle Hacienda de las Palmas 2020', 'Ciudad de México', 'CDMX', '05190', 'Especialista en endocrinología nutricional', 940.00, 12, TRUE, TRUE, 4.4, 134),

-- ===============================================================
-- GINECOLOGÍA (20 doctores)
-- ===============================================================
-- Ginecología (specialty_id = 15)
(NULL, 'María', 'Fernández', 15, '555-1501', 'Av. Revolución 1000', 'Ciudad de México', 'CDMX', '15000', 'Ginecóloga especializada en obstetricia', 800.00, 16, TRUE, TRUE, 4.8, 245),
(NULL, 'Luis', 'Medrano', 15, '555-1502', 'Calle San Ángel 2000', 'Ciudad de México', 'CDMX', '15010', 'Especialista en ginecología oncológica', 1200.00, 22, TRUE, TRUE, 4.9, 312),
(NULL, 'Carmen', 'Valdez', 15, '555-1503', 'Av. Altavista 3000', 'Ciudad de México', 'CDMX', '15020', 'Ginecóloga especializada en endoscopia ginecológica', 950.00, 18, TRUE, TRUE, 4.7, 198),
(NULL, 'Jorge', 'Sandoval', 15, '555-1504', 'Calle La Paz 4000', 'Ciudad de México', 'CDMX', '15030', 'Especialista en medicina reproductiva', 1100.00, 20, TRUE, TRUE, 4.8, 267),
(NULL, 'Esperanza', 'Cruz', 15, '555-1505', 'Av. Insurgentes Sur 5000', 'Ciudad de México', 'CDMX', '15040', 'Ginecóloga especializada en climaterio', 750.00, 14, TRUE, TRUE, 4.6, 178),
(NULL, 'Francisco', 'Moreno', 15, '555-1506', 'Calle Dr. Gálvez 6000', 'Ciudad de México', 'CDMX', '15050', 'Especialista en ginecología estética', 1000.00, 15, TRUE, TRUE, 4.5, 156),
(NULL, 'Rosa', 'Herrera', 15, '555-1507', 'Av. Río Magdalena 7000', 'Ciudad de México', 'CDMX', '15060', 'Ginecóloga especializada en adolescentes', 700.00, 12, TRUE, TRUE, 4.7, 189),
(NULL, 'Antonio', 'Aguilar', 15, '555-1508', 'Calle Frontera 8000', 'Ciudad de México', 'CDMX', '15070', 'Especialista en uroginecología', 900.00, 19, TRUE, TRUE, 4.8, 234),
(NULL, 'Elena', 'Contreras', 15, '555-1509', 'Av. Barranca del Muerto 9000', 'Ciudad de México', 'CDMX', '15080', 'Ginecóloga especializada en patología mamaria', 850.00, 17, TRUE, TRUE, 4.6, 167),
(NULL, 'Ricardo', 'Vega', 15, '555-1510', 'Calle Camino al Desierto de los Leones 1010', 'Ciudad de México', 'CDMX', '15090', 'Especialista en cirugía ginecológica mínimamente invasiva', 1050.00, 21, TRUE, TRUE, 4.9, 289),
(NULL, 'Dolores', 'Ramírez', 15, '555-1511', 'Av. Desierto de los Leones 1111', 'Ciudad de México', 'CDMX', '15100', 'Ginecóloga especializada en fertilidad', 1150.00, 23, TRUE, TRUE, 4.9, 334),
(NULL, 'Manuel', 'Torres', 15, '555-1512', 'Calle Periférico Sur 1212', 'Ciudad de México', 'CDMX', '15110', 'Especialista en ginecología infantil', 800.00, 16, TRUE, TRUE, 4.5, 145),
(NULL, 'Gloria', 'Mendoza', 15, '555-1513', 'Av. San Jerónimo 1313', 'Ciudad de México', 'CDMX', '15120', 'Ginecóloga especializada en enfermedades de transmisión sexual', 750.00, 13, TRUE, TRUE, 4.6, 156),
(NULL, 'Héctor', 'Ruiz', 15, '555-1514', 'Calle Arenal 1414', 'Ciudad de México', 'CDMX', '15130', 'Especialista en medicina perinatal', 1000.00, 20, TRUE, TRUE, 4.8, 245),
(NULL, 'Leticia', 'Jiménez', 15, '555-1515', 'Av. Contreras 1515', 'Ciudad de México', 'CDMX', '15140', 'Ginecóloga especializada en planificación familiar', 650.00, 11, TRUE, TRUE, 4.4, 123),
(NULL, 'Pablo', 'Guerrero', 15, '555-1516', 'Calle Tizapán 1616', 'Ciudad de México', 'CDMX', '15150', 'Especialista en ginecología psicosomática', 900.00, 18, TRUE, TRUE, 4.7, 201),
(NULL, 'Margarita', 'Silva', 15, '555-1517', 'Av. Toluca 1717', 'Ciudad de México', 'CDMX', '15160', 'Ginecóloga especializada en dolor pélvico', 820.00, 15, TRUE, TRUE, 4.5, 167),
(NULL, 'Javier', 'Castillo', 15, '555-1518', 'Calle Progreso Tizapán 1818', 'Ciudad de México', 'CDMX', '15170', 'Especialista en mastología', 950.00, 19, TRUE, TRUE, 4.8, 223),
(NULL, 'Amparo', 'Morales', 15, '555-1519', 'Av. Progreso 1919', 'Ciudad de México', 'CDMX', '15180', 'Ginecóloga especializada en menopausia', 780.00, 17, TRUE, TRUE, 4.6, 189),
(NULL, 'Sergio', 'Delgado', 15, '555-1520', 'Calle Belisario Domínguez 2020', 'Ciudad de México', 'CDMX', '15190', 'Especialista en ginecología preventiva', 700.00, 14, TRUE, TRUE, 4.5, 145),

-- ===============================================================
-- PEDIATRÍA (20 doctores)
-- ===============================================================
INSERT INTO doctors (user_id, first_name, last_name, specialty_id, phone_number, address, city, state, zip_code, bio, consultation_fee, years_experience, is_verified, is_accepting_patients, rating_avg, rating_count) VALUES

-- Pediatría (specialty_id = 14)
(NULL, 'Carmen', 'Ortega', 14, '555-1401', 'Av. División del Norte 1000', 'Ciudad de México', 'CDMX', '14000', 'Pediatra especializada en neonatología', 750.00, 18, TRUE, TRUE, 4.9, 245),
(NULL, 'Enrique', 'Vidal', 14, '555-1402', 'Calle Coyoacán 2000', 'Ciudad de México', 'CDMX', '14010', 'Especialista en pediatría general y vacunación', 650.00, 12, TRUE, TRUE, 4.7, 189),
(NULL, 'Mónica', 'Espinoza', 14, '555-1403', 'Av. Universidad 3000', 'Ciudad de México', 'CDMX', '14020', 'Pediatra especializada en enfermedades respiratorias', 700.00, 15, TRUE, TRUE, 4.8, 223),
(NULL, 'Rafael', 'Cabrera', 14, '555-1404', 'Calle Francisco Sosa 4000', 'Ciudad de México', 'CDMX', '14030', 'Especialista en pediatría del desarrollo', 720.00, 16, TRUE, TRUE, 4.6, 167),
(NULL, 'Adriana', 'Figueroa', 14, '555-1405', 'Av. Miguel Ángel de Quevedo 5000', 'Ciudad de México', 'CDMX', '14040', 'Pediatra especializada en gastroenterología pediátrica', 780.00, 20, TRUE, TRUE, 4.8, 234),
(NULL, 'Gustavo', 'Montes', 14, '555-1406', 'Calle Tres Cruces 6000', 'Ciudad de México', 'CDMX', '14050', 'Especialista en cardiología pediátrica', 850.00, 22, TRUE, TRUE, 4.9, 278),
(NULL, 'Leticia', 'Peña', 14, '555-1407', 'Av. Pacífico 7000', 'Ciudad de México', 'CDMX', '14060', 'Pediatra especializada en neurología pediátrica', 800.00, 19, TRUE, TRUE, 4.7, 201),
(NULL, 'Rodrigo', 'Silva', 14, '555-1408', 'Calle Allende 8000', 'Ciudad de México', 'CDMX', '14070', 'Especialista en infectología pediátrica', 730.00, 14, TRUE, TRUE, 4.6, 178),
(NULL, 'Fabiola', 'Guerrero', 14, '555-1409', 'Av. La Paz 9000', 'Ciudad de México', 'CDMX', '14080', 'Pediatra especializada en endocrinología pediátrica', 770.00, 17, TRUE, TRUE, 4.8, 212),
(NULL, 'Alexis', 'Domínguez', 14, '555-1410', 'Calle Fernández Leal 1010', 'Ciudad de México', 'CDMX', '14090', 'Especialista en hematología pediátrica', 820.00, 21, TRUE, TRUE, 4.9, 256),
(NULL, 'Daniela', 'Muñoz', 14, '555-1411', 'Av. Insurgentes Sur 1111', 'Ciudad de México', 'CDMX', '14100', 'Pediatra especializada en medicina del adolescente', 680.00, 11, TRUE, TRUE, 4.5, 145),
(NULL, 'Mauricio', 'Herrera', 14, '555-1412', 'Calle Londres 1212', 'Ciudad de México', 'CDMX', '14110', 'Especialista en neumología pediátrica', 740.00, 15, TRUE, TRUE, 4.7, 198),
(NULL, 'Rocío', 'Mendoza', 14, '555-1413', 'Av. Río Churubusco 1313', 'Ciudad de México', 'CDMX', '14120', 'Pediatra especializada en dermatología pediátrica', 710.00, 13, TRUE, TRUE, 4.6, 164),
(NULL, 'Emilio', 'Contreras', 14, '555-1414', 'Calle Del Carmen 1414', 'Ciudad de México', 'CDMX', '14130', 'Especialista en ortopedia pediátrica', 790.00, 18, TRUE, TRUE, 4.8, 227),
(NULL, 'Patricia', 'Restrepo', 14, '555-1415', 'Av. Calzada de Tlalpan 1515', 'Ciudad de México', 'CDMX', '14140', 'Pediatra especializada en urgencias pediátricas', 760.00, 16, TRUE, TRUE, 4.7, 185),
(NULL, 'Arturo', 'Valencia', 14, '555-1416', 'Calle Hidalgo 1616', 'Ciudad de México', 'CDMX', '14150', 'Especialista en reumatología pediátrica', 830.00, 20, TRUE, TRUE, 4.9, 249),
(NULL, 'Cynthia', 'Aguilar', 14, '555-1417', 'Av. Aztecas 1717', 'Ciudad de México', 'CDMX', '14160', 'Pediatra especializada en nutrición pediátrica', 690.00, 12, TRUE, TRUE, 4.5, 156),
(NULL, 'Fernando', 'Vargas', 14, '555-1418', 'Calle Madero 1818', 'Ciudad de México', 'CDMX', '14170', 'Especialista en cirugía pediátrica', 880.00, 23, TRUE, TRUE, 4.9, 289),
(NULL, 'Miriam', 'Soto', 14, '555-1419', 'Av. Revolución 1919', 'Ciudad de México', 'CDMX', '14180', 'Pediatra especializada en psiquiatría infantil', 750.00, 17, TRUE, TRUE, 4.8, 204),
(NULL, 'Hugo', 'Ramírez', 14, '555-1420', 'Calle 20 de Noviembre 2020', 'Ciudad de México', 'CDMX', '14190', 'Especialista en oncología pediátrica', 900.00, 25, TRUE, TRUE, 4.9, 312),

-- ===============================================================
-- NEUROLOGÍA (20 doctores)
-- ===============================================================
-- Neurología (specialty_id = 7)
(NULL, 'Alberto', 'Vásquez', 7, '555-0701', 'Av. Patriotismo 1000', 'Ciudad de México', 'CDMX', '07000', 'Neurólogo especializado en epilepsia', 1300.00, 20, TRUE, TRUE, 4.9, 278),
(NULL, 'Claudia', 'Miranda', 7, '555-0702', 'Calle Benjamín Franklin 2000', 'Ciudad de México', 'CDMX', '07010', 'Especialista en esclerosis múltiple', 1200.00, 18, TRUE, TRUE, 4.8, 234),
(NULL, 'Rafael', 'Solís', 7, '555-0703', 'Av. Insurgentes Sur 3000', 'Ciudad de México', 'CDMX', '07020', 'Neurólogo especializado en Parkinson', 1400.00, 25, TRUE, TRUE, 4.9, 345),
(NULL, 'Mónica', 'Jiménez', 7, '555-0704', 'Calle Eje Central 4000', 'Ciudad de México', 'CDMX', '07030', 'Especialista en neurología pediátrica', 1150.00, 16, TRUE, TRUE, 4.7, 189),
(NULL, 'Gonzalo', 'Herrera', 7, '555-0705', 'Av. Chapultepec 5000', 'Ciudad de México', 'CDMX', '07040', 'Neurólogo especializado en cefaleas', 1000.00, 14, TRUE, TRUE, 4.6, 167),
(NULL, 'Patricia', 'Morales', 7, '555-0706', 'Calle Revolución 6000', 'Ciudad de México', 'CDMX', '07050', 'Especialista en neurofisiología clínica', 1250.00, 19, TRUE, TRUE, 4.8, 256),
(NULL, 'Andrés', 'Castillo', 7, '555-0707', 'Av. Universidad 7000', 'Ciudad de México', 'CDMX', '07060', 'Neurólogo especializado en demencias', 1350.00, 22, TRUE, TRUE, 4.9, 312),
(NULL, 'Isabella', 'Guerrero', 7, '555-0708', 'Calle Cuauhtémoc 8000', 'Ciudad de México', 'CDMX', '07070', 'Especialista en neurología vascular', 1180.00, 17, TRUE, TRUE, 4.7, 201),
(NULL, 'Fernando', 'Delgado', 7, '555-0709', 'Av. Reforma 9000', 'Ciudad de México', 'CDMX', '07080', 'Neurólogo especializado en neuromuscular', 1220.00, 18, TRUE, TRUE, 4.8, 223),
(NULL, 'Carmen', 'Ruiz', 7, '555-0710', 'Calle Juárez 1010', 'Ciudad de México', 'CDMX', '07090', 'Especialista en neurología del sueño', 1100.00, 15, TRUE, TRUE, 4.6, 178),
(NULL, 'Miguel', 'Torres', 7, '555-0711', 'Av. Madero 1111', 'Ciudad de México', 'CDMX', '07100', 'Neurólogo especializado en neurocirugía funcional', 1500.00, 26, TRUE, TRUE, 4.9, 389),
(NULL, 'Rosa', 'Navarro', 7, '555-0712', 'Calle Allende 1212', 'Ciudad de México', 'CDMX', '07110', 'Especialista en neuropediatría', 1080.00, 14, TRUE, TRUE, 4.5, 156),
(NULL, 'Arturo', 'Vega', 7, '555-0713', 'Av. Morelos 1313', 'Ciudad de México', 'CDMX', '07120', 'Neurólogo especializado en neurogenética', 1320.00, 21, TRUE, TRUE, 4.8, 267),
(NULL, 'Elena', 'Mendoza', 7, '555-0714', 'Calle Hidalgo 1414', 'Ciudad de México', 'CDMX', '07130', 'Especialista en neurología geriátrica', 1150.00, 19, TRUE, TRUE, 4.7, 212),
(NULL, 'Roberto', 'Sánchez', 7, '555-0715', 'Av. Independencia 1515', 'Ciudad de México', 'CDMX', '07140', 'Neurólogo especializado en epilepsia refractaria', 1450.00, 24, TRUE, TRUE, 4.9, 334),
(NULL, 'Silvia', 'Aguilar', 7, '555-0716', 'Calle 5 de Mayo 1616', 'Ciudad de México', 'CDMX', '07150', 'Especialista en neurooncología', 1380.00, 22, TRUE, TRUE, 4.8, 289),
(NULL, 'Luis', 'Contreras', 7, '555-0717', 'Av. 16 de Septiembre 1717', 'Ciudad de México', 'CDMX', '07160', 'Neurólogo especializado en esclerosis lateral amiotrófica', 1400.00, 23, TRUE, TRUE, 4.9, 298),
(NULL, 'Mariana', 'Cabrera', 7, '555-0718', 'Calle Tacuba 1818', 'Ciudad de México', 'CDMX', '07170', 'Especialista en neuroinmunología', 1280.00, 20, TRUE, TRUE, 4.7, 245),
(NULL, 'Emilio', 'Ramos', 7, '555-0719', 'Av. Balderas 1919', 'Ciudad de México', 'CDMX', '07180', 'Neurólogo especializado en neurología del deporte', 1200.00, 16, TRUE, TRUE, 4.6, 189),
(NULL, 'Guadalupe', 'Silva', 7, '555-0720', 'Calle Regina 2020', 'Ciudad de México', 'CDMX', '07190', 'Especialista en trastornos del movimiento', 1350.00, 21, TRUE, TRUE, 4.8, 267),

-- ===============================================================
-- PSIQUIATRÍA (20 doctores)
-- ===============================================================
-- Psiquiatría (specialty_id = 8)
(NULL, 'Diana', 'Flores', 8, '555-0801', 'Av. Condesa 1000', 'Ciudad de México', 'CDMX', '08000', 'Psiquiatra especializada en depresión', 900.00, 15, TRUE, TRUE, 4.8, 234),
(NULL, 'Jorge', 'Medina', 8, '555-0802', 'Calle Roma Norte 2000', 'Ciudad de México', 'CDMX', '08010', 'Especialista en trastorno bipolar', 950.00, 18, TRUE, TRUE, 4.7, 198),
(NULL, 'Alejandra', 'Cruz', 8, '555-0803', 'Av. Álvaro Obregón 3000', 'Ciudad de México', 'CDMX', '08020', 'Psiquiatra especializada en ansiedad', 850.00, 12, TRUE, TRUE, 4.6, 167),
(NULL, 'Carlos', 'Herrera', 8, '555-0804', 'Calle Orizaba 4000', 'Ciudad de México', 'CDMX', '08030', 'Especialista en psiquiatría infantil', 1000.00, 20, TRUE, TRUE, 4.9, 278),
(NULL, 'Beatriz', 'Morales', 8, '555-0805', 'Av. Insurgentes Sur 5000', 'Ciudad de México', 'CDMX', '08040', 'Psiquiatra especializada en esquizofrenia', 1100.00, 22, TRUE, TRUE, 4.8, 256),
(NULL, 'Manuel', 'Guerrero', 8, '555-0806', 'Calle Michoacán 6000', 'Ciudad de México', 'CDMX', '08050', 'Especialista en trastornos de la alimentación', 980.00, 16, TRUE, TRUE, 4.7, 189),
(NULL, 'Lucía', 'Jiménez', 8, '555-0807', 'Av. Tamaulipas 7000', 'Ciudad de México', 'CDMX', '08060', 'Psiquiatra especializada en adicciones', 920.00, 14, TRUE, TRUE, 4.5, 145),
(NULL, 'Ricardo', 'Delgado', 8, '555-0808', 'Calle Campeche 8000', 'Ciudad de México', 'CDMX', '08070', 'Especialista en trastorno de personalidad', 1050.00, 19, TRUE, TRUE, 4.8, 223),
(NULL, 'Ana', 'Torres', 8, '555-0809', 'Av. Nuevo León 9000', 'Ciudad de México', 'CDMX', '08080', 'Psiquiatra especializada en psicosis', 1080.00, 21, TRUE, TRUE, 4.9, 267),
(NULL, 'Francisco', 'Ruiz', 8, '555-0810', 'Calle Sonora 1010', 'Ciudad de México', 'CDMX', '08090', 'Especialista en psiquiatría geriátrica', 940.00, 17, TRUE, TRUE, 4.6, 178),
(NULL, 'Paola', 'Mendoza', 8, '555-0811', 'Av. Yucatán 1111', 'Ciudad de México', 'CDMX', '08100', 'Psiquiatra especializada en trastornos del estado de ánimo', 890.00, 13, TRUE, TRUE, 4.5, 156),
(NULL, 'Sergio', 'Vázquez', 8, '555-0812', 'Calle Durango 1212', 'Ciudad de México', 'CDMX', '08110', 'Especialista en neuropsiquiatría', 1150.00, 23, TRUE, TRUE, 4.9, 289),
(NULL, 'Mónica', 'Castillo', 8, '555-0813', 'Av. Veracruz 1313', 'Ciudad de México', 'CDMX', '08120', 'Psiquiatra especializada en trauma y TEPT', 980.00, 18, TRUE, TRUE, 4.7, 201),
(NULL, 'Javier', 'Sánchez', 8, '555-0814', 'Calle Colima 1414', 'Ciudad de México', 'CDMX', '08130', 'Especialista en psiquiatría forense', 1200.00, 25, TRUE, TRUE, 4.8, 312),
(NULL, 'Isabella', 'Aguilar', 8, '555-0815', 'Av. Oaxaca 1515', 'Ciudad de México', 'CDMX', '08140', 'Psiquiatra especializada en trastornos del sueño', 920.00, 15, TRUE, TRUE, 4.6, 167),
(NULL, 'Eduardo', 'Navarro', 8, '555-0816', 'Calle Tlaxcala 1616', 'Ciudad de México', 'CDMX', '08150', 'Especialista en psiquiatría de enlace', 960.00, 16, TRUE, TRUE, 4.7, 189),
(NULL, 'Carmen', 'Silva', 8, '555-0817', 'Av. Puebla 1717', 'Ciudad de México', 'CDMX', '08160', 'Psiquiatra especializada en trastorno obsesivo compulsivo', 1000.00, 19, TRUE, TRUE, 4.8, 234),
(NULL, 'Alejandro', 'Ramos', 8, '555-0818', 'Calle Guadalajara 1818', 'Ciudad de México', 'CDMX', '08170', 'Especialista en psiquiatría comunitaria', 870.00, 12, TRUE, TRUE, 4.4, 134),
(NULL, 'Valeria', 'Moreno', 8, '555-0819', 'Av. Mazatlán 1919', 'Ciudad de México', 'CDMX', '08180', 'Psiquiatra especializada en psicofarmacología', 1120.00, 21, TRUE, TRUE, 4.9, 256),
(NULL, 'Gabriel', 'Contreras', 8, '555-0820', 'Calle Mérida 2020', 'Ciudad de México', 'CDMX', '08190', 'Especialista en psiquiatría del adolescente', 950.00, 17, TRUE, TRUE, 4.6, 178),

-- ===============================================================
-- ORTOPEDIA Y TRAUMATOLOGÍA (20 doctores)
-- ===============================================================
-- Ortopedia y Traumatología (specialty_id = 13)
(NULL, 'Leonardo', 'Vargas', 13, '555-1301', 'Av. Polanco 1000', 'Ciudad de México', 'CDMX', '13000', 'Ortopedista especializado en cirugía de rodilla', 1200.00, 20, TRUE, TRUE, 4.9, 298),
(NULL, 'Sofía', 'Herrera', 13, '555-1302', 'Calle Masaryk 2000', 'Ciudad de México', 'CDMX', '13010', 'Especialista en cirugía de columna', 1350.00, 22, TRUE, TRUE, 4.8, 267),
(NULL, 'Marcos', 'Jiménez', 13, '555-1303', 'Av. Presidente Masaryk 3000', 'Ciudad de México', 'CDMX', '13020', 'Ortopedista especializado en traumatología deportiva', 1400.00, 25, TRUE, TRUE, 4.9, 356),
(NULL, 'Camila', 'Morales', 13, '555-1304', 'Calle Campos Elíseos 4000', 'Ciudad de México', 'CDMX', '13030', 'Especialista en cirugía de hombro', 1150.00, 18, TRUE, TRUE, 4.7, 234),
(NULL, 'Rodrigo', 'Delgado', 13, '555-1305', 'Av. Ejército Nacional 5000', 'Ciudad de México', 'CDMX', '13040', 'Ortopedista especializado en cirugía de cadera', 1300.00, 21, TRUE, TRUE, 4.8, 289),
(NULL, 'Natalia', 'Castro', 13, '555-1306', 'Calle Homero 6000', 'Ciudad de México', 'CDMX', '13050', 'Especialista en ortopedia pediátrica', 1100.00, 16, TRUE, TRUE, 4.6, 189),
(NULL, 'Emilio', 'Guerrero', 13, '555-1307', 'Av. Horacio 7000', 'Ciudad de México', 'CDMX', '13060', 'Ortopedista especializado en cirugía de mano', 1250.00, 19, TRUE, TRUE, 4.8, 256),
(NULL, 'Daniela', 'Ruiz', 13, '555-1308', 'Calle Virgilio 8000', 'Ciudad de México', 'CDMX', '13070', 'Especialista en cirugía de pie y tobillo', 1180.00, 17, TRUE, TRUE, 4.7, 212),
(NULL, 'Gustavo', 'Mendoza', 13, '555-1309', 'Av. Cervantes 9000', 'Ciudad de México', 'CDMX', '13080', 'Ortopedista especializado en artroscopia', 1220.00, 20, TRUE, TRUE, 4.8, 245),
(NULL, 'Verónica', 'Torres', 13, '555-1310', 'Calle Molière 1010', 'Ciudad de México', 'CDMX', '13090', 'Especialista en reemplazo articular', 1380.00, 23, TRUE, TRUE, 4.9, 312),
(NULL, 'Arturo', 'Sánchez', 13, '555-1311', 'Av. Newton 1111', 'Ciudad de México', 'CDMX', '13100', 'Ortopedista especializado en oncología ortopédica', 1500.00, 26, TRUE, TRUE, 4.9, 389),
(NULL, 'Paola', 'Aguilar', 13, '555-1312', 'Calle Arquímedes 1212', 'Ciudad de México', 'CDMX', '13110', 'Especialista en cirugía reconstructiva', 1320.00, 21, TRUE, TRUE, 4.8, 278),
(NULL, 'Santiago', 'Navarro', 13, '555-1313', 'Av. Galileo 1313', 'Ciudad de México', 'CDMX', '13120', 'Ortopedista especializado en microcirugía', 1450.00, 24, TRUE, TRUE, 4.9, 334),
(NULL, 'Mariana', 'Silva', 13, '555-1314', 'Calle Kepler 1414', 'Ciudad de México', 'CDMX', '13130', 'Especialista en ortopedia geriátrica', 1100.00, 18, TRUE, TRUE, 4.6, 198),
(NULL, 'Diego', 'Contreras', 13, '555-1315', 'Av. Copérnico 1515', 'Ciudad de México', 'CDMX', '13140', 'Ortopedista especializado en fracturas complejas', 1280.00, 22, TRUE, TRUE, 4.8, 267),
(NULL, 'Fernanda', 'Vázquez', 13, '555-1316', 'Calle Eugenio Sue 1616', 'Ciudad de México', 'CDMX', '13150', 'Especialista en cirugía de codo', 1150.00, 17, TRUE, TRUE, 4.7, 201),
(NULL, 'Sebastián', 'Ramírez', 13, '555-1317', 'Av. Tennyson 1717', 'Ciudad de México', 'CDMX', '13160', 'Ortopedista especializado en medicina deportiva', 1200.00, 19, TRUE, TRUE, 4.8, 234),
(NULL, 'Adriana', 'Moreno', 13, '555-1318', 'Calle Julio Verne 1818', 'Ciudad de México', 'CDMX', '13170', 'Especialista en cirugía mínimamente invasiva', 1350.00, 20, TRUE, TRUE, 4.9, 289),
(NULL, 'Iván', 'Cabrera', 13, '555-1319', 'Av. Edgar Allan Poe 1919', 'Ciudad de México', 'CDMX', '13180', 'Ortopedista especializado en deformidades espinales', 1400.00, 23, TRUE, TRUE, 4.9, 312),
(NULL, 'Rebeca', 'Peña', 13, '555-1320', 'Calle Lord Byron 2020', 'Ciudad de México', 'CDMX', '13190', 'Especialista en biomecánica ortopédica', 1180.00, 16, TRUE, TRUE, 4.7, 189);

-- ===============================================================
-- ACTUALIZAR CONTADORES
-- ===============================================================
ALTER TABLE doctors AUTO_INCREMENT = 1000;

-- ===============================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ===============================================================
SELECT 
    s.name as specialty,
    COUNT(d.id) as doctor_count,
    AVG(d.consultation_fee) as avg_fee,
    AVG(d.rating_avg) as avg_rating
FROM specialties s
LEFT JOIN doctors d ON s.id = d.specialty_id
WHERE d.is_verified = TRUE
GROUP BY s.id, s.name
ORDER BY doctor_count DESC;
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, StarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Toast } from '../components/Toast';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  price: string;
  image: string;
  nextAvailable: string;
  location?: string;
}

interface SearchFilters {
  specialty: string;
  location: string;
  rating: number;
  priceRange: number;
  availability: string;
}

const specialties = [
  'Cardiología',
  'Dermatología', 
  'Pediatría',
  'Neurología',
  'Ginecología',
  'Traumatología',
  'Oftalmología',
  'Psiquiatría'
];

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dra. María González',
    specialty: 'Cardiología',
    rating: 4.9,
    reviews: 124,
    experience: '15 años',
    price: '$800',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    nextAvailable: 'Hoy, 3:00 PM',
    location: 'Polanco, CDMX',
  },
  {
    id: 2,
    name: 'Dr. Carlos Rodríguez',
    specialty: 'Pediatría',
    rating: 4.8,
    reviews: 98,
    experience: '12 años',
    price: '$600',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    nextAvailable: 'Mañana, 10:00 AM',
    location: 'Roma Norte, CDMX',
  },
  {
    id: 3,
    name: 'Dra. Ana Martínez',
    specialty: 'Dermatología',
    rating: 5.0,
    reviews: 156,
    experience: '20 años',
    price: '$900',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    nextAvailable: 'Hoy, 5:30 PM',
    location: 'Condesa, CDMX',
  },
  {
    id: 4,
    name: 'Dr. Luis Fernández',
    specialty: 'Neurología',
    rating: 4.7,
    reviews: 89,
    experience: '18 años',
    price: '$1200',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    nextAvailable: 'Mañana, 2:00 PM',
    location: 'Santa Fe, CDMX',
  },
  {
    id: 5,
    name: 'Dra. Carmen Silva',
    specialty: 'Ginecología',
    rating: 4.8,
    reviews: 142,
    experience: '14 años',
    price: '$700',
    image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop',
    nextAvailable: 'Hoy, 4:30 PM',
    location: 'Del Valle, CDMX',
  },
  {
    id: 6,
    name: 'Dr. Roberto Mendoza',
    specialty: 'Traumatología',
    rating: 4.6,
    reviews: 73,
    experience: '16 años',
    price: '$850',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    nextAvailable: 'Mañana, 11:30 AM',
    location: 'Doctores, CDMX',
  }
];

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: '',
    location: '',
    rating: 0,
    priceRange: 2000,
    availability: ''
  });
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockDoctors);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ show: true, message, type });
  };

  // Get URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const specialtyParam = urlParams.get('specialty');
    const queryParam = urlParams.get('q');
    const locationParam = urlParams.get('location');

    if (specialtyParam) {
      setFilters(prev => ({ ...prev, specialty: specialtyParam }));
    }
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    if (locationParam) {
      setLocationQuery(locationParam);
    }
  }, []);

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = [...mockDoctors];

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location search
    if (locationQuery) {
      filtered = filtered.filter(doctor =>
        doctor.location?.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    // Specialty filter
    if (filters.specialty) {
      filtered = filtered.filter(doctor =>
        doctor.specialty === filters.specialty
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(doctor => doctor.rating >= filters.rating);
    }

    // Price filter
    const priceValue = parseInt(filters.priceRange.toString());
    filtered = filtered.filter(doctor => {
      const doctorPrice = parseInt(doctor.price.replace('$', ''));
      return doctorPrice <= priceValue;
    });

    setFilteredDoctors(filtered);
  }, [searchQuery, locationQuery, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Se encontraron ${filteredDoctors.length} doctores`, 'success');
    }, 800);
  };

  const handleBookAppointment = (doctorId: number) => {
    const doctor = filteredDoctors.find(d => d.id === doctorId);
    showToast(`Agendando cita con ${doctor?.name}`, 'success');
    
    // In a real app, you would navigate here
    setTimeout(() => {
      showToast('Redirigiendo a formulario de cita...', 'info');
      // window.location.href = `/appointment?doctorId=${doctorId}`;
    }, 1500);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buscar Doctores</h1>
              <p className="text-gray-600">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor encontrado' : 'doctores encontrados'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por especialidad o nombre del doctor"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ciudad o zona"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.specialty}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                >
                  <option value="">Todas las especialidades</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación mínima
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                >
                  <option value="0">Cualquier calificación</option>
                  <option value="4.5">4.5+ estrellas</option>
                  <option value="4.0">4.0+ estrellas</option>
                  <option value="3.5">3.5+ estrellas</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio máximo: ${filters.priceRange}
                </label>
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="100"
                  className="w-full"
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: parseInt(e.target.value) }))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$300</span>
                  <span>$2000</span>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    specialty: '',
                    location: '',
                    rating: 0,
                    priceRange: 2000,
                    availability: ''
                  });
                  setSearchQuery('');
                  setLocationQuery('');
                }}
                className="w-full px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron doctores
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar tus criterios de búsqueda
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                            <p className="text-indigo-600 font-medium">{doctor.specialty}</p>
                            
                            <div className="flex items-center mt-2">
                              <div className="flex items-center">
                                {renderStars(doctor.rating)}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                {doctor.rating} ({doctor.reviews} reseñas)
                              </span>
                            </div>
                            
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>{doctor.experience} de experiencia</p>
                              {doctor.location && (
                                <p className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1" />
                                  {doctor.location}
                                </p>
                              )}
                              <p className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Próxima cita: {doctor.nextAvailable}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right mt-4 md:mt-0">
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              {doctor.price}
                            </div>
                            <div className="space-y-2">
                              <button 
                                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                onClick={() => handleBookAppointment(doctor.id)}
                              >
                                Agendar cita
                              </button>
                              <button className="w-full md:w-auto px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors md:ml-2">
                                Ver perfil
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Search;
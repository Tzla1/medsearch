import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  StarIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { DoctorFormModal } from '@components/modals/DoctorFormModal';
import { SpecialtyFormModal } from '@components/modals/SpecialtyFormModal';
import { AppointmentModal } from '@components/modals/AppointmentModal';
import toast from 'react-hot-toast';

interface ManagementDashboardProps {
  activeTab: 'doctors' | 'specialties' | 'appointments' | 'reviews';
  onTabChange: (tab: 'doctors' | 'specialties' | 'appointments' | 'reviews') => void;
}

export const AdminManagementDashboard: React.FC<ManagementDashboardProps> = ({
  activeTab,
  onTabChange
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Modal states
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      let endpoint = '';
      let params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      switch (activeTab) {
        case 'doctors':
          // Para el panel admin, necesitamos ver todos los doctores independientemente del estado
          const doctorParams = new URLSearchParams(params);
          // Si no se ha especificado un status, eliminar el filtro por defecto para ver todos
          if (!filters.status) {
            doctorParams.delete('status');
            // Agregar parámetro especial para obtener todos los estados
            doctorParams.set('includeAllStatus', 'true');
          }
          endpoint = `/doctors?${doctorParams}`;
          break;
        case 'specialties':
          endpoint = `/specialties?${params}`;
          break;
        case 'appointments':
          endpoint = `/appointments?${params}`;
          break;
        case 'reviews':
          endpoint = `/reviews?${params}`;
          break;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result[activeTab] || result.doctors || result.specialties || result.appointments || result.reviews || []);
        setPagination(result.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        toast.error('Error cargando datos');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Elemento eliminado exitosamente');
        fetchData();
      } else {
        toast.error('Error al eliminar elemento');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar elemento');
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    
    switch (activeTab) {
      case 'doctors':
        setIsDoctorModalOpen(true);
        break;
      case 'specialties':
        setIsSpecialtyModalOpen(true);
        break;
      case 'appointments':
        setIsAppointmentModalOpen(true);
        break;
    }
  };

  const closeModals = () => {
    setIsDoctorModalOpen(false);
    setIsSpecialtyModalOpen(false);
    setIsAppointmentModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      verified: 'bg-green-100 text-green-800',
      pending_verification: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
      completed: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      flagged: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderDoctorsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doctor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Especialidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Calificación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarifa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((doctor) => (
            <tr key={doctor._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img 
                    className="h-10 w-10 rounded-full object-cover" 
                    src={doctor.userId?.profileImageUrl || '/api/placeholder/40/40'} 
                    alt="" 
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{doctor.userId?.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {doctor.specialtyIds?.[0]?.name || 'No especificada'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(doctor.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-900">
                    {doctor.ratings?.average?.toFixed(1) || '0.0'}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({doctor.ratings?.count || 0})
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${doctor.consultationFee?.toLocaleString() || '0'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(doctor)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSpecialtiesTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Especialidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doctores
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prioridad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((specialty) => (
            <tr key={specialty._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{specialty.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{specialty.name}</div>
                    <div className="text-sm text-gray-500">{specialty.nameEn}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {specialty.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {specialty.statistics?.totalDoctors || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {specialty.priority}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(specialty.isActive ? 'active' : 'inactive')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(specialty)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(specialty._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAppointmentsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doctor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((appointment) => (
            <tr key={appointment._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {appointment.customerId?.userId?.firstName} {appointment.customerId?.userId?.lastName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(appointment.scheduledDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {appointment.appointmentType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(appointment.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(appointment)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'doctors':
        return renderDoctorsTable();
      case 'specialties':
        return renderSpecialtiesTable();
      case 'appointments':
        return renderAppointmentsTable();
      default:
        return <div>Selecciona una pestaña</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'doctors', label: 'Doctores', icon: UserGroupIcon },
            { key: 'specialties', label: 'Especialidades', icon: StarIcon },
            { key: 'appointments', label: 'Citas', icon: CalendarIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters and Actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los estados</option>
              <option value="verified">Verificado</option>
              <option value="pending_verification">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          {(activeTab === 'doctors' || activeTab === 'specialties') && (
            <button
              onClick={() => openModal()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Agregar {activeTab === 'doctors' ? 'Doctor' : 'Especialidad'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron elementos
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {((pagination.current - 1) * filters.limit) + 1} - {Math.min(pagination.current * filters.limit, pagination.total)} de {pagination.total}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DoctorFormModal
        isOpen={isDoctorModalOpen}
        onClose={closeModals}
        doctor={editingItem}
        onSuccess={handleModalSuccess}
      />

      <SpecialtyFormModal
        isOpen={isSpecialtyModalOpen}
        onClose={closeModals}
        specialty={editingItem}
        onSuccess={handleModalSuccess}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={closeModals}
        appointment={editingItem}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
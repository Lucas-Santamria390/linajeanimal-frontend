import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEspecies } from '../hooks/useEspecies';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

/**
 * Componente de página para la creación y edición de especies de animales.
 * Maneja validaciones locales, estados de carga, errores de API y diseño responsive.
 * * @returns {JSX.Element} Componente del formulario de especies.
 */
export default function EspeciesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Hook personalizado de la entidad especies
  const { getById, create, update, loading, error } = useEspecies();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  // Estados de validación y UI locales
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  /**
   * Efecto para cargar los datos de la especie si se está en modo edición.
   */
  useEffect(() => {
    /**
     * Obtiene la especie desde la API y precarga el estado del formulario.
     */
    async function cargarEspecie() {
      if (!isEditMode) return;
      try {
        setPageLoading(true);
        const data = await getById(id);
        if (data) {
          setFormData({
            nombre: data.nombre || '',
            descripcion: data.descripcion || '',
          });
        }
      } catch (err) {
        setFormError(err.message || 'Error al precargar los datos de la especie.');
      } finally {
        setPageLoading(false);
      }
    }

    cargarEspecie();
  }, [id, isEditMode, getById]);

  /**
   * Maneja los cambios de los inputs del formulario actualizando el estado de formData.
   * * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - Evento de cambio.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpia el error específico del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Valida los campos obligatorios y de negocio antes de enviar la petición.
   * * @returns {boolean} True si el formulario es válido, False en caso contrario.
   */
  const validarFormulario = () => {
    const localErrors = {};
    if (!formData.nombre.trim()) {
      localErrors.nombre = 'El nombre de la especie es obligatorio.';
    } else if (formData.nombre.trim().length < 2) {
      localErrors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  /**
   * Gestiona el envío del formulario para crear o actualizar la especie.
   * * @param {React.FormEvent<HTMLFormElement>} e - Evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validarFormulario()) return;

    try {
      if (isEditMode) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      
      // Redirección a la lista con un estado de éxito que la lista leerá para lanzar la alerta
      navigate('/especies', { 
        state: { successMessage: `Especie ${isEditMode ? 'actualizada' : 'creada'} con éxito.` } 
      });
    } catch (err) {
      setFormError(err.message || 'Hubo un problema al procesar la solicitud.');
    }
  };

  if (pageLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading message="Procesando información de la especie..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* Encabezado dinámico adaptado a pantallas móviles */}
      <h1 className="text-2xl md:text-3xl font-bold text-brand-700 mb-6">
        {isEditMode ? 'Editar Especie' : 'Nueva Especie'}
      </h1>

      {/* Alerta general de errores de API */}
      {(formError || error) && (
        <div className="mb-4">
          <Alert type="error" message={formError || error} />
        </div>
      )}

      {/* Formulario Responsive */}
      <form onSubmit={handleSubmit} className="bg-neutral-50 p-6 rounded-lg shadow-sm border border-neutral-200 space-y-4">
        
        {/* Campo Nombre */}
        <FormField
          label="Nombre de la especie"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Ej. Porcino, Bovino, Felino"
          required
        />

        {/* Campo Descripción */}
        <div className="flex flex-col">
          <label htmlFor="descripcion" className="text-sm font-medium text-neutral-700 mb-1">
            Descripción (Opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows="4"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Detalles adicionales sobre esta clasificación taxonómica..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-neutral-900"
          />
        </div>

        {/* Botones de acción adaptativos */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/especies')}
            className="w-full sm:w-auto px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-md transition-colors"
          >
            {isEditMode ? 'Guardar Cambios' : 'Crear Especie'}
          </button>
        </div>
      </form>
    </div>
  );
}

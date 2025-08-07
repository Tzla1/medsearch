// React import not needed with new JSX transform

function TestTailwind() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          ¡Tailwind funciona!
        </h1>
        <p className="text-gray-600 mb-4">
          Si puedes ver esta página con estilos, Tailwind está funcionando correctamente.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Botón de prueba
        </button>
      </div>
    </div>
  );
}

export default TestTailwind;
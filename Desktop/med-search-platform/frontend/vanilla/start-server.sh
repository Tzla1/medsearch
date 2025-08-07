#!/bin/bash

# Med Search Platform - Development Server
echo "🏥 Iniciando Med Search Platform..."
echo "📂 Directorio: $(pwd)"
echo "🌐 Servidor: http://localhost:8000"
echo ""
echo "Para detener el servidor presiona Ctrl+C"
echo "----------------------------------------"

# Iniciar servidor HTTP con Python
python3 -m http.server 8000
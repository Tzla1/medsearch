# backend/scripts/validate-environment.sh
#!/bin/bash

echo "🔍 Validando entorno de desarrollo..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Verificar directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ package.json no encontrado en directorio actual"
    echo "💡 Ejecute desde el directorio backend/"
    exit 1
fi

# Verificar tsconfig.json
if [ ! -f "tsconfig.json" ]; then
    echo "❌ tsconfig.json no encontrado"
    exit 1
fi

echo "✅ Entorno validado correctamente"
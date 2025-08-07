#!/bin/bash
set -e

echo "🔄 Ejecutando migraciones extendidas de base de datos..."

# Leer variables del .env
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-med_search_db}

echo "📊 Configuración de BD:"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Usuario: $DB_USER"
echo "   Base de datos: $DB_NAME"

# Ejecutar migraciones principales
echo "🔄 Ejecutando migraciones principales..."
for migration_file in src/database/migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "   📝 Ejecutando: $(basename "$migration_file")"
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration_file"
    fi
done

# Cargar datos iniciales
echo "🔄 Cargando datos iniciales..."
for seed_file in src/database/seeds/*.sql; do
    if [ -f "$seed_file" ]; then
        echo "   🌱 Cargando: $(basename "$seed_file")"
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$seed_file"
    fi
done

# Aplicar configuraciones optimizadas
echo "🔄 Aplicando configuraciones optimizadas..."
if [ -f "src/database/setup/database_config.sql" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" < "src/database/setup/database_config.sql"
fi

echo "✅ ¡Migración extendida completada!"
#!/usr/bin/env bash
#
# Despliegue de Slimming Gym Fitness en la VM.
#
#   bash scripts/deploy.sh
#
# Trae los cambios, reconstruye, EJECUTA LAS PRUEBAS y solo si pasan sustituye
# las replicas. Si algo falla, aborta antes de tocar lo que esta en produccion.

set -euo pipefail

RAIZ="/opt/slimming"
REPLICAS="${REPLICAS:-2}"

cd "$RAIZ"

echo "==> 1/6  Verificando espacio en disco"
LIBRE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
echo "    ${LIBRE_GB} GB disponibles"
if [ "$LIBRE_GB" -lt 5 ]; then
  echo "!!! Menos de 5 GB libres. La construccion puede fallar a medias y dejar"
  echo "    archivos truncados. Libera espacio con: docker system prune -af"
  exit 1
fi

echo "==> 2/6  Trayendo cambios de main"
git pull --ff-only origin main

echo "==> 3/6  Construyendo imagenes"
docker compose build

echo "==> 4/6  Ejecutando las pruebas contra la imagen que se va a desplegar"
# --no-deps evita levantar la base solo para correr pruebas unitarias puras.
docker compose run --rm --no-deps api npm test

echo "==> 5/6  Levantando servicios (${REPLICAS} replicas de la API)"
docker compose up -d --remove-orphans --scale api="${REPLICAS}"

echo "==> 6/6  Verificando el estado del servicio"
for i in $(seq 1 20); do
  if docker compose exec -T api curl -fsS localhost:5001/api/health >/dev/null 2>&1; then
    echo "    la API responde correctamente"
    break
  fi
  [ "$i" -eq 20 ] && { echo "!!! la API no respondio tras 100s"; docker compose logs --tail=30 api; exit 1; }
  sleep 5
done

# La cache de construccion crece con cada despliegue y llena el disco en
# silencio. Se limpia lo no utilizado, NUNCA con --volumes.
docker builder prune -f >/dev/null

echo
docker compose ps
echo
echo "Despliegue completado."

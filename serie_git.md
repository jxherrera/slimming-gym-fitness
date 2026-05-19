# Git Branching & Sync – Resumen Técnico
1. ## Crear una nueva rama / Create a new branch
```bash
git branch
```
👉 Miras las ramas.

```bash
git branch nombre-rama
```
👉 Solo crea la rama.

```bash
git checkout nombre-rama
# o moderno:
git switch nombre-rama
```
👉 Te mueve a esa rama.

```bash
git checkout -b nombre-rama
# o moderno:
git switch -c nombre-rama
```
👉 Crea y cambia en un solo paso.

2. ## Moverse entre ramas / Switch between branches
```bash
git checkout otra-rama
# o moderno:
git switch otra-rama
```
👉 Cambias tu contexto de trabajo a otra rama.

3. ## Subir cambios al remoto / Push changes to remote
```bash
git push -u origin nombre-rama
```
-u vincula tu rama local con la remota.

Después puedes usar simplemente git push.

4. ## Descargar cambios del remoto / Pull changes from remote
```bash
git pull origin nombre-rama
```
👉 Trae y fusiona los cambios de la rama remota a tu rama local.

## Si ya vinculaste con -u, basta con:

```bash
git pull
```
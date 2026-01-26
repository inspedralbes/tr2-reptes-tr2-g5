# 🚀 Projecte ENGINY - Consorci d'Educació de Barcelona

## 📋 Informació del Projecte

### Grup i Integrants
**Grup:** 5

**Integrants:**
- **Fiona Mondelo Giaramita** 
- **Judit Sarrat Andújar** 
- **Fabrizzio Rodriguez Gonzales** 
- **Marta Haro Font** 

### Objectiu del Projecte
**Objectiu:** Aplicació web educativa desenvolupada per al **Consorci d'Educació de Barcelona** per digitalitzar el Programa Enginy. És un recurs orientador i inclusiu que busca garantir l'escolarització, evitar l'absentisme i oferir eines per a la descoberta vocacional.

### Estat del Projecte
- **Estat:** Acabat
- **Fase actual:** Acabat
- **Percentatge completat:** 100%

---

## 🌐 Enllaços del Projecte

### Gestió i Disseny
- **Taiga:** [Link de Taiga](https://tree.taiga.io/project/a24judsarand-enginy/backlog)
### Direccions Web
- **Projecte desplegat:** [Link de la Web](https://enginycat.dam.inspedralbes.cat/)

---

## 📖 Sobre el Programa Enginy

El programa té una llarga trajectòria (des dels tallers TECNE de 2003) i s'adreça a alumnat d'**ESO i Educació Especial**.

### Què volem aconseguir?
* **Descoberta vocacional:** Eines per orientar el futur laboral des de l'etapa escolar.
* **Èxit educatiu:** Evitar l'abandonament prematur potenciant nous aprenentatges.
* **Itineraris inclusius:** Consolidar camins formatius no excloents adaptats a diferents ritmes.
---

## 🛠️ Stack Tecnològic

### Frontend
- **Framework:** Vue 3.5.21
- **UI Library:** Vuetify 3.10.1
- **Build Tool:** Vite 7.1.5
- **Routing:** Vue Router (basat en fitxers)

### Backend
- **Framework:** Express 5.2.1
- **Database:** MongoDB Atlas
- **Node.js:** Versió 18.18.0 o superior

---

## 🚀 Configuració i Desplegament

### Variables d'Entorn
Crea un fitxer `.env`:
```bash
PORT=8088
MONGODB_URI=mongodb+srv://fiona222:giaramita@cluster0.gpu1c2r.mongodb.net/enginy?retryWrites=true&w=majority

```

### Scripts principals

```bash
# Frontend
npm run dev      # Servidor de desenvolupament 
npm run build    # Compilació per a producció

# Backend
npm start        # Iniciar servidor API

```

## 📁 Estructura del Projecte

```
enginy/
├── frontend/           # Aplicació Vue 3 + Vuetify
│   ├── src/components/ # Components reutilitzables
│   └── src/pages/      # Vistes basades en el contingut Enginy
├── backend/            # API Express
│   ├── src/routes/     # Endpoints de l'API
│   └── src/controllers/# Lògica de dades
└── README.md

```

## 📝 Notes

1. El frontend utilitza **auto-importació** de components.
2. La base de dades principal a MongoDB s'anomena `enginy`.

# Esquema de Dades - MongoDB

Aquest document detalla l'estructura de les col·leccions utilitzades a la base de dades `enginy`. Tot i que MongoDB és schemaless, l'aplicació segueix aquests patrons per garantir la integritat de les dades.

## 1. Col·lecció `usuaris`
Emmagatzema tant els administradors com els professors/centres.
```json
{
  "_id": "ObjectId",
  "email": "String (únic)",
  "password": "String (hash)",
  "nom": "String",
  "cognoms": "String (opcional)",
  "rol": "String ('admin' | 'professor' | 'centre')",
  "centre": "String (nom del centre, si aplica)",
  "token_invitacio": "String (per registre de centres)",
  "estat": "String ('actiu' | 'pendent')",
  "data_creacio": "Date"
}
```

## 2. Col·lecció `tallers`
Catàleg dels tallers disponibles per sol·licitar.
```json
{
  "_id": "ObjectId",
  "titol": "String",
  "descripcio": "String",
  "capacitat_maxima": "Number",
  "durada_minuts": "Number",
  "nivells_educatius": ["String"], // Array d'strings (ESO, Batxillerat...)
  "representant_oficial": {
      "nom": "String",
      "correu": "String"
  },  // Objecte imbricat
  "material_necessari": ["String"], // Array simple
  "requeriments_espai": "String"
}
```

## 3. Col·lecció `peticions`
Sol·licituds fetes pels centres.
```json
{
  "_id": "ObjectId",
  "nom_centre": "String",
  "coordinador": {
      "nom": "String",
      "email": "String"
  },
  "seleccio_tallers": {
      "taller_id": "String (ID del taller)",
      "num_alumnes": "Number"
  },
  "nivell_interes": "String",
  "referent_contacte": {
      "nom": "String",
      "correu": "String"
  },
  "comentaris": "String",
  "estat": "String ('PENDENT' | 'ASSIGNAT' | 'REBUTJAT' | 'FINALITZAT')",
  "es_representant_triat": "Boolean",
  "finalitzat": "Boolean",
  "checklist_detalls": {
      "material": "Boolean",
      "espai": "Boolean",
      "satisfaccio": "Boolean"
  },
  "data_creacio": "Date",
  "data_finalitzacio": "Date"
}
```

## 4. Col·lecció `configuracio`
Configuració global de l'aplicació (Singleton).
```json
{
  "_id": "ObjectId",
  "faseActual": "Number (1: Peticions, 2: Assignacions, 3: Tancat)"
}
```

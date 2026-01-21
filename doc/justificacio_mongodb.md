# Justificació: Per què MongoDB?

Hem escollit **MongoDB** per a ENGINY per les següents raons clau:

1.  **Flexibilitat (Schemaless)**: Cada taller pot tenir requisits tècnics diferents. MongoDB permet guardar estructures variables a la mateixa col·lecció sense capes de complexitat SQL (taules extra o camps NULL).
2.  **Rendiment i JSON Natiu**: Emmagatzemem tota la informació d'una sol·licitud (coordinador, subcamps, estat) en un únic document. Això evita `JOINs` lents i facilita la comunicació directa amb el frontend (Vue.js) sense conversions complexes.
3.  **Escalabilitat**: Permet afegir nous camps als formularis ràpidament sense aturar el servei per fer migracions d'esquema.

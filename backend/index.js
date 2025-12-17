const { connectDB, getDB, closeDB } = require('./db');
const { ObjectId } = require('mongodb');

//dades formulari 

async function guardarPeticionFormulario(datos) {
  try {
    await connectDB();
    const db = getDB();
    
    const nuevaPeticio = {
      ...datos,
      estat_gestio: {
        estat: 'pendent',
        data_creacio: new Date() // Clave para la prioridad 
      }
    };

    const resultat = await db.collection('peticions').insertOne(nuevaPeticio);
    console.log('Petició guardada. ID:', resultat.insertedId);
  } finally {
    await closeDB();
  }
}

// assignacio automatica

async function ejecutarAsignacion() {
  try {
    await connectDB();
    const db = getDB();

    const pendientes = await db.collection('peticions')
      .find({ "estat_gestio.estat": "pendent" })
      .sort({ "estat_gestio.data_creacio": 1 })
      .toArray();

    for (const peticion of pendientes) {
      let asignacionesExitosas = [];

      for (const seleccio of peticion.seleccio_tallers) {
        const taller = await db.collection('tallers').findOne({ _id: new ObjectId(seleccio.taller_id) });

        if (taller && taller.capacitat >= seleccio.num_alumnes) {
          await db.collection('tallers').updateOne(
            { _id: taller._id },
            { $inc: { capacitat: -seleccio.num_alumnes } }
          );

          asignacionesExitosas.push({
            taller_id: taller._id,
            titol: taller.titol,
            num_alumnes: seleccio.num_alumnes,
            referents_assignats: ["Prof. Referent 1", "Prof. Referent 2"] 
          });
        }
      }

      // Actualizar peticio 
       if (asignacionesExitosas.length > 0) {
        await db.collection('peticions').updateOne(
          { _id: peticion._id },
          { 
            $set: { 
              "estat_gestio.estat": "assignada", 
              "resultat_assignacio": asignacionesExitosas 
            } 
          }
        );
        console.log(`Asignación completada para: ${peticion.nom_centre}`);
      }
    }
  } finally {
    await closeDB();
  }
}


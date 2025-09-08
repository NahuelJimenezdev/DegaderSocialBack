// Script para sincronizar estado de amistades y limpiar notificaciones obsoletas
require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/models/usuarios.model');

const limpiarEstados = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ACCESS);
    console.log('✅ Conectado a la base de datos');

    // Obtener Joselin y Nahuel
    const joselin = await UserModel.findOne({
      primernombreUsuario: 'Joselin',
      primerapellidoUsuario: { $regex: /jimenez/i }
    });

    const nahuel = await UserModel.findOne({
      primernombreUsuario: { $regex: /nahuel/i }
    });

    if (!joselin || !nahuel) {
      console.log('❌ No se encontraron los usuarios');
      return;
    }

    console.log('👥 Usuarios encontrados:');
    console.log(`Joselin ID: ${joselin._id}`);
    console.log(`Nahuel ID: ${nahuel._id}`);

    // Verificar si ya son amigos
    const yaAmigos = joselin.amigos?.includes(nahuel._id) && nahuel.amigos?.includes(joselin._id);

    if (yaAmigos) {
      console.log('✅ Los usuarios ya son amigos en la base de datos');

      // Limpiar cualquier solicitud pendiente que pueda existir
      await Promise.all([
        UserModel.updateOne(
          { _id: joselin._id },
          {
            $pull: {
              solicitudesEnviadas: nahuel._id,
              solicitudesPendientes: nahuel._id
            }
          }
        ),
        UserModel.updateOne(
          { _id: nahuel._id },
          {
            $pull: {
              solicitudesEnviadas: joselin._id,
              solicitudesPendientes: joselin._id
            }
          }
        )
      ]);

      console.log('🧹 Limpiadas solicitudes obsoletas');

      // Mostrar estado final
      const joselinActualizado = await UserModel.findById(joselin._id);
      const nahuActualizado = await UserModel.findById(nahuel._id);

      console.log('\n📊 ESTADO FINAL:');
      console.log('Joselin:', {
        solicitudesEnviadas: joselinActualizado.solicitudesEnviadas || [],
        solicitudesPendientes: joselinActualizado.solicitudesPendientes || [],
        amigos: joselinActualizado.amigos || []
      });
      console.log('Nahuel:', {
        solicitudesEnviadas: nahuActualizado.solicitudesEnviadas || [],
        solicitudesPendientes: nahuActualizado.solicitudesPendientes || [],
        amigos: nahuActualizado.amigos || []
      });

    } else {
      console.log('❌ Los usuarios NO son amigos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de la base de datos');
  }
};

limpiarEstados();

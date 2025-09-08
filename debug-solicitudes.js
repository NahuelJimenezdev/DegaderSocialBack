// Debug script para verificar solicitudes de amistad
require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/model/usuarios.model');

const debugSolicitudes = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_ACCESS);
    console.log('✅ Conectado a la base de datos');

    // IDs del log de error
    const joselinId = '68bda6ad979d65fec4a9dfac';
    const nahuId = '68bda704979d65fec4a9dfe9'; // Este parece ser el ID de la notificación, no del usuario

    // Buscar usuarios por nombre para obtener IDs correctos
    const joselin = await UserModel.findOne({
      primernombreUsuario: 'Joselin',
      primerapellidoUsuario: { $regex: /jimenez/i }
    });

    const nahuel = await UserModel.findOne({
      primernombreUsuario: { $regex: /nahuel/i }
    });

    console.log('\n🔍 USUARIOS ENCONTRADOS:');
    console.log('Joselin:', joselin ? {
      _id: joselin._id,
      nombre: `${joselin.primernombreUsuario} ${joselin.primerapellidoUsuario}`,
      solicitudesEnviadas: joselin.solicitudesEnviadas || [],
      solicitudesPendientes: joselin.solicitudesPendientes || [],
      amigos: joselin.amigos || []
    } : 'NO ENCONTRADO');

    console.log('Nahuel:', nahuel ? {
      _id: nahuel._id,
      nombre: `${nahuel.primernombreUsuario} ${nahuel.primerapellidoUsuario}`,
      solicitudesEnviadas: nahuel.solicitudesEnviadas || [],
      solicitudesPendientes: nahuel.solicitudesPendientes || [],
      amigos: nahuel.amigos || []
    } : 'NO ENCONTRADO');

    // Verificar si hay solicitud entre ellos
    if (joselin && nahuel) {
      console.log('\n🔍 VERIFICACIÓN DE SOLICITUDES:');

      const joselinTieneEnviada = joselin.solicitudesEnviadas?.includes(nahuel._id);
      const nahueTienePendiente = nahuel.solicitudesPendientes?.includes(joselin._id);

      console.log(`Joselin tiene solicitud enviada a Nahuel: ${joselinTieneEnviada}`);
      console.log(`Nahuel tiene solicitud pendiente de Joselin: ${nahueTienePendiente}`);

      if (joselinTieneEnviada && nahueTienePendiente) {
        console.log('✅ Solicitud existe correctamente');
      } else {
        console.log('❌ Solicitud NO existe o está incompleta');
      }
    }

    // Buscar por el ID específico del log
    const userPorId = await UserModel.findById(joselinId);
    console.log('\n🔍 USUARIO POR ID DEL LOG:');
    console.log('ID del log:', joselinId);
    console.log('Usuario encontrado:', userPorId ? {
      _id: userPorId._id,
      nombre: `${userPorId.primernombreUsuario} ${userPorId.primerapellidoUsuario}`,
      solicitudesEnviadas: userPorId.solicitudesEnviadas || [],
      solicitudesPendientes: userPorId.solicitudesPendientes || [],
      amigos: userPorId.amigos || []
    } : 'NO ENCONTRADO');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de la base de datos');
  }
};

debugSolicitudes();

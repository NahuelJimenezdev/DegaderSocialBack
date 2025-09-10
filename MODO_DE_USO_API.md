# Backend API - Modo de Uso Técnico

## Guía Completa para Desarrolladores

> **Sistema:** Degader Social Backend API  
> **Versión:** v1.0 - Septiembre 2025  
> **Arquitectura:** Node.js + Express + MongoDB

---

## 🔍 Resumen Ejecutivo

Este documento describe el uso técnico completo del backend API de Degader Social, incluyendo todos los endpoints implementados, ejemplos de uso, y guías para desarrolladores.

### 🚀 Estado Actual del Sistema

- ✅ **25+ endpoints** completamente funcionales
- ✅ **Sistema de autenticación JWT** robusto
- ✅ **Upload multimedia** con validación avanzada
- ✅ **Sistema de amistades** con notificaciones
- ✅ **Gestión de eventos** con privacidad configurable
- ✅ **Roles organizacionales** multinivel
- ✅ **Base de datos optimizada** con índices

---

## 📋 Índice de APIs Disponibles

### 1. [Autenticación y Usuarios](#autenticación-y-usuarios)

### 2. [Sistema de Amistades](#sistema-de-amistades)

### 3. [Gestión de Eventos](#gestión-de-eventos)

### 4. [Upload de Archivos](#upload-de-archivos)

### 5. [Notificaciones](#notificaciones)

### 6. [Roles y Permisos](#roles-y-permisos)

### 7. [Publicaciones y Grupos](#publicaciones-y-grupos)

---

## 🔐 Autenticación y Usuarios

### Base URL: `/api/usuarios`

#### 1. Registro de Usuario

```http
POST /api/usuarios/register
Content-Type: application/json

{
  "primernombreUsuario": "Juan",
  "segundonombreUsuario": "Carlos", // opcional
  "primerapellidoUsuario": "Pérez",
  "segundoapellidoUsuario": "González", // opcional
  "correoUsuario": "juan.perez@ejemplo.com",
  "contraseniaUsuario": "MiPassword123!",
  "celularUsuario": "+5491166582695", // opcional
  "ciudadUsuario": "Buenos Aires", // opcional
  "paisUsuario": "Argentina" // opcional
}
```

**Response exitoso (201):**

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "_id": "64f1234567890abcdef12345",
    "primernombreUsuario": "Juan",
    "primerapellidoUsuario": "Pérez",
    "correoUsuario": "juan.perez@ejemplo.com",
    "rolUsuario": "Miembro",
    "estadoUsuario": "pendiente",
    "fechaRegistro": "2025-09-07T10:30:00Z"
  }
}
```

#### 2. Login de Usuario

```http
POST /api/usuarios/login
Content-Type: application/json

{
  "correoUsuario": "juan.perez@ejemplo.com",
  "contraseniaUsuario": "MiPassword123!"
}
```

**Response exitoso (200):**

```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "64f1234567890abcdef12345",
    "primernombreUsuario": "Juan",
    "primerapellidoUsuario": "Pérez",
    "correoUsuario": "juan.perez@ejemplo.com",
    "rolUsuario": "Miembro",
    "estadoUsuario": "activo",
    "fotoPerfil": "https://api.com/uploads/avatars/juan_avatar.jpg",
    "ultimaConexion": "2025-09-07T10:35:00Z"
  }
}
```

#### 3. Obtener Perfil Actual

```http
GET /api/me
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "usuario": {
    "_id": "64f1234567890abcdef12345",
    "primernombreUsuario": "Juan",
    "primerapellidoUsuario": "Pérez",
    "correoUsuario": "juan.perez@ejemplo.com",
    "celularUsuario": "+5491166582695",
    "ciudadUsuario": "Buenos Aires",
    "paisUsuario": "Argentina",
    "fotoPerfil": "https://api.com/uploads/avatars/juan_avatar.jpg",
    "biografia": "Desarrollador y líder en la comunidad",
    "rolUsuario": "Profesional",
    "estadoUsuario": "activo",
    "amigos": ["64f2345678901bcdef23456", "64f3456789012cdef34567"],
    "estructuraOrganizacional": {
      "nivelJerarquico": "regional",
      "areaResponsabilidad": {
        "pais": "Argentina",
        "region": "Buenos Aires"
      },
      "permisos": {
        "crearEventos": true,
        "aprobarEventos": false
      }
    }
  }
}
```

#### 4. Actualizar Perfil

```http
PATCH /api/me
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "biografia": "Nueva biografía actualizada",
  "celularUsuario": "+5491177889900",
  "ciudadUsuario": "La Plata"
}
```

#### 5. Búsqueda de Usuarios

```http
GET /api/usuarios/buscar?q=juan&limite=10
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "usuarios": [
    {
      "_id": "64f1234567890abcdef12345",
      "primernombreUsuario": "Juan",
      "primerapellidoUsuario": "Pérez",
      "fotoPerfil": "https://api.com/uploads/avatars/juan.jpg",
      "ciudadUsuario": "Buenos Aires",
      "rolUsuario": "Profesional"
    }
  ],
  "total": 1
}
```

---

## 🤝 Sistema de Amistades

### Base URL: `/api/amistades`

#### 1. Obtener Lista de Amigos

```http
GET /api/amistades
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "amigos": [
    {
      "_id": "64f2345678901bcdef23456",
      "primernombreUsuario": "María",
      "primerapellidoUsuario": "González",
      "fotoPerfil": "https://api.com/uploads/avatars/maria.jpg",
      "ciudadUsuario": "Córdoba",
      "rolUsuario": "Miembro",
      "ultimaConexion": "2025-09-07T09:15:00Z",
      "fechaAmistad": "2025-08-15T14:20:00Z"
    }
  ],
  "total": 1
}
```

#### 2. Enviar Solicitud de Amistad

```http
POST /api/amistades
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "usuarioDestinoId": "64f3456789012cdef34567"
}
```

**Response (201):**

```json
{
  "mensaje": "Solicitud de amistad enviada exitosamente",
  "solicitud": {
    "_id": "64f4567890123def45678",
    "usuarioOrigen": "64f1234567890abcdef12345",
    "usuarioDestino": "64f3456789012cdef34567",
    "estado": "pendiente",
    "fechaEnvio": "2025-09-07T10:45:00Z"
  }
}
```

#### 3. Obtener Solicitudes Pendientes

```http
GET /api/amistades/solicitudes
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "solicitudesRecibidas": [
    {
      "_id": "64f4567890123def45678",
      "usuarioOrigen": {
        "_id": "64f5678901234ef56789",
        "primernombreUsuario": "Carlos",
        "primerapellidoUsuario": "Rodríguez",
        "fotoPerfil": "https://api.com/uploads/avatars/carlos.jpg",
        "ciudadUsuario": "Rosario"
      },
      "fechaEnvio": "2025-09-07T08:30:00Z"
    }
  ],
  "solicitudesEnviadas": [
    {
      "_id": "64f6789012345f67890",
      "usuarioDestino": {
        "_id": "64f7890123456f78901",
        "primernombreUsuario": "Ana",
        "primerapellidoUsuario": "Martínez",
        "fotoPerfil": "https://api.com/uploads/avatars/ana.jpg"
      },
      "fechaEnvio": "2025-09-06T16:20:00Z"
    }
  ]
}
```

#### 4. Responder Solicitud de Amistad

```http
PATCH /api/amistades/:solicitudId/estado
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "estado": "aceptada"  // o "rechazada"
}
```

**Response para aceptación (200):**

```json
{
  "mensaje": "Solicitud de amistad aceptada",
  "amistad": {
    "_id": "64f8901234567f89012",
    "usuario1": "64f1234567890abcdef12345",
    "usuario2": "64f5678901234ef56789",
    "fechaInicio": "2025-09-07T10:50:00Z"
  }
}
```

#### 5. Eliminar Amistad

```http
DELETE /api/amistades/:amistadId
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "mensaje": "Amistad eliminada exitosamente"
}
```

---

## 🎉 Gestión de Eventos

### Base URL: `/api/eventos`

#### 1. Crear Evento

```http
POST /api/eventos
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "nombre": "Reunión Semanal de Coordinación",
  "descripcion": "Reunión para coordinar actividades de la semana",
  "fechaInicio": "2025-09-15T10:00:00Z",
  "horaInicio": "10:00",
  "fechaFin": "2025-09-15T12:00:00Z",
  "horaFin": "12:00",
  "tipoModalidad": "presencial",
  "ubicacion": {
    "direccion": "Av. Corrientes 1234",
    "ciudad": "Buenos Aires",
    "provincia": "Buenos Aires",
    "pais": "Argentina"
  },
  "categoria": "reunion",
  "capacidadMaxima": 50,
  "configuracionPrivacidad": {
    "tipoPrivacidad": "privado",
    "visibilidad": "miembros",
    "aprobacion": {
      "requerida": true,
      "autorPersonaAprueba": "64f1234567890abcdef12345",
      "mensajeAprobacion": "Por favor, confirma tu asistencia"
    },
    "registros": {
      "permitirAutoRegistro": false,
      "limiteAsistentes": 30,
      "requiereConfirmacion": true
    }
  }
}
```

**Response (201):**

```json
{
  "mensaje": "Evento creado exitosamente",
  "evento": {
    "_id": "64f9012345678f90123",
    "organizador": "64f1234567890abcdef12345",
    "nombre": "Reunión Semanal de Coordinación",
    "descripcion": "Reunión para coordinar actividades de la semana",
    "fechaInicio": "2025-09-15T10:00:00Z",
    "estado": "borrador",
    "configuracionPrivacidad": {
      "tipoPrivacidad": "privado",
      "visibilidad": "miembros",
      "aprobacion": {
        "requerida": true,
        "autorPersonaAprueba": "64f1234567890abcdef12345"
      }
    },
    "fechaCreacion": "2025-09-07T10:55:00Z"
  }
}
```

#### 2. Listar Eventos

```http
GET /api/eventos?estado=publicado&limite=20&pagina=1
Authorization: Bearer <jwt_token>
```

**Query Parameters opcionales:**

- `estado`: borrador, publicado, cancelado, finalizado
- `categoria`: conferencia, taller, reunion, etc.
- `tipoModalidad`: presencial, virtual, hibrido
- `fechaDesde`: ISO date string
- `fechaHasta`: ISO date string
- `limite`: número de resultados (default: 20)
- `pagina`: página de resultados (default: 1)

**Response (200):**

```json
{
  "eventos": [
    {
      "_id": "64f9012345678f90123",
      "organizador": {
        "_id": "64f1234567890abcdef12345",
        "primernombreUsuario": "Juan",
        "primerapellidoUsuario": "Pérez",
        "fotoPerfil": "https://api.com/uploads/avatars/juan.jpg"
      },
      "nombre": "Reunión Semanal de Coordinación",
      "descripcion": "Reunión para coordinar...",
      "fechaInicio": "2025-09-15T10:00:00Z",
      "tipoModalidad": "presencial",
      "ubicacion": {
        "ciudad": "Buenos Aires",
        "pais": "Argentina"
      },
      "categoria": "reunion",
      "capacidadMaxima": 50,
      "participantesRegistrados": 12,
      "estado": "publicado",
      "imagenPortada": "https://api.com/uploads/events/evento123.jpg"
    }
  ],
  "total": 1,
  "pagina": 1,
  "totalPaginas": 1
}
```

#### 3. Obtener Detalle de Evento

```http
GET /api/eventos/:eventoId
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "evento": {
    "_id": "64f9012345678f90123",
    "organizador": {
      "_id": "64f1234567890abcdef12345",
      "primernombreUsuario": "Juan",
      "primerapellidoUsuario": "Pérez",
      "fotoPerfil": "https://api.com/uploads/avatars/juan.jpg",
      "rolUsuario": "Coordinador"
    },
    "nombre": "Reunión Semanal de Coordinación",
    "descripcion": "Reunión para coordinar actividades de la semana y revisar el progreso de los proyectos en curso.",
    "fechaInicio": "2025-09-15T10:00:00Z",
    "horaInicio": "10:00",
    "fechaFin": "2025-09-15T12:00:00Z",
    "horaFin": "12:00",
    "tipoModalidad": "presencial",
    "ubicacion": {
      "direccion": "Av. Corrientes 1234",
      "ciudad": "Buenos Aires",
      "provincia": "Buenos Aires",
      "pais": "Argentina"
    },
    "categoria": "reunion",
    "capacidadMaxima": 50,
    "estado": "publicado",
    "configuracionPrivacidad": {
      "tipoPrivacidad": "privado",
      "visibilidad": "miembros",
      "aprobacion": {
        "requerida": true,
        "autorPersonaAprueba": {
          "_id": "64f1234567890abcdef12345",
          "primernombreUsuario": "Juan",
          "primerapellidoUsuario": "Pérez"
        }
      }
    },
    "participantes": [
      {
        "_id": "64fa012345678fa0123",
        "usuario": {
          "_id": "64f2345678901bcdef23456",
          "primernombreUsuario": "María",
          "fotoPerfil": "https://api.com/uploads/avatars/maria.jpg"
        },
        "estado": "confirmado",
        "fechaRegistro": "2025-09-08T14:30:00Z"
      }
    ],
    "estadisticas": {
      "totalRegistrados": 12,
      "confirmados": 8,
      "pendientes": 4,
      "espaciosDisponibles": 38
    }
  }
}
```

#### 4. Registrarse en Evento

```http
POST /api/eventos/:eventoId/registro
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "comentario": "Confirmo mi asistencia a la reunión",
  "camposAdicionales": {
    "telefono": "+5491166582695",
    "alergias": "Ninguna"
  }
}
```

**Response (201):**

```json
{
  "mensaje": "Registro exitoso",
  "registro": {
    "_id": "64fb012345678fb0123",
    "evento": "64f9012345678f90123",
    "usuario": "64f1234567890abcdef12345",
    "estado": "pendiente", // o "confirmado" si no requiere aprobación
    "fechaRegistro": "2025-09-07T11:00:00Z",
    "comentario": "Confirmo mi asistencia a la reunión"
  }
}
```

#### 5. Obtener Participantes de Evento

```http
GET /api/eventos/:eventoId/participantes
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "participantes": [
    {
      "_id": "64fb012345678fb0123",
      "usuario": {
        "_id": "64f2345678901bcdef23456",
        "primernombreUsuario": "María",
        "primerapellidoUsuario": "González",
        "fotoPerfil": "https://api.com/uploads/avatars/maria.jpg",
        "rolUsuario": "Miembro"
      },
      "estado": "confirmado",
      "fechaRegistro": "2025-09-08T14:30:00Z",
      "comentario": "Estaré presente puntualmente"
    }
  ],
  "estadisticas": {
    "total": 12,
    "confirmados": 8,
    "pendientes": 4,
    "rechazados": 0
  }
}
```

#### 6. Aprobar/Rechazar Participante

```http
PATCH /api/eventos/:eventoId/participantes/:participanteId/estado
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "estado": "confirmado", // o "rechazado"
  "comentarioAprobacion": "Aprobado. Te esperamos en la reunión."
}
```

---

## 📤 Upload de Archivos

### Base URL: `/api/upload`

#### 1. Upload de Avatar

```http
POST /api/upload/avatar
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- avatar: [archivo de imagen]
```

**Response (200):**

```json
{
  "mensaje": "Avatar actualizado exitosamente",
  "fotoPerfil": "https://api.com/uploads/avatars/2025/09/user123_avatar_1694087400.jpg",
  "metadatos": {
    "nombreOriginal": "mi_foto.jpg",
    "tamaño": 245760,
    "tipo": "image/jpeg",
    "dimensiones": {
      "ancho": 300,
      "alto": 300
    }
  }
}
```

#### 2. Upload de Multimedia General

```http
POST /api/upload/multimedia
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- archivo: [archivo de imagen o video]
- categoria: "perfil" | "evento" | "publicacion"
```

**Response (200):**

```json
{
  "mensaje": "Archivo subido exitosamente",
  "archivo": {
    "url": "https://api.com/uploads/multimedia/2025/09/archivo_1694087500.mp4",
    "nombreOriginal": "video_evento.mp4",
    "tamaño": 15728640,
    "tipo": "video/mp4",
    "categoria": "evento",
    "fechaSubida": "2025-09-07T11:05:00Z"
  }
}
```

#### 3. Upload de Imagen para Evento

```http
POST /api/upload/evento/:eventoId/imagen
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- imagen: [archivo de imagen]
- tipo: "portada" | "galeria"
```

**Response (200):**

```json
{
  "mensaje": "Imagen de evento subida exitosamente",
  "imagen": {
    "url": "https://api.com/uploads/events/2025/09/evento123_portada.jpg",
    "tipo": "portada",
    "eventoId": "64f9012345678f90123"
  }
}
```

#### 4. Eliminar Archivo

```http
DELETE /api/upload/:tipo/:filename
Authorization: Bearer <jwt_token>
```

**Tipos válidos:** `avatars`, `multimedia`, `events`

**Response (200):**

```json
{
  "mensaje": "Archivo eliminado exitosamente"
}
```

---

## 🔔 Notificaciones

### Base URL: `/api/notificaciones`

#### 1. Obtener Notificaciones

```http
GET /api/notificaciones?limite=20&pagina=1&leidas=false
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `limite`: número de notificaciones (default: 20)
- `pagina`: página de resultados (default: 1)
- `leidas`: true/false para filtrar por estado de lectura
- `tipo`: filtrar por tipo específico

**Response (200):**

```json
{
  "notificaciones": [
    {
      "_id": "64fc012345678fc0123",
      "usuario": "64f1234567890abcdef12345",
      "tipo": "solicitud_amistad",
      "mensaje": "Carlos Rodríguez te envió una solicitud de amistad",
      "datos": {
        "usuarioOrigen": {
          "_id": "64f5678901234ef56789",
          "primernombreUsuario": "Carlos",
          "primerapellidoUsuario": "Rodríguez",
          "fotoPerfil": "https://api.com/uploads/avatars/carlos.jpg"
        },
        "solicitudId": "64f4567890123def45678"
      },
      "leido": false,
      "fecha": "2025-09-07T08:30:00Z",
      "accionRequerida": true,
      "urlAccion": "/amistades/solicitudes"
    },
    {
      "_id": "64fd012345678fd0123",
      "tipo": "evento_invitacion",
      "mensaje": "Te invitaron al evento: Reunión Semanal de Coordinación",
      "datos": {
        "evento": {
          "_id": "64f9012345678f90123",
          "nombre": "Reunión Semanal de Coordinación",
          "fechaInicio": "2025-09-15T10:00:00Z"
        },
        "organizador": {
          "primernombreUsuario": "Juan",
          "primerapellidoUsuario": "Pérez"
        }
      },
      "leido": true,
      "fecha": "2025-09-06T16:45:00Z",
      "accionRequerida": false
    }
  ],
  "total": 2,
  "noLeidas": 1
}
```

#### 2. Contar Notificaciones No Leídas

```http
GET /api/notificaciones/count
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "noLeidas": 5,
  "total": 23
}
```

#### 3. Marcar Notificación como Leída

```http
PATCH /api/notificaciones/:notificacionId/leida
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "mensaje": "Notificación marcada como leída"
}
```

#### 4. Marcar Todas como Leídas

```http
PATCH /api/notificaciones/marcar-todas-leidas
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "mensaje": "Todas las notificaciones marcadas como leídas",
  "actualizadas": 5
}
```

#### 5. Eliminar Notificación

```http
DELETE /api/notificaciones/:notificacionId
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "mensaje": "Notificación eliminada exitosamente"
}
```

---

## 🏢 Roles y Permisos

### Base URL: `/api/roles`

#### 1. Obtener Configuración de Roles

```http
GET /api/roles
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "roles": [
    {
      "nombre": "Director Nacional",
      "nivel": "nacional",
      "permisos": [
        "crear_eventos_nacionales",
        "gestionar_usuarios_todos",
        "acceder_reportes_completos",
        "aprobar_eventos_todos"
      ]
    },
    {
      "nombre": "Director Regional",
      "nivel": "regional",
      "permisos": [
        "crear_eventos_regionales",
        "gestionar_usuarios_region",
        "acceder_reportes_regionales"
      ]
    }
  ],
  "areas": [
    "planeacion",
    "asuntos_etnicos",
    "infraestructura",
    "sostenibilidad",
    "rrhh_seguridad",
    "juridica",
    "salud",
    "psicosocial",
    "proteccion_animal",
    "educacion",
    "financiera",
    "comunicacion",
    "seguridad"
  ],
  "jerarquias": ["nacional", "regional", "municipal", "barrio", "local"]
}
```

#### 2. Asignar Rol Organizacional

```http
POST /api/roles/asignar
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "usuarioId": "64f2345678901bcdef23456",
  "rolOrganizacional": {
    "nivel": "regional",
    "area": "salud",
    "cargo": "Director Regional de Salud",
    "pais": "Argentina",
    "region": "Buenos Aires"
  },
  "permisos": {
    "crearEventos": true,
    "aprobarEventos": true,
    "gestionarUsuarios": true,
    "accederReportes": true,
    "moderarContenido": false
  }
}
```

**Response (200):**

```json
{
  "mensaje": "Rol organizacional asignado exitosamente",
  "usuario": {
    "_id": "64f2345678901bcdef23456",
    "primernombreUsuario": "María",
    "primerapellidoUsuario": "González",
    "rolUsuario": "Director Regional",
    "estructuraOrganizacional": {
      "nivelJerarquico": "regional",
      "areaResponsabilidad": {
        "pais": "Argentina",
        "region": "Buenos Aires"
      },
      "permisos": {
        "crearEventos": true,
        "aprobarEventos": true,
        "gestionarUsuarios": true,
        "accederReportes": true
      }
    }
  }
}
```

#### 3. Obtener Usuarios por Rol

```http
GET /api/roles/usuarios/:rol
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "usuarios": [
    {
      "_id": "64f1234567890abcdef12345",
      "primernombreUsuario": "Juan",
      "primerapellidoUsuario": "Pérez",
      "rolUsuario": "Director Regional",
      "estructuraOrganizacional": {
        "nivelJerarquico": "regional",
        "areaResponsabilidad": {
          "pais": "Argentina",
          "region": "Buenos Aires"
        }
      },
      "fechaAsignacion": "2025-08-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### 4. Verificar Permisos

```http
POST /api/roles/verificar-permiso
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accion": "crear_evento_nacional",
  "recurso": {
    "tipo": "evento",
    "nivel": "nacional",
    "area": "educacion"
  }
}
```

**Response (200):**

```json
{
  "tienePermiso": true,
  "razon": "Usuario tiene rol Director Nacional con permisos suficientes"
}
```

---

## 📝 Publicaciones y Grupos

### Publicaciones - Base URL: `/api/publicaciones`

#### 1. Crear Publicación

```http
POST /api/publicaciones
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "contenido": "¡Excelente reunión de coordinación hoy! Logramos avanzar mucho en los proyectos.",
  "imagenes": [
    "https://api.com/uploads/multimedia/imagen1.jpg",
    "https://api.com/uploads/multimedia/imagen2.jpg"
  ],
  "grupoId": "64fe012345678fe0123", // opcional
  "eventoId": "64f9012345678f90123", // opcional
  "visibilidad": "publico" // publico, amigos, grupo
}
```

**Response (201):**

```json
{
  "publicacion": {
    "_id": "64ff012345678ff0123",
    "autor": {
      "_id": "64f1234567890abcdef12345",
      "primernombreUsuario": "Juan",
      "primerapellidoUsuario": "Pérez",
      "fotoPerfil": "https://api.com/uploads/avatars/juan.jpg"
    },
    "contenido": "¡Excelente reunión de coordinación hoy!...",
    "imagenes": ["https://api.com/uploads/multimedia/imagen1.jpg"],
    "fechaCreacion": "2025-09-07T11:30:00Z",
    "likes": 0,
    "comentarios": 0,
    "visibilidad": "publico"
  }
}
```

#### 2. Obtener Feed de Publicaciones

```http
GET /api/publicaciones?limite=20&pagina=1&tipo=feed
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "publicaciones": [
    {
      "_id": "64ff012345678ff0123",
      "autor": {
        "_id": "64f1234567890abcdef12345",
        "primernombreUsuario": "Juan",
        "primerapellidoUsuario": "Pérez",
        "fotoPerfil": "https://api.com/uploads/avatars/juan.jpg"
      },
      "contenido": "¡Excelente reunión de coordinación hoy!...",
      "imagenes": ["https://api.com/uploads/multimedia/imagen1.jpg"],
      "fechaCreacion": "2025-09-07T11:30:00Z",
      "likes": 5,
      "comentarios": 2,
      "yaLeDiLike": false,
      "ultimosComentarios": [
        {
          "_id": "6500012345678001234",
          "autor": {
            "primernombreUsuario": "María",
            "fotoPerfil": "https://api.com/uploads/avatars/maria.jpg"
          },
          "contenido": "¡Muy buena reunión!",
          "fecha": "2025-09-07T12:00:00Z"
        }
      ]
    }
  ]
}
```

### Grupos - Base URL: `/api/grupos`

#### 1. Crear Grupo

```http
POST /api/grupos
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "nombre": "Coordinadores de Salud",
  "descripcion": "Grupo para coordinadores del área de salud",
  "tipo": "ministerial", // publico, privado, ministerial
  "area": "salud",
  "nivel": "regional",
  "configuracion": {
    "requiereAprobacion": true,
    "permiteInvitaciones": true,
    "soloAdminPublica": false
  }
}
```

---

## 🛠️ Utilidades de Desarrollo

### Health Check

```http
GET /api/health
```

**Response (200):**

```json
{
  "status": "healthy",
  "timestamp": "2025-09-07T11:45:00Z",
  "uptime": 3600,
  "memory": {
    "used": 125829120,
    "free": 8351444992
  },
  "database": "connected",
  "uploads": "accessible"
}
```

### Información del Sistema

```http
GET /api/info
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "version": "1.0.0",
  "entorno": "development",
  "baseDatos": "MongoDB 6.0.1",
  "nodeVersion": "18.17.0",
  "ultimoReinicio": "2025-09-07T08:00:00Z",
  "estadisticas": {
    "usuariosActivos": 156,
    "eventosCreados": 23,
    "amistades": 89,
    "archivosSubidos": 245
  }
}
```

---

## 🔍 Códigos de Error Comunes

### Errores de Autenticación (401)

```json
{
  "error": "Token requerido",
  "codigo": "AUTH_TOKEN_MISSING"
}

{
  "error": "Token inválido o expirado",
  "codigo": "AUTH_TOKEN_INVALID"
}

{
  "error": "Credenciales incorrectas",
  "codigo": "AUTH_INVALID_CREDENTIALS"
}
```

### Errores de Autorización (403)

```json
{
  "error": "No tienes permisos para realizar esta acción",
  "codigo": "AUTH_INSUFFICIENT_PERMISSIONS"
}

{
  "error": "Usuario inactivo",
  "codigo": "USER_INACTIVE"
}
```

### Errores de Validación (400)

```json
{
  "error": "Datos de entrada inválidos",
  "codigo": "VALIDATION_ERROR",
  "detalles": [
    {
      "campo": "correoUsuario",
      "mensaje": "Email inválido"
    },
    {
      "campo": "contraseniaUsuario",
      "mensaje": "Contraseña debe tener al menos 6 caracteres"
    }
  ]
}
```

### Errores de Recursos (404)

```json
{
  "error": "Usuario no encontrado",
  "codigo": "USER_NOT_FOUND"
}

{
  "error": "Evento no encontrado",
  "codigo": "EVENT_NOT_FOUND"
}
```

### Errores de Upload (400/413)

```json
{
  "error": "Archivo muy grande",
  "codigo": "FILE_TOO_LARGE",
  "limite": "5MB"
}

{
  "error": "Tipo de archivo no permitido",
  "codigo": "FILE_TYPE_NOT_ALLOWED",
  "tiposPermitidos": ["jpg", "png", "gif", "webp"]
}
```

---

## 📞 Soporte Técnico

### Contacto para Desarrolladores

- **Email:** naedjima93@gmail.com
- **WhatsApp:** [+54 9 11 6658-2695](https://wa.me/5491166582695?text=Consulta%20técnica%20sobre%20Backend%20API)

### Debugging

```bash
# Logs en tiempo real
tail -f logs/app.log

# Test de conectividad
curl http://localhost:3001/api/health

# Test de autenticación
curl -X POST http://localhost:3001/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"correoUsuario":"test@example.com","contraseniaUsuario":"password"}'
```

---

> **Documentación actualizada:** Septiembre 2025  
> **API Version:** v1.0  
> **Status:** ✅ Producción Ready

_Esta documentación cubre todas las funcionalidades implementadas en el backend de Degader Social._

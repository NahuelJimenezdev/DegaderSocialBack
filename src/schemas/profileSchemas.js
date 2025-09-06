// JS puro (con Zod en runtime)
import { z } from "zod";

export const basicInfoSchema = z.object({
  primernombreUsuario: z.string().min(2, "Mínimo 2 caracteres").max(50),
  primerapellidoUsuario: z.string().min(2, "Mínimo 2 caracteres").max(50),
});

export const contactSchema = z.object({
  ciudadUsuario: z.string().max(60).optional().or(z.literal("")),
  paisUsuario: z.string().max(60).optional().or(z.literal("")),
  direccionUsuario: z.string().min(5, "Muy corta").max(120).optional().or(z.literal("")),
});

export const bioSchema = z.object({
  biografia: z.string().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
});

export const privacySchema = z.object({
  preferencias: z.object({
    showEmail: z.boolean().optional(),
    showLocation: z.boolean().optional(),
  })
});

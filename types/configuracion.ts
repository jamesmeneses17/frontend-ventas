// Tipos para la configuración de la aplicación (Información de la Empresa)

export interface InformacionEmpresa {
  id?: number;
  nombreEmpresa?: string;
  razonSocial?: string;
  nit?: string;
  telefonoFijo?: string;
  whatsapp?: string;
  emailInfo?: string;
  emailVentas?: string;
  direccionPrincipal?: string;
  horarioLunesViernes?: string;
  horarioSabados?: string;
  horarioDomingos?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  urlLinkedIn?: string;
  urlLogo?: string;
  urlFavicon?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Datos usados para actualizar el registro (todos opcionales para PATCH/PUT)
export type UpdateInformacionEmpresaData = Partial<Omit<InformacionEmpresa, 'id' | 'createdAt' | 'updatedAt'>>;

// Datos necesarios para crear el registro inicial (algunos campos pueden ser obligatorios)
export interface CreateInformacionEmpresaData {
  nombreEmpresa: string;
  telefonoFijo: string;
  whatsapp: string;
  emailInfo: string;
  direccionPrincipal: string;
  horarioLunesViernes?: string;
  horarioSabados?: string;
  horarioDomingos?: string;
  urlLogo: string;
  razonSocial?: string;
  nit?: string;
  emailVentas?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  urlLinkedIn?: string;
  urlFavicon?: string;
}

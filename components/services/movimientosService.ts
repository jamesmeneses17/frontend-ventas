// components/services/movimientosService.ts

/**
 * ----------------------------------------------------
 * 1. TIPOS DE DATOS (Interfaces)
 * ----------------------------------------------------
 */

// Tipos fijos para el movimiento (coinciden con la lógica del formulario)
export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'GASTO';

// Interface base para un movimiento de caja
export interface MovimientoCaja {
    id: number;
    fecha: string; // YYYY-MM-DD
    tipo_movimiento: TipoMovimiento;
    concepto: string;
    monto: number;
    // Campos de auditoría (opcional)
    creado_por?: string;
    fecha_creacion?: string; 
}

// Tipos para crear un nuevo movimiento (no necesita ID)
export type CreateMovimientoData = Omit<MovimientoCaja, 'id' | 'fecha_creacion'>;

// Tipos para actualizar un movimiento (necesita ID y puede ser parcial)
export type UpdateMovimientoData = Partial<Omit<MovimientoCaja, 'id' | 'fecha_creacion'>> & {
    id: number;
};

// Tipo de respuesta para paginación
export interface MovimientosResponse {
    data: MovimientoCaja[];
    total: number;
}


/**
 * ----------------------------------------------------
 * 2. DATOS SIMULADOS (Para que el frontend funcione)
 * ----------------------------------------------------
 */

const DUMMY_DATA: MovimientoCaja[] = [
    { 
        id: 1, 
        fecha: '2025-12-01', 
        tipo_movimiento: 'INGRESO', 
        concepto: 'Venta Diaria Reflector X20', 
        monto: 550000 
    },
    { 
        id: 2, 
        fecha: '2025-12-01', 
        tipo_movimiento: 'GASTO', 
        concepto: 'Pago de servicio de internet', 
        monto: 120000 
    },
    { 
        id: 3, 
        fecha: '2025-12-02', 
        tipo_movimiento: 'EGRESO', 
        concepto: 'Compra a Proveedor de Cableado', 
        monto: 850000 
    },
];

let nextId = DUMMY_DATA.length + 1;


/**
 * ----------------------------------------------------
 * 3. FUNCIONES DEL SERVICIO (Simuladas)
 * ----------------------------------------------------
 */

// Función auxiliar para simular la demora de la red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Obtiene la lista de movimientos de caja con paginación, búsqueda y filtros.
 * @param page Página actual
 * @param size Cantidad por página
 * @param tipoFiltro Filtrar por 'INGRESO', 'EGRESO', 'GASTO'
 * @param searchTerm Buscar por concepto
 */
export async function getMovimientosCaja(
    page: number = 1, 
    size: number = 10, 
    tipoFiltro: string = '', 
    searchTerm: string = ''
): Promise<MovimientosResponse> {
    await delay(500); // Simula la carga

    let filteredData = DUMMY_DATA.slice();

    // Filtro por tipo de movimiento
    if (tipoFiltro) {
        filteredData = filteredData.filter(item => item.tipo_movimiento === tipoFiltro);
    }
    
    // Filtro por término de búsqueda (concepto)
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => 
            item.concepto.toLowerCase().includes(lowerSearchTerm)
        );
    }

    const total = filteredData.length;
    const start = (page - 1) * size;
    const end = start + size;
    const data = filteredData.slice(start, end);

    return { data, total };
}


/**
 * Crea un nuevo movimiento de caja.
 */
export async function createMovimiento(data: CreateMovimientoData): Promise<MovimientoCaja> {
    await delay(300); // Simula la carga

    // Generar nuevo ID y fecha de creación
    const nuevoMovimiento: MovimientoCaja = {
        ...data,
        id: nextId++,
        fecha_creacion: new Date().toISOString(),
        // Asegurar que la fecha sea YYYY-MM-DD
        fecha: data.fecha || new Date().toISOString().split('T')[0], 
    };
    
    // Agregar a la lista simulada
    DUMMY_DATA.push(nuevoMovimiento);
    console.log("[Service] Movimiento Creado:", nuevoMovimiento);

    return nuevoMovimiento;
}


/**
 * Actualiza un movimiento de caja existente.
 */
export async function updateMovimiento(data: UpdateMovimientoData): Promise<MovimientoCaja> {
    await delay(300); // Simula la carga

    const index = DUMMY_DATA.findIndex(item => item.id === data.id);

    if (index === -1) {
        throw new Error("Movimiento no encontrado para actualizar.");
    }

    // Aplicar la actualización parcial y asegurar la fecha
    DUMMY_DATA[index] = { 
        ...DUMMY_DATA[index], 
        ...data,
        fecha: data.fecha || DUMMY_DATA[index].fecha,
    };
    
    console.log("[Service] Movimiento Actualizado:", DUMMY_DATA[index]);

    return DUMMY_DATA[index];
}


/**
 * Elimina un movimiento de caja.
 */
export async function deleteMovimiento(id: number): Promise<void> {
    await delay(300); // Simula la carga

    const initialLength = DUMMY_DATA.length;
    const newLength = DUMMY_DATA.filter(item => item.id !== id).length;

    if (newLength === initialLength) {
        throw new Error("Movimiento no encontrado para eliminar.");
    }
    // Reemplazar la lista de datos simulados
    // En un caso real, esto sería una llamada DELETE al backend
    (DUMMY_DATA as MovimientoCaja[]) = DUMMY_DATA.filter(item => item.id !== id);
    console.log(`[Service] Movimiento ${id} Eliminado.`);
}
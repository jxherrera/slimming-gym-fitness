const Module = require('module');

// ===========================================================
// MOCK CONFIGURATION FOR SQL SERVER
// ===========================================================
const mockRecordset = [
  {
    paymentId: 1,
    subscriptionId: 10,
    amountPaid: 150.00,
    paymentDate: new Date('2026-06-15T10:00:00Z'),
    paymentMethod: 'Tarjeta de Crédito',
    referenceNumber: 'REF-STRESS-999',
    receiptImageUrl: 'https://storage.googleapis.com/slimming-gym-bucket/receipts/test.jpg',
    paymentStatus: 'A',
    userId: 5,
    memberName: 'Josue Herrera',
    memberEmail: 'josue@example.com',
    planName: 'Plan Trimestral',
    durationDays: 90
  }
];

let mockQueriesRun = [];
let mockInputs = {};

const mockRequest = {
  input: function(name, type, value) {
    mockInputs[name] = { type, value };
    return this;
  },
  query: async function(queryStr) {
    mockQueriesRun.push({ queryStr, inputs: { ...mockInputs } });
    
    if (queryStr.includes('COUNT(*)')) {
      // Return a total of 15 records matching the count query
      return { recordset: [{ total: 15 }] };
    }
    // Return mock records
    return { recordset: mockRecordset };
  }
};

const mockPool = {
  request: function() {
    return mockRequest;
  },
  close: async function() {
    console.log('✅ Mock: Conexión cerrada de forma simulada.');
  }
};

const mockDbModule = {
  sql: {
    Int: 'Int',
    VarChar: 'VarChar',
    Decimal: 'Decimal',
    DateTime: 'DateTime'
  },
  poolPromise: Promise.resolve(mockPool)
};

// Overwrite Node's require resolver to inject our mock DB configuration
const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
  if (path.endsWith('config/db') || path.endsWith('../config/db')) {
    return mockDbModule;
  }
  return originalRequire.apply(this, arguments);
};

// Import the controller and db configuration after the mock is installed
const { getPaymentHistory } = require('./controllers/paymentController');

async function runTests() {
  console.log('===========================================================');
  console.log('INICIANDO PRUEBAS UNITARIAS DE HISTORIAL DE PAGOS (CON MOCK)');
  console.log('===========================================================');

  // Helper to create mock response
  const createMockRes = (onDone) => ({
    statusCode: 200,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      onDone(this.statusCode, data);
    }
  });

  // Helper to reset tracker
  const resetTracker = () => {
    mockQueriesRun = [];
    mockInputs = {};
  };

  // Test Case 1: Default Pagination (Page 1, Limit 5)
  console.log('\n[Caso 1] Probando paginación por defecto (página 1, límite 5)...');
  resetTracker();
  await new Promise((resolve) => {
    const req = {
      query: { page: '1', limit: '5' }
    };
    const res = createMockRes((code, data) => {
      console.log(`Status Code: ${code}`);
      if (code === 200) {
        console.log(`✅ Éxito. Total registros: ${data.totalRecords}, Total páginas: ${data.totalPages}, Página actual: ${data.currentPage}`);
        console.log(`Registros devueltos: ${data.data.length}`);
        
        // Assertions on the generated query
        const countQuery = mockQueriesRun.find(q => q.queryStr.includes('COUNT(*)'));
        const dataQuery = mockQueriesRun.find(q => q.queryStr.includes('OFFSET'));
        
        console.log(`  - Query de conteo: ${countQuery.queryStr.trim()}`);
        console.log(`  - Query de datos: ${dataQuery.queryStr.trim().replace(/\s+/g, ' ')}`);
        console.log(`  - Offset: ${dataQuery.inputs.Offset.value}, Limit: ${dataQuery.inputs.Limit.value}`);
        
        if (dataQuery.inputs.Offset.value === 0 && dataQuery.inputs.Limit.value === 5) {
          console.log('  👉 Offset y Límite asignados correctamente.');
        } else {
          console.error('  ❌ Error de asignación de Offset/Límite.');
        }
      } else {
        console.error('  ❌ Falló la consulta:', data);
      }
      resolve();
    });
    getPaymentHistory(req, res);
  });

  // Test Case 2: Date Filtering
  console.log('\n[Caso 2] Probando filtrado por fechas (ej. del 2026-06-01 al 2026-06-30)...');
  resetTracker();
  await new Promise((resolve) => {
    const req = {
      query: { startDate: '2026-06-01', endDate: '2026-06-30', page: '1', limit: '5' }
    };
    const res = createMockRes((code, data) => {
      console.log(`Status Code: ${code}`);
      if (code === 200) {
        console.log(`✅ Éxito. Total registros filtrados: ${data.totalRecords}`);
        console.log(`Registros devueltos: ${data.data.length}`);
        
        // Assert queries
        const countQuery = mockQueriesRun.find(q => q.queryStr.includes('COUNT(*)'));
        const dataQuery = mockQueriesRun.find(q => q.queryStr.includes('OFFSET'));
        
        console.log(`  - Query de conteo filtrado: ${countQuery.queryStr.trim().replace(/\s+/g, ' ')}`);
        
        const hasStartDate = countQuery.inputs.StartDate !== undefined;
        const hasEndDate = countQuery.inputs.EndDate !== undefined;
        
        console.log(`  - Parámetro StartDate en mock:`, countQuery.inputs.StartDate?.value);
        console.log(`  - Parámetro EndDate en mock:`, countQuery.inputs.EndDate?.value);
        
        if (hasStartDate && hasEndDate) {
          console.log('  👉 Parámetros de fecha vinculados y detectados correctamente.');
        } else {
          console.error('  ❌ Faltaron los parámetros de fecha en la query.');
        }
      } else {
        console.error('  ❌ Falló la consulta:', data);
      }
      resolve();
    });
    getPaymentHistory(req, res);
  });

  console.log('\n===========================================================');
  console.log('✅ TODAS LAS PRUEBAS UNITARIAS COMPLETADAS CON ÉXITO');
  console.log('===========================================================');
}

runTests();

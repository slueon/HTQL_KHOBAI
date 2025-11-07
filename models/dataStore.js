// In-memory data store (sẽ thay thế bằng database sau này)
let dataStore = {
  products: [],
  locations: [],
  suppliers: [],
  customers: [],
  receipts: [],
  issues: [],
  stock: [], // Stock entries by product and location
  users: [],
  vehicles: [],
  vehicleLogs: []
};

// Helper functions to generate IDs
let idCounter = {
  products: 1,
  locations: 1,
  suppliers: 1,
  customers: 1,
  receipts: 1,
  issues: 1,
  stock: 1,
  users: 1,
  vehicles: 1,
  vehicleLogs: 1
};

function generateId(type) {
  return idCounter[type]++;
}

module.exports = {
  dataStore,
  generateId
};


const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read/write data
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// List all vehicles
app.get('/', (req, res) => {
  const vehicles = readData();
  res.render('index', { vehicles });
});

// Show form to add vehicle
app.get('/add', (req, res) => {
  res.render('form', { vehicle: null });
});

// Add vehicle
app.post('/add', (req, res) => {
  const vehicles = readData();
  const { vechilename, price, image, desc, brand } = req.body;
  vehicles.push({ id: Date.now(), vechilename, price, image, desc, brand });
  writeData(vehicles);
  res.redirect('/');
});

// Show form to edit vehicle
app.get('/edit/:id', (req, res) => {
  const vehicles = readData();
  const vehicle = vehicles.find(v => v.id == req.params.id);
  res.render('form', { vehicle });
});

// Update vehicle
app.post('/edit/:id', (req, res) => {
  const vehicles = readData();
  const idx = vehicles.findIndex(v => v.id == req.params.id);
  if (idx !== -1) {
    vehicles[idx] = { ...vehicles[idx], ...req.body };
    writeData(vehicles);
  }
  res.redirect('/');
});

// Delete vehicle
app.post('/delete/:id', (req, res) => {
  let vehicles = readData();
  vehicles = vehicles.filter(v => v.id != req.params.id);
  writeData(vehicles);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// Random driver data generator
const firstNames = ['გიორგი', 'დავით', 'ნიკოლოზ', 'ზურაბ', 'თემურ', 'ლევან', 'მიხეილ', 'ალექსანდრე', 'ირაკლი', 'გია'];
const lastNames = ['გიორგაძე', 'ივანიშვილი', 'ბერიძე', 'კახიანი', 'მელაძე', 'ჩხეიძე', 'ხარაძე', 'აბაშიძე', 'გაბიძე', 'თავაძე'];

const carMakes = ['Mercedes', 'BMW', 'Volkswagen', 'Toyota', 'Hyundai', 'Kia', 'Nissan', 'Ford', 'Opel', 'Renault'];
const carModels = ['E-Class', '3 Series', 'Golf', 'Camry', 'Elantra', 'Rio', 'Sentra', 'Focus', 'Astra', 'Megane'];

const colors = ['თეთრი', 'თეთრი', 'თეთრი', 'თეთრი', 'თეთრი', 'თეთრი', 'თეთრი', 'თეთრი', 'თეთრი', 'თეთრი'];

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomLicense() {
  const letters = ['AB', 'CD', 'EF', 'GH'];
  const numbers = getRandomNumber(100, 999);
  return `${getRandomItem(letters)}-${numbers}-${getRandomItem(letters)}`;
}

function getRandomLocation() {
  // Tbilisi coordinates with some randomness
  const baseLat = 41.7151;
  const baseLng = 44.8271;
  return {
    lat: baseLat + (Math.random() - 0.5) * 0.05,
    lng: baseLng + (Math.random() - 0.5) * 0.05
  };
}

export function generateRandomDrivers(count: number = 5) {
  const drivers = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const carMake = getRandomItem(carMakes);
    const carModel = getRandomItem(carModels);
    
    drivers.push({
      id: `random-driver-${i + 1}`,
      user_id: `random-driver-${i + 1}`,
      full_name: `${firstName} ${lastName}`,
      phone: `+995${getRandomNumber(500, 599)}${getRandomNumber(10, 99)}${getRandomNumber(10, 99)}`,
      license_number: getRandomLicense(),
      car_make: carMake,
      car_model: carModel,
      car_year: getRandomNumber(2010, 2023),
      car_color: getRandomItem(colors),
      license_plate: getRandomLicense(),
      is_online: Math.random() > 0.3, // 70% chance to be online
      is_busy: false,
      current_location: getRandomLocation(),
      rating: 4.5 + Math.random() * 0.5, // 4.5 to 5.0
      total_trips: getRandomNumber(10, 500)
    });
  }
  
  return drivers;
}

export function updateRandomDriverLocation(driver: any) {
  // Simulate movement by slightly changing location
  const currentLocation = driver.current_location || getRandomLocation();
  return {
    ...driver,
    current_location: {
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.001,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.001
    }
  };
}

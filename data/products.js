// Product images mapped from local assets
const IMAGES = {
  habanero:     require('@/assets/images/habanero.jpg'),
  avocado:      require('@/assets/images/avocado.jpg'),
  beans:        require('@/assets/images/beans.jpg'),
  macadamia:    require('@/assets/images/macadamia.jpg'),
  tomatoes:     require('@/assets/images/tomatoes.jpg'),
  coffee:       require('@/assets/images/coffee.jpg'),
  passion:      require('@/assets/images/passion-fruit.jpg'),
  mangoes:      require('@/assets/images/mangoes.jpg'),
  maize:        require('@/assets/images/maize.jpg'),
  teja:         require('@/assets/images/teja.jpg'),
};

const products = [
  { id: '1',  code: '16F001.2026', name: 'Habanero',      category: 'Vegetables', quantity: 200,  unit: 'Kg', period: 'Week', price: 1500, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.habanero,  description: 'Fresh Habanero peppers grown in the fertile highlands of Rwanda. Ideal for export and local spice markets.',     location: 'Northern Province, Rwanda' },
  { id: '2',  code: '16F002.2026', name: 'Avocado Hass',  category: 'Fruits',     quantity: 10,   unit: 'T',  period: 'Week', price: 1200, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.avocado,   description: 'Premium Hass Avocados with rich, creamy texture. Grown under optimal conditions in Rwanda.',                  location: 'Western Province, Rwanda' },
  { id: '3',  code: '16F003.2026', name: 'French Beans',  category: 'Vegetables', quantity: 8,    unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.beans,     description: 'High-quality French Beans grown for export markets.',                                                         location: 'Southern Province, Rwanda' },
  { id: '4',  code: '16F004.2026', name: 'Macadamia',     category: 'Nuts',       quantity: null, unit: null, period: null,   price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.macadamia, description: 'Premium Macadamia nuts sourced from Rwandan farms.',                                                           location: 'Rwanda' },
  { id: '5',  code: '16F005.2026', name: 'Inyanya',       category: 'Vegetables', quantity: null, unit: null, period: null,   price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.tomatoes,  description: 'Fresh tomatoes grown locally in Rwanda.',                                                                      location: 'Rwanda' },
  { id: '6',  code: '16F006.2026', name: 'Maize',         category: 'Cereals',    quantity: null, unit: null, period: null,   price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.maize,     description: 'Quality maize grain sourced from Rwandan farmers.',                                                            location: 'Rwanda' },
  { id: '7',  code: '16F007.2026', name: 'Passion Fruit', category: 'Fruits',     quantity: 6,    unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.passion,   description: 'Fresh passion fruit with vibrant aroma and flavor.',                                                          location: 'Eastern Province, Rwanda' },
  { id: '8',  code: '16F008.2026', name: 'Coffee',        category: 'Cash Crops', quantity: 50,   unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.coffee,    description: 'Premium Rwandan coffee beans, world-renowned for their bright acidity.',                                      location: 'Rwanda' },
  { id: '9',  code: '16F009.2026', name: 'Avocado Hass',  category: 'Fruits',     quantity: 50,   unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.avocado,   description: 'Large batch Hass Avocados available for export orders.',                                                       location: 'Rwanda' },
  { id: '10', code: '16F010.2026', name: 'French Beans',  category: 'Vegetables', quantity: 5,    unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.beans,     description: 'Export-grade French Beans.',                                                                                   location: 'Rwanda' },
  { id: '11', code: '16F011.2026', name: 'Teja',          category: 'Chillies',   quantity: 100,  unit: 'Kg', period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.teja,      description: 'Teja chilli peppers with excellent color and pungency.',                                                       location: 'Rwanda' },
  { id: '12', code: '16F012.2026', name: 'Habanero',      category: 'Vegetables', quantity: 500,  unit: 'Kg', period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.habanero,  description: 'Large quantity of fresh Habanero peppers available weekly.',                                                   location: 'Rwanda' },
  { id: '13', code: '16F013.2026', name: 'Mangoes',       category: 'Fruits',     quantity: 30,   unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.mangoes,   description: 'Sweet and juicy Rwandan mangoes in season.',                                                                   location: 'Eastern Province, Rwanda' },
  { id: '14', code: '16F014.2026', name: 'French Beans',  category: 'Vegetables', quantity: 5,    unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.beans,     description: 'Fresh French Beans for weekly supply.',                                                                        location: 'Rwanda' },
  { id: '15', code: '16F015.2026', name: 'Avocado',       category: 'Fruits',     quantity: 20,   unit: 'T',  period: 'Week', price: null, currency: 'RWF', priceUnit: 'Kg', status: 'available', image: IMAGES.avocado,   description: 'Fresh Avocados sourced from Rwandan farmers.',                                                                 location: 'Rwanda' },
];

export default products;

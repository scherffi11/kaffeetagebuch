// Vorschläge beim Anlegen einer Packung: Röstereien in der Nähe, große Online-Röster und Supermarkt-Marken.
// Stand der Sorten: 15. November 2026, aus den Online-Shops der Röstereien. Sortimente wechseln, deshalb nur Vorschläge.
// t: f = Filter, e = Espresso, fe = beides
export const ROASTERS = [
  // Bochum und Umgebung
  { name: 'Three Years One Day', city: 'Bochum', place: 'Three Years One Day, Bochum-Weitmar', local: true, coffees: [] },
  { name: 'RöstART', city: 'Bochum', place: 'RöstART, Bochum Innenstadt', local: true, coffees: [
    { n: 'Espresso BOulevard', t: 'e' }, { n: 'Espresso Nr. 1', t: 'e' }, { n: 'Espresso Reinstoff', t: 'e' }, { n: 'Espresso Ruhrgold', t: 'e' },
    { n: 'Yemen Mocca Matari', o: 'Jemen' }, { n: 'Äthiopien Sidamo Daye Bensa', o: 'Äthiopien' }, { n: 'Äthiopien Yirgacheffe', o: 'Äthiopien' },
    { n: 'Äthiopien Harrar Longberry', o: 'Äthiopien' }, { n: 'Brasilien Sao Silvestre', o: 'Brasilien' }, { n: 'Guatemala Los Volcanes', o: 'Guatemala' },
    { n: 'Guatemala Pasajquim Kape', o: 'Guatemala' }, { n: 'Nicaragua El Encanto', o: 'Nicaragua' }, { n: 'Indien Monsooned Malabar', o: 'Indien' },
    { n: 'Brasilien Santos entkoffeiniert', o: 'Brasilien' }
  ] },
  { name: 'Baristoteles', city: 'Bochum', place: 'Baristoteles, Bochum', local: true, coffees: [] },
  { name: 'Coffee Pirates', city: 'Essen', place: 'Coffee Pirates, Essen', local: true, coffees: [
    { n: 'Heimathafen Espresso', t: 'e' }, { n: 'Pirates Blend Espresso', t: 'e' }, { n: '50/50 Espresso', t: 'e' },
    { n: 'Ruhrpott Röstung', t: 'e', o: '100 % Robusta' }, { n: 'Buna Espresso', t: 'e', o: 'Äthiopien, Sidamo' },
    { n: 'Orang Utan Sumatra Espresso', t: 'e', o: 'Indonesien, Sumatra' }, { n: 'Brasilien Cemorrado', t: 'fe', o: 'Brasilien' },
    { n: 'Andenkaffee', t: 'fe' }, { n: 'Äthiopien Yirgacheffe Kurume', t: 'f', o: 'Äthiopien, Natural' },
    { n: 'Peru Pacha Mama', t: 'f', o: 'Peru, Chanchamayo' }, { n: 'Guatemala Golden Flakes of Jumay', t: 'f', o: 'Guatemala' },
    { n: 'Indien Monsooned Malabar', t: 'f', o: 'Indien' }, { n: 'Decaf Kolumbien Excelso', t: 'e', o: 'Kolumbien, entkoffeiniert' },
    { n: 'El Salvador Finca El Corozo Honey', o: 'El Salvador, Honey' }
  ] },
  { name: 'Bohnenkartell', city: 'Essen', place: 'Bohnenkartell, Essen', local: true, coffees: [] },
  { name: 'Neues Schwarz', city: 'Dortmund', place: 'Neues Schwarz, Dortmund', local: true, coffees: [
    { n: 'classic', t: 'e' }, { n: 'season', t: 'e' }, { n: 'cruzeiro', t: 'fe' }, { n: 'de caña', t: 'fe' }, { n: 'edwin & luz', t: 'fe' },
    { n: 'halo', t: 'fe' }, { n: 'halo beriti', t: 'fe', o: 'Äthiopien' }, { n: 'haru wachu', t: 'fe' }, { n: 'juanachute', t: 'fe' },
    { n: 'kebede wako', t: 'fe', o: 'Äthiopien' }, { n: 'la pila & neighbours', t: 'fe' }, { n: 'las mercedes washed', t: 'f' },
    { n: 'leticia cruz', t: 'fe' }, { n: 'rodolfo garcia', t: 'fe' }, { n: 'rugori', t: 'fe', o: 'Ruanda' }, { n: 'sítio dos cedros', t: 'fe', o: 'Brasilien' },
    { n: 'unión progreso', t: 'fe' }
  ] },
  // Online
  { name: 'Bohnendealer', city: 'Online-Shop', place: 'Online, bohnendealer.coffee', coffees: [
    { n: 'Monsooned Malabar', t: 'e', o: 'Indien' }, { n: 'India Espresso', t: 'e', o: 'Indien' }, { n: 'Paris Espresso', t: 'e' }, { n: 'Siena Espresso', t: 'e' },
    { n: 'Vienna Crema', t: 'e' }, { n: 'Amicizia Espresso', t: 'e' }, { n: 'Amadeus 4', t: 'e' }, { n: 'Light of Africa', t: 'e' },
    { n: 'Indianapoli', t: 'e' }, { n: 'Calmio Decaf', t: 'e', o: 'entkoffeiniert' }, { n: 'Samba!' }, { n: 'Münchendorf' },
    { n: 'Lima Specialty', o: 'Peru' }, { n: 'Happy Accident', o: 'Röstunfall, aber lecker' }, { n: 'Admira Wacker Fankaffee' }
  ] },
  { name: 'Kaffeemacher', city: 'Basel', place: 'Online, kaffeemacher.ch', coffees: [
    { n: 'Compadre', t: 'e', o: 'italienischer Espresso' }, { n: 'Mano', t: 'e', o: 'Espresso Blend' }, { n: 'Dreispitz', t: 'e', o: 'Espresso Blend' },
    { n: 'El Botón', t: 'e', o: 'für den Vollautomaten' }, { n: 'Amigo', t: 'f', o: 'Filterkaffee' }, { n: 'Apas', t: 'e', o: 'Brasilien' },
    { n: 'Toca', t: 'e', o: 'Mexiko' }, { n: 'Komal', t: 'e', o: 'Indien' }, { n: 'Bharath', t: 'e', o: 'Indien' }, { n: 'Shyira', t: 'e', o: 'Ruanda' },
    { n: 'La Conserva', t: 'e', o: 'Guatemala' }, { n: 'Flhor', o: 'Honduras' }, { n: 'Ichamama', t: 'f', o: 'Kenia' }, { n: 'San Lucas', t: 'f', o: 'Mexiko' },
    { n: 'Alejandro', t: 'f', o: 'Mexiko' }, { n: 'Sueño Decaf', t: 'e', o: 'Mexiko, entkoffeiniert' }, { n: 'Suke Quto Decaf', t: 'e', o: 'Äthiopien, entkoffeiniert' }
  ] },
  { name: '19grams', city: 'Berlin', place: 'Online, 19grams.coffee', coffees: [
    { n: 'Copacabana', t: 'e', o: 'Brasilien' }, { n: 'Bombe', t: 'fe', o: 'Äthiopien' }, { n: 'El Vergel', t: 'fe', o: 'Kolumbien' },
    { n: 'Aponte', t: 'fe', o: 'Kolumbien' }, { n: 'Los Planes', t: 'fe', o: 'Honduras' }, { n: 'Simbi Honey', t: 'fe', o: 'Ruanda' },
    { n: 'Finca Naranjal', t: 'fe', o: 'Peru' }, { n: 'Chelchele Natural', t: 'fe', o: 'Äthiopien' }, { n: 'Kianjiru', t: 'fe', o: 'Kenia' },
    { n: 'Los Tres Potros Cuscatleco', t: 'fe', o: 'El Salvador' }, { n: 'Hachi', t: 'f', o: 'Kolumbien' }, { n: 'La Divisa', t: 'f', o: 'Kolumbien' },
    { n: 'Santa Cecilia Greenhouse Natural', t: 'f', o: 'Brasilien' }, { n: 'DUSK Decaf', t: 'f', o: 'entkoffeiniert' }
  ] },
  { name: 'The Barn', city: 'Berlin', place: 'Online, thebarn.de', coffees: [
    { n: 'Elemental Coffee', t: 'e' }, { n: 'Atlas Coffee', t: 'e' }, { n: 'Caballero Black Edition', t: 'e' }, { n: 'La Colina Washed', t: 'e' },
    { n: 'Los Naranjales', t: 'e' }, { n: 'El Salitre', t: 'e' }, { n: 'Inku', t: 'e' }, { n: 'Decaf Balanced', t: 'e', o: 'entkoffeiniert' },
    { n: 'Genesis Coffee', t: 'f' }, { n: 'Santa Teresa', t: 'f' }, { n: 'Bekele Kechara', t: 'f', o: 'Äthiopien' }, { n: 'Chelbesa', t: 'f', o: 'Äthiopien' },
    { n: 'Gatomboya AA', t: 'f', o: 'Kenia' }, { n: 'Halo Beriti', t: 'f', o: 'Äthiopien' }, { n: 'Sundrop', t: 'f' }
  ] },
  { name: 'Bonanza', city: 'Berlin', place: 'Online, bonanzacoffee.de', coffees: [
    { n: 'Gogogu', o: 'Äthiopien' }, { n: 'Gogogu Decaf', o: 'entkoffeiniert' }, { n: 'Bonanza Blend' }, { n: 'Dark Roast' }, { n: 'Jaguarundi' },
    { n: 'El Martillo' }, { n: 'Los Nogales' }, { n: 'La Nueva Montaña' }, { n: 'Das Almas', o: 'Brasilien' }, { n: 'AB Kithungururu', o: 'Kenia' }, { n: 'Almibar' }
  ] },
  { name: 'Coffee Circle', city: 'Berlin', place: 'Online, coffeecircle.com', coffees: [] },
  { name: 'Elbgold', city: 'Hamburg', place: 'Online, elbgold.com', coffees: [] },
  { name: 'Hoppenworth & Ploch', city: 'Frankfurt', place: 'Online, hoppenworth-ploch.de', coffees: [] },
  { name: 'roastmarket', city: 'Online-Händler', place: 'Online, roastmarket.de', coffees: [] }
];

// Für „Supermarkt“: nur Marken, ohne Sorten
export const BRANDS = ['Tchibo', 'Lavazza', 'Dallmayr', 'Jacobs', 'Segafredo', 'Melitta', 'Eduscho', 'Mövenpick', 'Barissimo (Aldi)', 'Bellarom (Lidl)', 'GEPA', 'Starbucks', 'Kimbo', 'illy'];

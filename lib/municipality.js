const PARISHES = {
  Lisboa: ['lisboa', 'lisbon', 'laranjeiras', 'benfica', 'marvila', 'olivais', 'lumiar', 'alvalade', 'areeiro', 'campolide', 'carnide', 'ajuda', 'alcantara', 'beato', 'graca', 'mouraria', 'arroios', 'anjos', 'penha de franca', 'sao domingos de benfica'],
  Odivelas: ['odivelas', 'pontinha', 'famoes', 'ramada', 'canecas', 'povoa de santo adriao', 'olival basto'],
  Amadora: ['amadora', 'alfragide', 'brandoa', 'venda nova', 'alfornelos', 'buraca', 'reboleira', 'damaia', 'falagueira', 'venteira', 'mina de agua', 'esquerdoamadora'],
  Sintra: ['sintra', 'queluz', 'agualva-cacem', 'agualva cacem', 'cacem', 'rio de mouro', 'belas', 'algueirao-mem martins', 'algueirao', 'mem martins', 'pero pinheiro', 'terrugem', 'casal de cambra', 'rinchoa', 'sao joao das lampas', 'montelavar', 'colares', 'massama', 'monte abraao', 'almargem do bispo', 'almargem do bpo.', 'idanha', 'morelena'],
  Loures: ['loures', 'santo antonio dos cavaleiros', 'sacavem', 'prior velho', 'bobadela', 'camarate', 'santa iria de azoia', 'santa iria da azoia', 'sao joao da talha', 'moscavide', 'unhos', 'apelacao', 'frielas', 'portela', 'santo antao do tojal', 'sao juliao do tojal', 'fanhoes', 'bucelas', 'lousa', 'infantado', 'flamenga'],
  'Vila Franca de Xira': ['vila franca de xira', 'vila franca xira', 'alverca do ribatejo', 'alverca', 'povoa de santa iria', 'povoa santa iria', 'forte da casa', 'vialonga', 'alhandra', 'sobralinho', 'castanheira do ribatejo', 'calhandriz', 'cachoeiras', 'sao joao dos montes'],
  Oeiras: ['oeiras', 'carnaxide', 'alges', 'linda-a-velha', 'linda a velha', 'paco de arcos', 'porto salvo', 'barcarena', 'queijas', 'caxias', 'cruz quebrada', 'dafundo'],
  Almada: ['almada', 'costa de caparica', 'charneca de caparica', 'caparica', 'monte de caparica', 'pragal', 'cacilhas', 'laranjeiro', 'feijo', 'sobreda', 'trafaria', 'cova da piedade', 'pinhal de frades'],
  Seixal: ['seixal', 'amora', 'corroios', 'arrentela', 'fernao ferro', 'paio pires', 'cruz de pau', 'santa marta do pinhal', 'miratejo', 'foros de amora', 'pinhal do general'],
  Barreiro: ['barreiro', 'lavradio', 'palhais', 'coina', 'santo antonio da charneca', 'verderena', 'alto do seixalinho', 'quinta da lomba', 'santo andre'],
  Moita: ['moita', 'baixa da banheira', 'alhos vedros', 'vale da amoreira', 'gaio-rosario', 'gaio rosario', 'sarilhos pequenos', 'penteado'],
  Montijo: ['montijo', 'sarilhos grandes', 'afonsoeiro', 'atalaia', 'canha', 'pegoes', 'santo isidro de pegoes'],
  Setubal: ['setubal', 'azeitao', 'vila nogueira de azeitao', 'vila fresca de azeitao', 'brejos de azeitao', 'sao lourenco', 'sao simao', 'gambia', 'faralhao', 'praias do sado', 'alto da guerra', 'manteigadas', 'brejos'],
  Cascais: ['cascais', 'estoril', 'alcabideche', 'carcavelos', 'parede', 'sao domingos de rana', 'birre', 'tires', 'abobada', 'manique', 'murches', 'malveira da serra'],
  Palmela: ['palmela', 'q.ta do anjo', 'quinta do anjo', 'pinhal novo', 'aires', 'poceirao', 'marateca', 'cabanas'],
  Odemira: ['odemira', 's.teotonio', 's. teotonio', 'sao teotonio', 'sao teotonio odemira', 'zambujeira do mar', 'vila nova de milfontes', 'sao luis', 'colos', 'azenha do mar', 'boavista dos pinheiros', 'sao martinho das amoreiras', 'almograve', 'longueira', 'reliquias', 'saboia', 'luzianes', 'vale de santiago', 'pereiras-gare', 'malhao pardo', 'cavaleiro', 'brunheiras'],
};

const OUTSIDE = {
  Beja: ['beja'],
  Aljezur: ['odeceixe', 'aljezur', 'rogil'],
  Silves: ['armacao de pera'],
};

const LOOKUP = new Map();
Object.entries(PARISHES).forEach(([town, names]) => names.forEach((n) => LOOKUP.set(n, town)));
Object.entries(OUTSIDE).forEach(([town, names]) => names.forEach((n) => LOOKUP.set(n, `~${town}`)));

export const norm = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

export const locality = (address) => {
  const m = /(\d{4}-\d{3})\s+([^,]+),\s*Portugal\s*$/i.exec(address || '');
  return m ? m[2].trim() : null;
};

export const townFromName = (name) => LOOKUP.get(norm(name)) ?? null;

export const townFromAddress = (address) => {
  const loc = locality(address);
  if (!loc) return null;
  return townFromName(loc);
};

export const TRACKED = Object.keys(PARISHES);

export default { norm, locality, townFromName, townFromAddress, TRACKED };

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
  Porto: ['porto', 'oporto', 'foz do douro', 'bonfim', 'campanha', 'paranhos', 'ramalde', 'cedofeita', 'massarelos', 'lordelo do ouro', 'aldoar', 'nevogilde', 'santo ildefonso', 'miragaia'],
  'Vila Nova de Gaia': ['vila nova de gaia', 'v. n. gaia', 'v.n. gaia', 'vn gaia', 'gaia', 'mafamude', 'vilar do paraiso', 'vilar de paraiso', 'santa marinha', 'afurada', 'sao pedro da afurada', 'oliveira do douro', 'canidelo', 'vilar de andorinho', 'avintes', 'pedroso', 'seixezelo', 'grijo', 'sermonde', 'serzedo', 'perosinho', 'sandim', 'olival', 'lever', 'crestuma', 'arcozelo', 'canelas', 'madalena', 'sao felix da marinha', 's. felix da marinha', 'gulpilhares', 'valadares'],
  Matosinhos: ['matosinhos', 'leca da palmeira', 'leca do balio', 'custoias', 'guifoes', 'sao mamede de infesta', 's. mamede de infesta', 'senhora da hora', 'sra. da hora', 'sra da hora', 'perafita', 'lavra', 'santa cruz do bispo'],
  Maia: ['maia', 'aguas santas', 'pedroucos', 'gueifaes', 'vermoim', 'milheiros', 'moreira', 'moreira da maia', 'vila nova da telha', 'nogueira', 'silva escura', 'folgosa', 'sao pedro fins', 'castelo da maia', 'gemunde', 'avioso', 'avioso santa maria', 'avioso sao pedro'],
  'Alcacer do Sal': ['alcacer do sal', 'alcacer', 'comporta', 'torrao', 'sao martinho alcacer', 'santa susana', 'palma', 'barrosinha'],
  'Grandola': ['grandola', 'melides', 'carvalhal', 'azinheira dos barros', 'sao mamede do sadao', 'santa margarida da serra', 'aldeia do futuro', 'brescos'],
  'Santiago do Cacem': ['santiago do cacem', 'vila nova de santo andre', 'v. n. santo andre', 'cercal do alentejo', 'cercal', 'ermidas-sado', 'ermidas sado', 'ermidas do sado', 'vale de agua', 'sao francisco da serra', 'abela', 'sao bartolomeu da serra', 'lagoa de santo andre', 'alvalade sado'],
  'Sines': ['sines', 'porto covo'],
  'Ferreira do Alentejo': ['ferreira do alentejo', 'canhestros', 'alfundao', 'peroguarda', 'figueira dos cavaleiros'],
  'Beja': ['beja', 'baleizao', 'beringel', 'cabeca gorda', 'nossa senhora das neves', 'salvada', 'quintos', 'santa clara de louredo', 'santa vitoria', 'mombeja', 'sao matias', 'trigaches', 'sao brissos', 'albernoa', 'trindade', 'penedo gordo', 'quintos beja'],
  Braga: ['braga'],
  'Guimaraes': ['guimaraes'],
  Gondomar: ['gondomar'],
  Coimbra: ['coimbra'],
  'Santa Maria da Feira': ['santa maria da feira', 'feira'],
  'Vila Nova de Famalicao': ['vila nova de famalicao', 'famalicao'],
  Leiria: ['leiria'],
  Barcelos: ['barcelos'],
  Funchal: ['funchal'],
  Viseu: ['viseu'],
  Valongo: ['valongo'],
  Mafra: ['mafra'],
  'Viana do Castelo': ['viana do castelo'],
  Paredes: ['paredes'],
  'Torres Vedras': ['torres vedras'],
  'Vila do Conde': ['vila do conde'],
  Odemira: ['odemira', 's.teotonio', 's. teotonio', 'sao teotonio', 'sao teotonio odemira', 'zambujeira do mar', 'vila nova de milfontes', 'sao luis', 'colos', 'azenha do mar', 'boavista dos pinheiros', 'sao martinho das amoreiras', 'almograve', 'longueira', 'reliquias', 'saboia', 'luzianes', 'vale de santiago', 'pereiras-gare', 'malhao pardo', 'cavaleiro', 'brunheiras'],
};

const OUTSIDE = {
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

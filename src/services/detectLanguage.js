export const detectLanguage = text => {
  const englishWords = [
    'what',
    'who',
    'when',
    'where',
    'why',
    'how',
    'is',
    'are',
    'do',
    'does',
    'can',
  ];
  const indonesianWords = [
    'apa',
    'siapa',
    'kapan',
    'dimana',
    'mengapa',
    'bagaimana',
    'adalah',
    'apakah',
  ];

  const lowerText = text.toLowerCase();
  const isEnglish = englishWords.some(word => lowerText.includes(word));
  const isIndonesian = indonesianWords.some(word => lowerText.includes(word));

  if (isEnglish && !isIndonesian) return 'en';
  if (isIndonesian && !isEnglish) return 'id';
  return 'id';
};

// kalimat yang sering digunakan
export const stopwordsByLang = {
  id: new Set([
    'apa',
    'yang',
    'untuk',
    'dari',
    'dan',
    'bagaimana',
    'adalah',
    'dengan',
    'di',
    'ke',
    'atau',
    'jika',
    'bisa',
    'saja',
    'sudah',
    'belum',
    'akan',
    'itu',
    'ini',
    'dalam',
    'tentang',
  ]),
  en: new Set([
    'what',
    'is',
    'the',
    'and',
    'how',
    'in',
    'on',
    'to',
    'from',
    'of',
    'does',
    'can',
    'should',
  ]),
};

// persamaan bahasa untuk menyamakan dengan judul doc
export const synonymMapByLang = {
  id: {
    klaim: ['pengajuan klaim', 'ajukan klaim'],
    ajukan: ['pengajuan'],
    perusahaan: ['profil perusahaan'],
    prosedur: ['langkah', 'cara'],
  },
  en: {
    insurance: ['asuransi'],
    company: ['perusahaan'],
    profile: ['profil'],
    claim: ['klaim', 'pengajuan klaim', 'ajukan klaim'],
    file: ['ajukan', 'pengajuan'],
    'file a claim': ['pengajuan klaim', 'ajukan klaim'],
    how: ['cara', 'bagaimana'],
    procedure: ['prosedur', 'langkah', 'cara'],
  },
};

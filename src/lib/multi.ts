/**
 * Multi-allergy card UI strings per language.
 * Allergen names still come from each allergen YAML translation.
 */
export interface MultiStrings {
  /** e.g. "I have severe allergies to:" */
  lead: string;
  /** Severity explanation for multiple allergens. */
  body: string;
  /** Heading above the allergen list. */
  label: string;
  /** Closing question. */
  question: string;
}

const EN: MultiStrings = {
  lead: 'I have severe allergies to:',
  body: 'I cannot eat food containing any of these allergens, even in small amounts, or I will have a severe allergic reaction and require medical attention.',
  label: 'My allergies:',
  question: 'Does this food contain any of these allergens?',
};

/** Drafted multi-card strings; fall back to English when missing. */
const MULTI: Record<string, MultiStrings> = {
  english: EN,
  arabic: {
    lead: 'أعاني من حساسية شديدة تجاه:',
    body: 'لا أستطيع تناول أي طعام يحتوي على أي من هذه المواد المسببة للحساسية، حتى بكميات صغيرة، وإلا سأعاني من رد فعل تحسسي شديد وأحتاج إلى رعاية طبية.',
    label: 'حساسياتي:',
    question: 'هل يحتوي هذا الطعام على أي من هذه المواد المسببة للحساسية؟',
  },
  hebrew: {
    lead: 'יש לי אלרגיה חמורה ל:',
    body: 'איני יכול/ה לאכול מזון המכיל אחד מהאלרגנים האלה, גם בכמות קטנה, אחרת תהיה לי תגובה אלרגית חמורה ואזדקק לטיפול רפואי.',
    label: 'האלרגיות שלי:',
    question: 'האם במזון הזה יש אחד מהאלרגנים האלה?',
  },
  spanish: {
    lead: 'Tengo alergias graves a:',
    body: 'No puedo comer alimentos que contengan cualquiera de estos alérgenos, ni siquiera en pequeñas cantidades, o tendré una reacción alérgica grave y necesitaré atención médica.',
    label: 'Mis alergias:',
    question: '¿Este alimento contiene alguno de estos alérgenos?',
  },
  french: {
    lead: "J'ai des allergies graves à :",
    body: "Je ne peux pas manger d'aliments contenant l'un de ces allergènes, même en petite quantité, sinon j'aurai une réaction allergique grave et j'aurai besoin de soins médicaux.",
    label: 'Mes allergies :',
    question: 'Cet aliment contient-il l’un de ces allergènes ?',
  },
  german: {
    lead: 'Ich habe schwere Allergien gegen:',
    body: 'Ich darf keine Lebensmittel essen, die einen dieser Allergene enthalten – auch nicht in kleinen Mengen – sonst bekomme ich eine schwere allergische Reaktion und brauche medizinische Hilfe.',
    label: 'Meine Allergien:',
    question: 'Enthält dieses Essen eines dieser Allergene?',
  },
  italian: {
    lead: 'Ho gravi allergie a:',
    body: 'Non posso mangiare cibi che contengono uno di questi allergeni, nemmeno in piccole quantità, altrimenti avrò una grave reazione allergica e avrò bisogno di assistenza medica.',
    label: 'Le mie allergie:',
    question: 'Questo cibo contiene uno di questi allergeni?',
  },
  portuguese: {
    lead: 'Tenho alergias graves a:',
    body: 'Não posso comer alimentos que contenham qualquer um destes alergénios, mesmo em pequenas quantidades, ou terei uma reação alérgica grave e precisarei de cuidados médicos.',
    label: 'As minhas alergias:',
    question: 'Este alimento contém algum destes alergénios?',
  },
  'portuguese-brazil': {
    lead: 'Tenho alergias graves a:',
    body: 'Não posso comer alimentos que contenham qualquer um desses alérgenos, mesmo em pequenas quantidades, ou terei uma reação alérgica grave e precisarei de atendimento médico.',
    label: 'Minhas alergias:',
    question: 'Este alimento contém algum desses alérgenos?',
  },
  greek: {
    lead: 'Έχω σοβαρές αλλεργίες σε:',
    body: 'Δεν μπορώ να φάω τρόφιμα που περιέχουν οποιονδήποτε από αυτούς τους αλλεργιογόνους παράγοντες, ακόμη και σε μικρές ποσότητες, αλλιώς θα έχω σοβαρή αλλεργική αντίδραση και θα χρειαστώ ιατρική φροντίδα.',
    label: 'Οι αλλεργίες μου:',
    question: 'Αυτό το φαγητό περιέχει κάποιον από αυτούς τους αλλεργιογόνους παράγοντες;',
  },
  russian: {
    lead: 'У меня тяжёлая аллергия на:',
    body: 'Я не могу есть продукты, содержащие любой из этих аллергенов, даже в небольших количествах, иначе у меня будет тяжёлая аллергическая реакция, и мне потребуется медицинская помощь.',
    label: 'Мои аллергии:',
    question: 'Содержит ли эта еда какой-либо из этих аллергенов?',
  },
  japanese: {
    lead: '私は次のものに重度のアレルギーがあります：',
    body: 'これらのアレルゲンを含む食べ物は、少量でも食べることができません。食べると重いアレルギー反応を起こし、医療処置が必要になります。',
    label: 'アレルギー：',
    question: 'この料理にこれらのアレルゲンは入っていますか？',
  },
  'chinese-simplified': {
    lead: '我对以下物质有严重过敏：',
    body: '我不能吃含有任何这些过敏原的食物，即使是少量也不行，否则会出现严重过敏反应并需要医疗救助。',
    label: '我的过敏：',
    question: '这道食物是否含有这些过敏原中的任何一种？',
  },
  'chinese-traditional': {
    lead: '我對以下物質有嚴重過敏：',
    body: '我不能吃含有任何這些過敏原的食物，即使是少量也不行，否則會出現嚴重過敏反應並需要醫療救助。',
    label: '我的過敏：',
    question: '這道食物是否含有這些過敏原中的任何一種？',
  },
  'chinese-hong-kong': {
    lead: '我對以下物質有嚴重敏感：',
    body: '我不能吃含有任何這些過敏原的食物，即使是少量也不行，否則會出現嚴重過敏反應並需要醫療救助。',
    label: '我的過敏：',
    question: '這道食物是否含有這些過敏原中的任何一種？',
  },
  turkish: {
    lead: 'Şunlara karşı ciddi alerjim var:',
    body: 'Bu alerjenlerden herhangi birini içeren yiyecekleri, küçük miktarda bile olsa yiyemem; aksi halde ciddi bir alerjik reaksiyon geçirir ve tıbbi yardıma ihtiyaç duyarım.',
    label: 'Alerjilerim:',
    question: 'Bu yiyecek bu alerjenlerden herhangi birini içeriyor mu?',
  },
  dutch: {
    lead: 'Ik heb ernstige allergieën voor:',
    body: 'Ik kan geen voedsel eten dat een van deze allergenen bevat, zelfs niet in kleine hoeveelheden, anders krijg ik een ernstige allergische reactie en heb ik medische hulp nodig.',
    label: 'Mijn allergieën:',
    question: 'Bevat dit eten een van deze allergenen?',
  },
  polish: {
    lead: 'Mam ciężkie alergie na:',
    body: 'Nie mogę jeść potraw zawierających którykolwiek z tych alergenów, nawet w małych ilościach - inaczej wystąpi u mnie ciężka reakcja alergiczna i będę potrzebować pomocy medycznej.',
    label: 'Moje alergie:',
    question: 'Czy to jedzenie zawiera którykolwiek z tych alergenów?',
  },
  korean: {
    lead: '저는 다음에 심각한 알레르기가 있습니다:',
    body: '이 알레르기 유발 물질이 포함된 음식은 소량이라도 먹을 수 없습니다. 먹으면 심한 알레르기 반응이 일어나 치료가 필요합니다.',
    label: '내 알레르기:',
    question: '이 음식에 다음 알레르기 유발 물질이 들어 있나요?',
  },
  thai: {
    lead: 'ฉันแพ้รุนแรงต่อ:',
    body: 'ฉันไม่สามารถกินอาหารที่มีสารก่อภูมิแพ้เหล่านี้ได้ แม้เพียงเล็กน้อย มิฉะนั้นจะเกิดปฏิกิริยาแพ้รุนแรงและต้องได้รับการรักษา',
    label: 'สารที่ฉันแพ้:',
    question: 'อาหารนี้มีสารก่อภูมิแพ้เหล่านี้หรือไม่?',
  },
  vietnamese: {
    lead: 'Tôi bị dị ứng nặng với:',
    body: 'Tôi không thể ăn thực phẩm có bất kỳ chất gây dị ứng nào trong số này, dù chỉ một lượng nhỏ - nếu không sẽ bị phản ứng dị ứng nặng và cần được chăm sóc y tế.',
    label: 'Dị ứng của tôi:',
    question: 'Món này có chứa bất kỳ chất gây dị ứng nào trong số này không?',
  },
  hindi: {
    lead: 'मुझे इनसे गंभीर एलर्जी है:',
    body: 'मैं इनमें से किसी भी एलर्जन वाला भोजन नहीं खा सकता/सकती, भले ही थोड़ी मात्रा में हो - अन्यथा गंभीर एलर्जी प्रतिक्रिया होगी और चिकित्सा सहायता चाहिए होगी।',
    label: 'मेरी एलर्जी:',
    question: 'क्या इस भोजन में इनमें से कोई एलर्जन है?',
  },
};

export function multiStringsFor(code: string): MultiStrings {
  return MULTI[code] ?? EN;
}

/** Soft limit so the CR80 card stays readable. */
export const MAX_MULTI_ALLERGENS = 5;

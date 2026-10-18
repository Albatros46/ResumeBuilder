// CV veri modeli: backend'deki Resume dokumaniyla ayni alan adlarini kullanir.

export const TEMPLATES = [
  { id: 'classic', name: 'Klasik' },
  { id: 'modern', name: 'Modern' },
  { id: 'minimal', name: 'Minimal' },
];

export const COLORS = ['#2563eb', '#0f766e', '#7c3aed', '#be123c', '#c2410c', '#334155', '#0e7490', '#15803d'];

export const SECTION_FIELDS = {
  workExperience: [
    { name: 'role', label: 'Pozisyon' },
    { name: 'company', label: 'Şirket' },
    { name: 'startDate', label: 'Başlangıç', type: 'month' },
    { name: 'endDate', label: 'Bitiş (boş = devam ediyor)', type: 'month' },
    { name: 'description', label: 'Açıklama', type: 'textarea', full: true },
  ],
  education: [
    { name: 'degree', label: 'Bölüm / Derece' },
    { name: 'institution', label: 'Okul' },
    { name: 'startDate', label: 'Başlangıç', type: 'month' },
    { name: 'endDate', label: 'Bitiş', type: 'month' },
  ],
  skills: [
    { name: 'name', label: 'Yetenek' },
    { name: 'progress', label: 'Seviye', type: 'range' },
  ],
  projects: [
    { name: 'title', label: 'Proje adı', full: true },
    { name: 'description', label: 'Açıklama', type: 'textarea', full: true },
    { name: 'github', label: 'GitHub bağlantısı' },
    { name: 'liveDemo', label: 'Canlı demo bağlantısı' },
  ],
  certifications: [
    { name: 'title', label: 'Sertifika' },
    { name: 'issuer', label: 'Veren kurum' },
    { name: 'year', label: 'Yıl' },
  ],
  languages: [
    { name: 'name', label: 'Dil' },
    { name: 'progress', label: 'Seviye', type: 'range' },
  ],
};

export function emptyItem(section) {
  return Object.fromEntries(SECTION_FIELDS[section].map((f) => [f.name, f.type === 'range' ? 60 : '']));
}

// Backend null alan dondurebilir; form ve sablonlar her zaman tam bir nesneyle calisir.
export function normalizeResume(r = {}) {
  const list = (v) => (Array.isArray(v) ? v : []);
  return {
    ...r,
    title: r.title || '',
    template: { theme: 'classic', colorPalette: COLORS[0], ...(r.template || {}) },
    profileInfo: { profilePreviewUrl: '', fullName: '', designation: '', summary: '', ...(r.profileInfo || {}) },
    contactInfo: { email: '', phone: '', location: '', linkedIn: '', github: '', website: '', ...(r.contactInfo || {}) },
    workExperience: list(r.workExperience),
    education: list(r.education),
    skills: list(r.skills),
    projects: list(r.projects),
    certifications: list(r.certifications),
    languages: list(r.languages),
    interests: list(r.interests),
  };
}

// Tum metin alanlari bos olan kayitlari onizlemede gostermemek icin
export function filled(items) {
  return items.filter((item) =>
    typeof item === 'string'
      ? item.trim()
      : Object.entries(item).some(([k, v]) => k !== 'progress' && typeof v === 'string' && v.trim()),
  );
}

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export function formatMonth(value) {
  if (!value) return '';
  const [y, m] = value.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : value;
}

export function formatRange(start, end) {
  if (!start && !end) return '';
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Devam ediyor'}`;
}

export const SAMPLE_RESUME = normalizeResume({
  title: 'Örnek',
  template: { theme: 'modern', colorPalette: '#2563eb' },
  profileInfo: {
    fullName: 'Ayşe Yılmaz',
    designation: 'Full Stack Developer',
    summary: 'Java, Spring Boot ve React ile ölçeklenebilir web uygulamaları geliştiren, 5 yıllık deneyime sahip yazılım geliştirici.',
  },
  contactInfo: { email: 'ayse@example.com', phone: '+90 555 000 00 00', location: 'İstanbul', github: 'github.com/ayse' },
  workExperience: [
    {
      role: 'Senior Developer',
      company: 'TeknoSoft',
      startDate: '2022-03',
      endDate: '',
      description: 'Mikroservis mimarisine geçişi yönettim; API yanıt sürelerini %40 azalttım.',
    },
    { role: 'Software Engineer', company: 'Webcraft', startDate: '2019-06', endDate: '2022-02', description: 'React tabanlı yönetim paneli geliştirdim.' },
  ],
  education: [{ degree: 'Bilgisayar Mühendisliği', institution: 'Ege Üniversitesi', startDate: '2015-09', endDate: '2019-06' }],
  skills: [
    { name: 'Java / Spring Boot', progress: 90 },
    { name: 'React', progress: 80 },
    { name: 'MongoDB', progress: 70 },
  ],
  languages: [
    { name: 'Türkçe', progress: 100 },
    { name: 'İngilizce', progress: 80 },
  ],
  interests: ['Açık kaynak', 'Fotoğrafçılık'],
});

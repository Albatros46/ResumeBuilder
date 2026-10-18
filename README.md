# ResumeBuilder

Spring Boot 4 + MongoDB backend ve React (Vite) arayüzü ile CV oluşturma uygulaması.

```
ResumeBuilder/
├── ResumeBuilder/   # Spring Boot backend (port 8080)
└── frontend/        # React arayüzü (port 5173)
```

## Çalıştırma

Gereksinimler: JDK 25+, Maven, Node 20+, `localhost:27017` üzerinde MongoDB.

```bash
cd ResumeBuilder && mvn spring-boot:run
```

```bash
cd frontend && npm install && npm run dev
```

Tarayıcıda http://localhost:5173 adresini açın. Vite, `/api` ve `/uploads` isteklerini backend'e yönlendirir.

## Özellikler

- Kayıt (BCrypt ile şifrelenmiş parola), e-posta doğrulama, JWT ile giriş
- Profil fotoğrafı / CV fotoğrafı yükleme (`uploads/` klasörüne kaydedilir)
- CV oluşturma, listeleme, düzenleme (otomatik kayıt), silme
- 3 şablon (Klasik, Modern, Minimal) + renk seçimi, canlı önizleme
- Tarayıcının yazdırma penceresiyle PDF olarak indirme

## API

| Metot | Yol | Yetki | Açıklama |
|---|---|---|---|
| POST | `/api/auth/register` | – | Kayıt, doğrulama maili gönderir |
| GET | `/api/auth/verify-email?token=` | – | E-postayı doğrular |
| POST | `/api/auth/resend-verification` | – | Doğrulama mailini tekrar gönderir |
| POST | `/api/auth/login` | – | JWT döner |
| GET | `/api/auth/profile` | JWT | Oturumdaki kullanıcı |
| POST | `/api/auth/upload-image` | – | `image` alanıyla multipart resim yükleme |
| GET/POST | `/api/resumes` | JWT | CV listesi / yeni CV (`{ "title": "..." }`) |
| GET/PUT/DELETE | `/api/resumes/{id}` | JWT | Tek CV işlemleri |

## Ayarlar (`application.properties`)

- `app.auth.require-email-verification` – `false` yapılırsa doğrulama olmadan giriş yapılabilir.
- `app.jwt.secret` – üretimde `JWT_SECRET` ortam değişkeniyle değiştirin.
- Mail gönderilemezse doğrulama bağlantısı backend loguna da yazılır
  (`Verification link for ...`), geliştirme sırasında oradan kopyalanabilir.

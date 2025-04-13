### Email Útvonalak

#### POST /email/send

**Leírás**: Email küldése a megadott címzetteknek.  
 **Bemenet**:

- `from`: Feladó email címe
- `to`: Címzett email címe
- `subject`: Email tárgya
- `body`: Email tartalma  
  **Kimenet**:
- Siker: `{message: 'Email sent successfully', messageId: string}`
- Hiba: `{error: string, message: string}`

### Feladat Útvonalak

#### POST /tasks/process-due

**Leírás**: Ütemezett feladatok kézi feldolgozásának indítása.  
 **Bemenet**: Nincs  
 **Kimenet**:

- Siker: `{message: 'Task processing completed successfully'}`
- Hiba: `{error: string, message: string}`

### Domain Útvonalak

#### POST /domains/verify

**Leírás**: Domain tulajdonjogának ellenőrzése és projekthez rendelése.  
 **Bemenet**:

- `domain`: Domain név (érvényes formátumban)
- `projectId`: Projekt UUID-je  
  **Kimenet**:
- Siker: `{success: true, data: verificationResult}`
- Hiba: `{success: false, error: string}`

#### GET /domains/status/:id

**Leírás**: Domain ellenőrzési státuszának lekérdezése.  
 **Bemenet**:

- `id`: Domain UUID (URL paraméterként)  
  **Kimenet**:
- Siker: `{success: true, data: status}`
- Hiba: `{success: false, error: string}`

#### GET /domains/dns-records/:id

**Leírás**: Domain ellenőrzéshez szükséges DNS rekordok lekérdezése.  
 **Bemenet**:

- `id`: Domain UUID (URL paraméterként)  
  **Kimenet**:
- Siker: `{success: true, data: dnsRecords}`
- Hiba: `{success: false, error: string}`

### Kapcsolat Útvonalak

#### POST /contacts/subscribe

**Leírás**: Kapcsolat feliratkoztatása egy projektre.  
 **Bemenet**:

- `email`: Kapcsolat email címe
- `name`: Kapcsolat neve
- `projectId`: Projekt UUID-je  
  **Kimenet**:
- Új feliratkozás: `{message: 'Successfully subscribed', contact: {...}}`
- Újra feliratkozás: `{message: 'Successfully resubscribed', contact: {...}}`
- Már feliratkozott: `{message: 'Already subscribed', contact: {...}}`
- Hiba: `{error: string}`

#### GET /contacts/unsubscribe

**Leírás**: Kapcsolat leiratkoztatása.  
 **Bemenet**:

- `id`: Kapcsolat UUID (lekérdezési paraméterként)  
  **Kimenet**:
- Siker: `{message: 'Successfully unsubscribed', contact: {...}}`
- Hiba: `{error: string}`

#### POST /contacts/generate-unsubscribe-url

**Leírás**: Leiratkozási URL generálása egy kapcsolathoz.  
 **Bemenet**:

- `contactId`: Kapcsolat UUID  
  **Kimenet**:
- Siker: `{unsubscribeUrl: string}`
- Hiba: `{error: string}`

### Kép Útvonalak

#### POST /images/upload

**Leírás**: Kép feltöltése a szerverre.  
 **Bemenet**:

- `image`: Képfájl (multipart/form-data)
- Támogatott formátumok: JPEG, JPG, PNG, GIF, WebP
- Maximum méret: 5MB  
  **Kimenet**:
- Siker: `{success: true, message: 'Image uploaded successfully', data: {...}}`
- Hiba: `{error: string}`

### Követési Útvonalak

#### GET /track/:id

**Leírás**: Email linkek kattintásainak követése és átirányítás az eredeti URL-re.  
 **Bemenet**:

- `id`: Kattintás UUID (URL paraméterként)  
  **Kimenet**:
- Siker: Átirányítás az eredeti URL-re
- Hiba: 404 vagy 500 státuszkód hibaüzenettel

### GET /health

**Leírás**: API szerver működésének ellenőrzése.  
**Bemenet**: Nincs  
**Kimenet**: `{status: 'OK', timestamp: string}`
